import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

interface RenameTarget {
  title: string;
  description: string;
  category: "coloring";
}

const RENAME_TARGETS: RenameTarget[] = [
  {
    title: "Tanty Spice Coloring Page",
    description: "Color Tanty Spice in bright island carnival style.",
    category: "coloring",
  },
  {
    title: "Dilly Doubles Coloring Page",
    description: "Color Dilly Doubles with playful Caribbean vibes.",
    category: "coloring",
  },
  {
    title: "Steelpan Sam Coloring Page",
    description: "Color Steelpan Sam and decorate his island stage.",
    category: "coloring",
  },
  {
    title: "R.O.T.I Coloring Page",
    description: "Color R.O.T.I and add your own learning-lab details.",
    category: "coloring",
  },
];

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: rows, error } = await supabase
    .from("printables")
    .select("id,title,created_at")
    .ilike("title", "ChatGPT Image Jan 1, 2026%")
    .order("created_at", { ascending: true })
    .limit(4);

  if (error) {
    throw new Error(`Failed to fetch printables: ${error.message}`);
  }

  const items = rows || [];
  if (items.length === 0) {
    console.log("No matching printables found for rename.");
    return;
  }

  console.log(`Found ${items.length} printable(s) to rename.`);

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const target = RENAME_TARGETS[i];
    if (!target) break;

    const { error: updateError } = await supabase
      .from("printables")
      .update({
        title: target.title,
        description: target.description,
        category: target.category,
      })
      .eq("id", item.id);

    if (updateError) {
      console.error(`Failed renaming "${item.title}": ${updateError.message}`);
      continue;
    }

    console.log(`Renamed "${item.title}" -> "${target.title}"`);
  }

  console.log("Printable rename complete.");
}

main().catch((error) => {
  console.error("Rename script failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
