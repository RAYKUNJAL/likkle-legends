# Batch Importers

These scripts let you bulk upload local files to Supabase Storage and create database rows.

## Requirements

- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` or `.env`
- Existing storage buckets:
  - `songs` for audio imports
  - `printables` for coloring/activity sheets

## 1) Songs Importer

Command:

```bash
npm run import:songs:batch -- --from "C:\path\to\mp3-folder" --dry-run
```

Real import example:

```bash
npm run import:songs:batch -- --from "C:\Music\LLRadio" --manifest "legacy_scripts\sample-song-manifest.csv" --skip-existing --category steelpan_sam --tier free
```

Notes:

- Auto-discovers audio files (`.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`, `.flac`) if no manifest is provided.
- Inserts into `songs` table and uploads files to `songs` bucket.
- Supports DJ categories: `tanty_spice`, `roti`, `dilly_doubles`, `steelpan_sam`.

## 2) Printables Importer (Coloring + Activity Sheets)

Command:

```bash
npm run import:printables:batch -- --from "C:\path\to\printables-folder" --dry-run
```

Real import example:

```bash
npm run import:printables:batch -- --from "C:\Printables\Batch1" --manifest "legacy_scripts\sample-printables-manifest.csv" --skip-existing --category coloring --tier free --include-images-as-preview
```

Notes:

- Imports PDF files into `printables` bucket and `printables` table.
- Optional preview image via `preview_file` in manifest or `--include-images-as-preview` (same basename as PDF).
- Categories: `coloring`, `activity`, `worksheet`, `craft`, `general`.

## Manifest Formats

Both importers support:

- `.csv`
- `.json` (array of rows)

Use the sample files in `legacy_scripts/` as templates.
