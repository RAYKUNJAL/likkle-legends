# Journey Stories — naming note (agents)

- **Public product name:** Journey Stories (under Island Helpers).
- **Never** use Social Stories™ / Social Stories as a product name in UI, prompts, metadata, or marketing.
- Internal docs may say “Gray-inspired descriptive routine stories.”
- Not a medical device; parent edit gate required before child sees AI pages.
- **Literal words:** optional parent setting (`languageMode: literal`) for 1–2 short declarative sentences, concrete words, and plain body feelings. Not a diagnosis label in the product UI.
- **Pictures:** one page per HTTP request (`pageIndex`). Do not draw every page inside one serverless call. The wizard queues or illustrates page by page and shows progress. The VPS `journey-worker` also draws one page at a time. Prompts repeat each Island Helper’s existing physical traits (not just the name) and require an uncluttered background, soft lighting, calm island colors, and a composition focused on the page’s action. Busy highly-detailed scenes are a fail. No QStash and no Redis. Without `GEMINI_API_KEY`, words still work and pictures stay pending. Do not invent stub image URLs or new character looks.
