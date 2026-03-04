import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

type Tier = "free" | "starter_mailer" | "legends_plus" | "family_legacy";
type PrintableCategory = "coloring" | "activity" | "worksheet" | "craft" | "general";

interface PrintableManifestRow {
  file: string;
  preview_file?: string;
  title?: string;
  description?: string;
  category?: PrintableCategory;
  tier_required?: Tier;
  is_active?: boolean;
  age_track?: "all" | "mini" | "big";
  island_origin?: string;
  display_order?: number;
}

interface PrintableInsert {
  title: string;
  description: string;
  category: PrintableCategory;
  tier_required: Tier;
  pdf_url: string;
  preview_url: string | null;
  is_active: boolean;
  age_track: "all" | "mini" | "big";
  island_origin: string;
  display_order: number;
}

interface CliOptions {
  from: string;
  manifest?: string;
  bucket: string;
  folder: string;
  dryRun: boolean;
  upsertFile: boolean;
  skipExisting: boolean;
  defaultTier: Tier;
  defaultCategory: PrintableCategory;
  includeImagesAsPreview: boolean;
  limit?: number;
}

function printUsage(): void {
  console.log(
    [
      "Batch Printable Importer",
      "",
      "Usage:",
      "  tsx legacy_scripts/import-printables-batch.ts --from <folder> [options]",
      "",
      "Required:",
      "  --from <folder>                 Local folder containing PDF files",
      "",
      "Optional:",
      "  --manifest <file>               CSV or JSON manifest",
      "  --bucket <name>                 Supabase bucket name (default: printables)",
      "  --folder <name>                 Folder path inside bucket (default: worksheets/imports)",
      "  --tier <tier>                   Default tier: free|starter_mailer|legends_plus|family_legacy",
      "  --category <cat>                Default category: coloring|activity|worksheet|craft|general",
      "  --limit <number>                Import only first N rows/files",
      "  --dry-run                       Preview only",
      "  --skip-existing                 Skip printables with same title",
      "  --upsert-file                   Replace storage file if path exists",
      "  --include-images-as-preview     Auto-pick image with same basename as preview",
      "",
      "Manifest fields (CSV/JSON):",
      "  file,preview_file,title,description,category,tier_required,is_active,age_track,island_origin,display_order",
    ].join("\n"),
  );
}

function getArgValue(args: string[], key: string): string | undefined {
  const idx = args.indexOf(key);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function hasFlag(args: string[], key: string): boolean {
  return args.includes(key);
}

function parseTier(input?: string): Tier | undefined {
  if (!input) return undefined;
  if (
    input === "free" ||
    input === "starter_mailer" ||
    input === "legends_plus" ||
    input === "family_legacy"
  ) {
    return input;
  }
  return undefined;
}

function parseCategory(input?: string): PrintableCategory | undefined {
  if (!input) return undefined;
  const normalized = input.toLowerCase();
  if (
    normalized === "coloring" ||
    normalized === "activity" ||
    normalized === "worksheet" ||
    normalized === "craft" ||
    normalized === "general"
  ) {
    return normalized;
  }
  if (normalized === "activities") return "activity";
  return undefined;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return fallback;
  const v = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;
  return fallback;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);

  return cells.map((cell) => cell.trim());
}

function parseCsvManifest(content: string): PrintableManifestRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return {
      file: row.file,
      preview_file: row.preview_file || undefined,
      title: row.title || undefined,
      description: row.description || undefined,
      category: parseCategory(row.category),
      tier_required: parseTier(row.tier_required),
      is_active: parseBoolean(row.is_active, true),
      age_track:
        row.age_track === "mini" || row.age_track === "big" || row.age_track === "all"
          ? row.age_track
          : undefined,
      island_origin: row.island_origin || undefined,
      display_order: parseNumber(row.display_order),
    };
  });
}

