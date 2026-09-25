# Lead magnet MVP — Free printable Journey Story pack

**Status:** Ready for review. Do **not** deploy until Ray approves.

**Brand rule:** Product name is **Journey Stories** (Island Helpers). Printables, UI, and ads must not name trademarked social-routine products. Parent disclaimer: educational play supports, not a medical device.

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
3. Secondary CTA → games hub `https://likkle-games.nextbagchaser.com/`  
4. HTML print view link for parents who prefer print-from-browser  

## Copy outline (landing)

- **Eyebrow:** 100% Free — No Credit Card Required  
- **H1:** Free Printable Journey Story Pack  
- **Sub:** 3 calm Caribbean Journey Stories for everyday routines  
- **Bullets:** 3 stories · Caribbean routines · special-needs friendly · print at home  
- **CTA:** Download Free Pack  
- **Consent:** emails from Likkle Legends; unsubscribe anytime  
- **Disclaimer (landing + PDF cover):** Educational play supports. Not a medical device. Do not print a trademarked product name, including in a disclaimer.

## Host env still required before welcome mail sends

Capture writes `leads` and queues `email_queue` (`template_id: WELCOME`). `/api/cron/process-emails` sends through Resend (`lib/email.ts`).

1. **`RESEND_API_KEY`** on the host (required). Without it, `sendEmail` logs and the queue row fails.
2. **`EMAIL_FROM`** optional. Default is `Likkle Legends <noreply@likklelegends.com>`. The address domain must be verified in Resend.
3. Cron bearer **`CRON_SECRET`** already used by `/api/cron/process-emails` — leave it set so the queue drains.

Not required to merge: upload `lead-magnets/journey-story-pack.pdf` (local `public/printables/free-journey-pack.pdf` is the fallback), a `lead_magnets` catalog row (slug capture does not depend on it), or branded Journey art (line art stays until HOLD clears). Do not deploy until Ray approves.

## Related in-repo

- Journey Stories product: PR #65 (`cursor/island-helpers-literal-journey`), seeds in `lib/island-helpers/journey-stories/seed-scenarios.ts`  
- Existing magnets: `/free/caribbean-abc`, `/free/classroom-pack`  
- Capture: `app/api/lead-capture/route.ts`, `components/LeadCaptureModal.tsx`  
