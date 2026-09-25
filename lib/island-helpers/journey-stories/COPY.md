# Journey Stories — naming note (agents)

- **Public product name:** Journey Stories (under Island Helpers).
- **Never** use Social Stories™ / Social Stories as a product name in UI, prompts, metadata, or marketing.
- Internal docs may say “Gray-inspired descriptive routine stories.”
- Not a medical device; parent edit gate required before child sees AI pages.
- **Literal words:** optional parent setting (`languageMode: literal`) for 1–2 short declarative sentences, concrete words, and plain body feelings. Not a diagnosis label in the product UI.
- **Pictures:** the VPS `journey-worker` claims `journey_story_jobs` and draws one page, then the next. No external queue. No Redis. Prompts repeat each Island Helper’s existing physical traits and require an uncluttered background, soft lighting, calm island colors, and a composition focused on the page’s action. Busy highly-detailed scenes are a fail. If `JOURNEY_ART_HOLD=1` or `GEMINI_API_KEY` is missing, the wizard and the words still ship and each page uses a local SVG placeholder. Do not invent stub image URLs or new character looks. A published story with the same scenario, language mode, and cast reuses hosted pictures instead of paying for another image. Literal words fail closed without `OPENROUTER_API_KEY` or `LLM_API_KEY`.
