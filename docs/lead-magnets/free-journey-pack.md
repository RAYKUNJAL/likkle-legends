# Lead magnet MVP — Free printable Journey Story pack

**Status:** Draft PR only. Do **not** deploy. Portal agent must not ship this live.

**Brand rule:** Product name is **Journey Stories** (Island Helpers). Never use Social Stories™ / Social Stories in UI, PDF, metadata, or ads.

## Path

| Surface | URL |
|--------|-----|
| Landing (email gate) | `/free/journey-pack` |
| Thank-you / download | `/free/journey-pack/thank-you` |
| PDF (public asset) | `/printables/free-journey-pack.pdf` |
| HTML print view | `/printables/free-journey-pack.html` |
| Download API | `GET /api/free-download?id=journey-story-pack&email=…` |

Optional later: subdomain (`stories.likklelegends.com`) pointing at the same route — not required for MVP.

## Email capture fields

| Field | Required | Notes |
|-------|----------|--------|
| Parent email | Yes | Posted to existing `/api/lead-capture` → `leads` |
| First name | Optional | Existing field |
| Kid age band | Optional | `3-5` / `6-9` / `mixed` / `skip` → `child_age_range` |
| UTM params | Optional | Pass-through from query string |

`lead_magnet_id`: `journey-story-pack`

ESP: repo already uses **Resend** (`lib/email.ts`, `resend` package). Production example has `RESEND_API_KEY`. Welcome email is queued via `email_queue` on capture (same as other magnets). No Mailchimp wiring found.

## Deliverable (3 stories)

1. **R.O.T.I. Tries Something New** — new food / island kitchen  
2. **Steelpan Sam at the Loud Fête** — loud carnival sounds + coping  
3. **Tanty and the Haircut Day** — haircut sensory + breaks  

Each story follows Journey page roles: title → intro → body_sensory → body_coping → conclusion. Literal-ready, kid-safe, no eye-contact / quiet-hands / say-to-unlock language.

Art: **simple black line placeholders** (branded Journey art may still be HOLD). Swap SVGs / Imagen assets later without changing copy.

## Thank-you nurture

1. Auto PDF download (storage bucket when uploaded; else local `public/printables/…`)  
2. Primary CTA → `/signup?plan=free_trial&utm_source=journey_pack`  
3. Secondary CTA → games hub `https://likklelegends.com/games` (`/games` on the thank-you page)
4. HTML print view link for parents who prefer print-from-browser  

## Copy outline (landing)

- **Eyebrow:** 100% Free — No Credit Card Required  
- **H1:** Free Printable Journey Story Pack  
- **Sub:** 3 calm Caribbean Journey Stories for everyday routines  
- **Bullets:** 3 stories · Caribbean routines · special-needs friendly · print at home  
- **CTA:** Download Free Pack  
- **Consent:** emails from Likkle Legends; unsubscribe anytime  
- **Disclaimer (footer / PDF):** Not a medical device. Journey Stories ≠ Social Stories™.

## Blockers before go-live

1. **`RESEND_API_KEY` / `EMAIL_FROM`** set on the host (welcome + nurture actually send).  
2. **Upload PDF** to Supabase `lead-magnets/journey-story-pack.pdf` (optional; local fallback works in draft).  
3. **Insert `lead_magnets` row** for `journey-story-pack` if admin catalog should list it.  
4. **Branded Journey art HOLD** — keep line art until cleared; do not invent new character looks.  
5. **No deploy** until Ray / portal agent explicitly approves.

## Related in-repo

- Journey Stories product: PR #65 (`cursor/island-helpers-literal-journey`), seeds in `lib/island-helpers/journey-stories/seed-scenarios.ts`  
- Existing magnets: `/free/caribbean-abc`, `/free/classroom-pack`  
- Capture: `app/api/lead-capture/route.ts`, `components/LeadCaptureModal.tsx`  
