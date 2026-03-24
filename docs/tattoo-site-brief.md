# Tattoo Site Build Brief

This repo is being repurposed into a tattoo shop website rebuild for Island City Tattoos.

Saved build requirements:

- Modern tattoo-studio landing page
- Built-in ask funnel for consult qualification
- Primary offer: `$500` half sleeve
- Secondary offer: `2 for $100` tattoos that fit inside a business card
- AI SEO blog generator
- AI chatbot for consult questions
- 21st extension layer should be used for future website builds
- Visual direction: premium, dark, modern, sharp, conversion-focused

Implementation notes:

- Public homepage should prioritize conversion over brochure content.
- Funnel should route visitors into the correct offer.
- AI tools should work with `OPENAI_API_KEY` when present and degrade gracefully when absent.
- Local Codex skill/config should preserve this setup for future rebuilds.
