# Journey Stories — naming note (agents)

- **Public product name:** Journey Stories (under Island Helpers).
- **Never** use Social Stories™ / Social Stories as a product name in UI, prompts, metadata, or marketing.
- Internal docs may say “Gray-inspired descriptive routine stories.”
- Not a medical device; parent edit gate required before child sees AI pages.
- **Literal words:** optional parent setting (`languageMode: literal`) for 1–2 short declarative sentences, concrete words, and plain body feelings. Not a diagnosis label in the product UI.
- **Pictures:** sensory-safe style anchor (soft light, uncluttered background, calm island colors, no text in the image, no scary medical gore) plus the existing library character trait anchors. Do not invent a new character look. Remote art is queued in Postgres (`journey_story_jobs`) and drawn one page at a time by the compose service `journey-worker` (Imagen via `GEMINI_API_KEY`). No QStash and no Redis. Without that key, words still work and pictures stay pending. Simple local pictures remain a page-by-page fallback. Do not invent stub image URLs.
