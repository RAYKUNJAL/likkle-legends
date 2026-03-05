import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

type Tier = "free" | "starter_mailer" | "legends_plus" | "family_legacy";
type Segment = "tanty_spice" | "roti" | "dilly_doubles" | "steelpan_sam";

interface SongManifestRow {
  file: string;
  title?: string;
  artist?: string;
  description?: string;
  category?: Segment;
  tier_required?: Tier;
  is_premium?: boolean;
  is_active?: boolean;
  duration_seconds?: number;
  island_origin?: string;
  age_track?: "all" | "mini" | "big";
  display_order?: number;
  cover_image_url?: string;
  thumbnail_url?: string;
}

interface SongInsert {
  title: string;
  artist: string;
  description: string;
  category: Segment;
  tier_required: Tier;
  audio_url: string;
  duration_seconds: number | null;
  island_origin: string;
  age_track: "all" | "mini" | "big";
  display_order: number;
  cover_image_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
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
  defaultArtist: string;
  defaultCategory: Segment;
  limit?: number;
}

function printUsage(): void {
  console.log(
    [
      "Batch Song Importer",
      "",
      "Usage:",
      "  tsx legacy_scripts/import-songs-batch.ts --from <folder> [options]",
      "",
      "Required:",
      "  --from <folder>                 Local folder containing mp3/wav/m4a files",
      "",
      "Optional:",
      "  --manifest <file>               CSV or JSON manifest mapping metadata to files",
      "  --bucket <name>                 Supabase bucket name (default: songs)",
      "  --folder <name>                 Folder path inside bucket (default: radio/imports)",
      "  --tier <tier>                   Default tier: free|starter_mailer|legends_plus|family_legacy",
      "  --artist <name>                 Default artist (default: Likkle Legends)",
      "  --category <segment>            Default segment: tanty_spice|roti|dilly_doubles|steelpan_sam",
      "  --limit <number>                Import only first N rows/files",
      "  --dry-run                       Preview actions without uploading/inserting",
      "  --skip-existing                 Skip songs with same title+artist in DB",
      "  --upsert-file                   Replace file if storage path already exists",
      "",
      "Manifest fields (CSV/JSON):",
      "  file,title,artist,description,category,tier_required,is_premium,is_active,duration_seconds,island_origin,age_track,display_order,cover_image_url,thumbnail_url",
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

function parseSegment(input?: string): Segment | undefined {
  if (!input) return undefined;
  const normalized = input.toLowerCase();
  if (
    normalized === "tanty_spice" ||
    normalized === "roti" ||
    normalized === "dilly_doubles" ||
    normalized === "steelpan_sam"
  ) {
    return normalized;
  }
  if (normalized === "tanty" || normalized === "story" || normalized === "lullaby" || normalized === "calm") {
    return "tanty_spice";
  }
  if (normalized === "learning" || normalized === "lesson" || normalized === "educational") {
    return "roti";
  }
  if (normalized === "dilly" || normalized === "food") {
    return "dilly_doubles";
  }
  if (normalized === "music" || normalized === "steelpan" || normalized === "vip" || normalized === "soca") {
    return "steelpan_sam";
  }
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

function parseCsvManifest(content: string): SongManifestRow[] {
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
      title: row.title || undefined,
      artist: row.artist || undefined,
      description: row.description || undefined,
      category: parseSegment(row.category),
      tier_required: parseTier(row.tier_required),
      is_premium: parseBoolean(row.is_premium, false),
      is_active: parseBoolean(row.is_active, true),
      duration_seconds: parseNumber(row.duration_seconds),
      island_origin: row.island_origin || undefined,
      age_track:
        row.age_track === "mini" || row.age_track === "big" || row.age_track === "all"
          ? row.age_track
          : undefined,
      display_order: parseNumber(row.display_order),
      cover_image_url: row.cover_image_url || undefined,
      thumbnail_url: row.thumbnail_url || undefined,
    };
  });
}

function parseJsonManifest(content: string): SongManifestRow[] {
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON manifest must be an array of song rows.");
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
      title: typeof rec.title === "string" ? rec.title.trim() : undefined,
      artist: typeof rec.artist === "string" ? rec.artist.trim() : undefined,
      description: typeof rec.description === "string" ? rec.description.trim() : undefined,
      category: parseSegment(typeof rec.category === "string" ? rec.category : undefined),
      tier_required: parseTier(typeof rec.tier_required === "string" ? rec.tier_required : undefined),
      is_premium: parseBoolean(rec.is_premium, false),
      is_active: parseBoolean(rec.is_active, true),
      duration_seconds: parseNumber(rec.duration_seconds),
      island_origin: typeof rec.island_origin === "string" ? rec.island_origin.trim() : undefined,
      age_track:
        rec.age_track === "mini" || rec.age_track === "big" || rec.age_track === "all"
          ? rec.age_track
          : undefined,
      display_order: parseNumber(rec.display_order),
      cover_image_url: typeof rec.cover_image_url === "string" ? rec.cover_image_url.trim() : undefined,
      thumbnail_url: typeof rec.thumbnail_url === "string" ? rec.thumbnail_url.trim() : undefined,
    };
  });
}