function parseJsonManifest(content: string): PrintableManifestRow[] {
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON manifest must be an array of printable rows.");
  }

  return parsed.map((row, idx) => {
    if (!row || typeof row !== "object") {
      throw new Error(`Invalid manifest row at index ${idx}.`);
    }
    const rec = row as Record<string, unknown>;
    if (typeof rec.file !== "string" || rec.file.trim().length === 0) {
      throw new Error(`Missing "file" in manifest row at index ${idx}.`);
    }

    return {
      file: rec.file.trim(),
      preview_file: typeof rec.preview_file === "string" ? rec.preview_file.trim() : undefined,
      title: typeof rec.title === "string" ? rec.title.trim() : undefined,
      description: typeof rec.description === "string" ? rec.description.trim() : undefined,
      category: parseCategory(typeof rec.category === "string" ? rec.category : undefined),
      tier_required: parseTier(typeof rec.tier_required === "string" ? rec.tier_required : undefined),
      is_active: parseBoolean(rec.is_active, true),
      age_track:
        rec.age_track === "mini" || rec.age_track === "big" || rec.age_track === "all"
          ? rec.age_track
          : undefined,
      island_origin: typeof rec.island_origin === "string" ? rec.island_origin.trim() : undefined,
      display_order: parseNumber(rec.display_order),
    };
  });
}

