# Likkle Legends — CLAUDE.md

## Project Identity
- **Name**: Likkle Legends (`likkle-legends-mail-club`)
- **Domain**: likkle-legends.com (portal)
- **GitHub**: github.com/RAYKUNJAL/likkle-legends
- **Local path**: `C:\Users\RAY\OneDrive\Documents\GitHub\likkle-legends`
- **Stack**: Next.js (App Router), React, TypeScript, Supabase, Tailwind CSS

## What It Does
Caribbean children's educational platform. Kids earn XP and badges through interactive content: AI buddy chat, stories, songs, games, printable worksheets, radio, and a parent portal. Subscription-based (free + premium tiers) with PayPal checkout. Built around Caribbean culture and identity.

## Key Directories
```
app/
  portal/                  ← Main authenticated area for kids/parents
    page.tsx               ← Portal dashboard (large file ~64KB)
    buddy/                 ← AI character buddy chat
    stories/               ← Story reader with audio
    games/                 ← Educational games (Flag Match, Island Trivia, etc.)
    printables/            ← Downloadable worksheets (31 routes)
    music/ songs/          ← Caribbean music player
    settings/              ← Account/notification settings
    dashboard/             ← Stats & progress
components/
  UserContext.tsx           ← Auth + subscription state
  PremiumStoryReader.tsx    ← Gated story reader
  PremiumVideoPlayer.tsx    ← Gated video player
lib/                        ← Utilities, DB helpers
app/actions/               ← Server actions (story audio, plan generation)
```

## AI Stack
- **Buddy chat**: Gemini (`app/api/character-chat/route.ts`, needs `GEMINI_API_KEY`)
- **Character personas**: `lib/characterConfig.ts` — 5 Legends, Dilly Doubles is the main character
- **Content generator**: Claude (`lib/ai-content-generator/core.ts`, needs `ANTHROPIC_API_KEY`)
- **Voice**: Google TTS (primary), ElevenLabs (fallback)
- **Story audio**: `app/actions/story-audio.ts`

## Critical: Required API Keys
Set in `.env.local` (dev) / `.env.production` (VPS):
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` — AI buddy chat + content agents
- `ANTHROPIC_API_KEY` — content generator
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`
- `RESEND_API_KEY` — email
- `CRON_SECRET` — bearer token for /api/cron/* routes

## Deployment (self-hosted VPS)
- Production runs on a VPS: Docker + Caddy (auto-HTTPS) + cron container — see `deploy/README.md`
- Update: `./deploy/deploy.sh` (docker) or `deploy/update.sh` (auto-detects docker/pm2)
- Auto-deploy on merge to main: `.github/workflows/deploy.yml` (requires VPS_HOST/VPS_USER/VPS_SSH_KEY/VPS_APP_DIR repo secrets)
- PayPal webhooks are handled by the Supabase Edge Function `paypal-webhook-secure` (webhook id 7VW42879W3303404Y)

## Dev Commands
```bash
npm run dev
npm run build
```

## Architecture Notes
- All portal routes behind Supabase auth middleware (`middleware.ts`)
- Feature gating: free vs premium checked in `UserContext.tsx`
- Children profiles linked to parent account
- Portal dashboard (`app/portal/page.tsx`) is the main hub — very large file, be careful editing
- Printables at `app/portal/printables/` — 31 routes under `[slug]`
- OAuth: Google only (Facebook/WhatsApp removed)
- Supabase migrations in `supabase/` directory

## Common Issues
- **Buddy chat broken**: Check `ANTHROPIC_API_KEY`
- **Voice not working**: Google TTS API key / quota
- **Portal 404s**: All portal routes need auth — check middleware and Supabase session
- **Children schema**: `primary_user_id` is nullable (migration `6428af5`)