function discoverAudioFiles(folder: string): SongManifestRow[] {
  const extensions = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]);
  const files = fs
    .readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => extensions.has(path.extname(name).toLowerCase()));

  return files.map((file, index) => {
    const base = path.basename(file, path.extname(file)).replace(/[-_]+/g, " ").trim();
    return {
      file,
      title: base.length ? base : `Track ${index + 1}`,
      display_order: index,
    };
  });
}

function loadManifest(fromFolder: string, manifestPath?: string): SongManifestRow[] {
  if (!manifestPath) return discoverAudioFiles(fromFolder);

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
  const category = parseSegment(getArgValue(argv, "--category")) || "tanty_spice";
  const limitValue = getArgValue(argv, "--limit");

  return {
    from,
    manifest: getArgValue(argv, "--manifest"),
    bucket: getArgValue(argv, "--bucket") || "songs",
    folder: getArgValue(argv, "--folder") || "radio/imports",
    dryRun: hasFlag(argv, "--dry-run"),
    upsertFile: hasFlag(argv, "--upsert-file"),
    skipExisting: hasFlag(argv, "--skip-existing"),
    defaultTier: tier,
    defaultArtist: getArgValue(argv, "--artist") || "Likkle Legends",
    defaultCategory: category,
    limit: limitValue ? Number(limitValue) : undefined,
  };
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

  const manifestRows = loadManifest(fromFolder, options.manifest);
  const rows = typeof options.limit === "number" && Number.isFinite(options.limit)
    ? manifestRows.slice(0, options.limit)
    : manifestRows;

  if (rows.length === 0) {
    console.log("No songs found to import.");
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Preparing to import ${rows.length} song(s) from ${fromFolder}`);
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
    const artist = row.artist?.trim() || options.defaultArtist;

    if (!fs.existsSync(filePath)) {
      console.error(`[${i + 1}/${rows.length}] Missing file: ${filePath}`);
      failed += 1;
      continue;
    }

    if (options.skipExisting) {
      const { data: existing, error: existingError } = await supabase
        .from("songs")
        .select("id")
        .eq("title", title)
        .eq("artist", artist)
        .limit(1);

      if (existingError) {
        console.error(`[${i + 1}/${rows.length}] Failed checking existing song "${title}": ${existingError.message}`);
        failed += 1;
        continue;
      }

      if (existing && existing.length > 0) {
        console.log(`[${i + 1}/${rows.length}] Skipped existing: ${title} - ${artist}`);
        skipped += 1;
        continue;
      }
    }

    const category = row.category || options.defaultCategory;
    const tier = row.tier_required || options.defaultTier;
    const storageName = `${Date.now()}-${sanitizeFileName(path.basename(row.file))}`;
    const storagePath = `${options.folder.replace(/\/+$/, "")}/${storageName}`;

    const payload: SongInsert = {
      title,
      artist,
      description: row.description?.trim() || "",
      category,
      tier_required: tier,
      audio_url: "",
      duration_seconds: row.duration_seconds ?? null,
      island_origin: row.island_origin?.trim() || "Caribbean",
      age_track: row.age_track || "all",
      display_order: row.display_order ?? i,
      cover_image_url: row.cover_image_url || null,
      thumbnail_url: row.thumbnail_url || null,
      is_active: row.is_active ?? true,
    };

    console.log(`[${i + 1}/${rows.length}] ${title} -> ${storagePath}`);
    if (options.dryRun) {
      imported += 1;
      continue;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const contentType = (() => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === ".mp3") return "audio/mpeg";
        if (ext === ".wav") return "audio/wav";
        if (ext === ".m4a") return "audio/mp4";
        if (ext === ".aac") return "audio/aac";
        if (ext === ".ogg") return "audio/ogg";
        if (ext === ".flac") return "audio/flac";
        return "application/octet-stream";
      })();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(storagePath, buffer, {
          contentType,
          upsert: options.upsertFile,
        });

      if (uploadError || !uploadData) {
        throw new Error(uploadError?.message || "Unknown upload error");
      }

      const { data: publicData } = supabase.storage.from(options.bucket).getPublicUrl(uploadData.path);
      payload.audio_url = publicData.publicUrl;

      const { error: insertError } = await supabase.from("songs").insert(payload);
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
  console.log("Song import complete:");
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Failed:   ${failed}`);
}

main().catch((error) => {
  console.error("Song batch import failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