function discoverPrintables(folder: string, includeImagesAsPreview: boolean): PrintableManifestRow[] {
  const entries = fs.readdirSync(folder, { withFileTypes: true }).filter((entry) => entry.isFile());
  const pdfs = entries.filter((entry) => path.extname(entry.name).toLowerCase() === ".pdf");
  const images = new Set(
    entries
      .filter((entry) => [".png", ".jpg", ".jpeg", ".webp"].includes(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name.toLowerCase()),
  );

  return pdfs.map((entry, index) => {
    const baseName = path.basename(entry.name, ".pdf");
    const previewFile = includeImagesAsPreview
      ? [".png", ".jpg", ".jpeg", ".webp"]
          .map((ext) => `${baseName}${ext}`.toLowerCase())
          .find((candidate) => images.has(candidate))
      : undefined;

    return {
      file: entry.name,
      preview_file: previewFile,
      title: baseName.replace(/[-_]+/g, " ").trim() || `Printable ${index + 1}`,
      display_order: index,
    };
  });
}

function loadManifest(fromFolder: string, manifestPath: string | undefined, includeImagesAsPreview: boolean): PrintableManifestRow[] {
  if (!manifestPath) return discoverPrintables(fromFolder, includeImagesAsPreview);

  const absoluteManifest = path.resolve(process.cwd(), manifestPath);
  if (!fs.existsSync(absoluteManifest)) {
    throw new Error(`Manifest not found: ${absoluteManifest}`);
  }

  const raw = fs.readFileSync(absoluteManifest, "utf8");
  if (absoluteManifest.toLowerCase().endsWith(".json")) {
    return parseJsonManifest(raw);
  }
  if (absoluteManifest.toLowerCase().endsWith(".csv")) {
    return parseCsvManifest(raw);
  }
  throw new Error("Manifest must be .json or .csv");
}

function parseOptions(argv: string[]): CliOptions {
  if (hasFlag(argv, "--help") || hasFlag(argv, "-h")) {
    printUsage();
    process.exit(0);
  }

  const from = getArgValue(argv, "--from");
  if (!from) {
    printUsage();
    throw new Error("Missing required --from argument.");
  }

  const tier = parseTier(getArgValue(argv, "--tier")) || "free";
  const category = parseCategory(getArgValue(argv, "--category")) || "coloring";
  const limitValue = getArgValue(argv, "--limit");

  return {
    from,
    manifest: getArgValue(argv, "--manifest"),
    bucket: getArgValue(argv, "--bucket") || "printables",
    folder: getArgValue(argv, "--folder") || "worksheets/imports",
    dryRun: hasFlag(argv, "--dry-run"),
    upsertFile: hasFlag(argv, "--upsert-file"),
    skipExisting: hasFlag(argv, "--skip-existing"),
    defaultTier: tier,
    defaultCategory: category,
    includeImagesAsPreview: hasFlag(argv, "--include-images-as-preview"),
    limit: limitValue ? Number(limitValue) : undefined,
  };
}

function getMimeForFile(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const fromFolder = path.resolve(process.cwd(), options.from);
  if (!fs.existsSync(fromFolder)) {
    throw new Error(`Folder not found: ${fromFolder}`);
  }

  const manifestRows = loadManifest(fromFolder, options.manifest, options.includeImagesAsPreview);
  const rows = typeof options.limit === "number" && Number.isFinite(options.limit)
    ? manifestRows.slice(0, options.limit)
    : manifestRows;

  if (rows.length === 0) {
    console.log("No printables found to import.");
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Preparing to import ${rows.length} printable(s) from ${fromFolder}`);
  if (options.dryRun) {
    console.log("Dry run enabled: no uploads or inserts will be performed.");
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const filePath = path.resolve(fromFolder, row.file);
    const title = row.title?.trim() || path.basename(row.file, path.extname(row.file));

    if (!fs.existsSync(filePath)) {
      console.error(`[${i + 1}/${rows.length}] Missing file: ${filePath}`);
      failed += 1;
      continue;
    }

    if (path.extname(filePath).toLowerCase() !== ".pdf") {
      console.error(`[${i + 1}/${rows.length}] Unsupported printable (must be PDF): ${filePath}`);
      failed += 1;
      continue;
    }

    if (options.skipExisting) {
      const { data: existing, error: existingError } = await supabase
        .from("printables")
        .select("id")
        .eq("title", title)
        .limit(1);

      if (existingError) {
        console.error(`[${i + 1}/${rows.length}] Failed checking existing printable "${title}": ${existingError.message}`);
        failed += 1;
        continue;
      }

      if (existing && existing.length > 0) {
        console.log(`[${i + 1}/${rows.length}] Skipped existing: ${title}`);
        skipped += 1;
        continue;
      }
    }

    const baseStorageName = `${Date.now()}-${sanitizeFileName(path.basename(row.file))}`;
    const pdfStoragePath = `${options.folder.replace(/\/+$/, "")}/${baseStorageName}`;

    let previewLocalPath: string | undefined;
    if (row.preview_file) {
      const candidate = path.resolve(fromFolder, row.preview_file);
      if (fs.existsSync(candidate)) {
        previewLocalPath = candidate;
      } else {
        console.warn(`[${i + 1}/${rows.length}] Preview file not found, continuing without preview: ${candidate}`);
      }
    }

    const payload: PrintableInsert = {
      title,
      description: row.description?.trim() || "",
      category: row.category || options.defaultCategory,
      tier_required: row.tier_required || options.defaultTier,
      pdf_url: "",
      preview_url: null,
      is_active: row.is_active ?? true,
      age_track: row.age_track || "all",
      island_origin: row.island_origin?.trim() || "Caribbean",
      display_order: row.display_order ?? i,
    };

    console.log(`[${i + 1}/${rows.length}] ${title} -> ${pdfStoragePath}`);
    if (options.dryRun) {
      imported += 1;
      continue;
    }

    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const { data: uploadedPdf, error: uploadPdfError } = await supabase.storage
        .from(options.bucket)
        .upload(pdfStoragePath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: options.upsertFile,
        });

      if (uploadPdfError || !uploadedPdf) {
        throw new Error(uploadPdfError?.message || "Unknown PDF upload error");
      }

      const { data: pdfUrlData } = supabase.storage.from(options.bucket).getPublicUrl(uploadedPdf.path);
      payload.pdf_url = pdfUrlData.publicUrl;

      if (previewLocalPath) {
        const previewName = `${Date.now()}-${sanitizeFileName(path.basename(previewLocalPath))}`;
        const previewStoragePath = `${options.folder.replace(/\/+$/, "")}/previews/${previewName}`;
        const previewBuffer = fs.readFileSync(previewLocalPath);
        const { data: uploadedPreview, error: uploadPreviewError } = await supabase.storage
          .from(options.bucket)
          .upload(previewStoragePath, previewBuffer, {
            contentType: getMimeForFile(previewLocalPath),
            upsert: options.upsertFile,
          });

        if (uploadPreviewError || !uploadedPreview) {
          throw new Error(uploadPreviewError?.message || "Unknown preview upload error");
        }

        const { data: previewUrlData } = supabase.storage.from(options.bucket).getPublicUrl(uploadedPreview.path);
        payload.preview_url = previewUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("printables").insert(payload);
      if (insertError) {
        throw new Error(insertError.message);
      }

      imported += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${i + 1}/${rows.length}] Failed importing "${title}": ${message}`);
      failed += 1;
    }
  }

  console.log("");
  console.log("Printable import complete:");
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Failed:   ${failed}`);
}

main().catch((error) => {
  console.error("Printable batch import failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
