# 🏝️ Likkle Legends

**likklelegends.com** — the Caribbean children's learning universe for kids ages 3–9.
Kids earn XP and badges through games, stories, songs, AI character buddies, and
printable activities, all rooted in Caribbean culture. Parents get controls,
progress tracking, and a mail club that ships personalized envelopes.

## The Legends

| Character | Role |
|---|---|
| ⭐ **Dilly Doubles** | Main Legend — hype-man best friend & game buddy |
| 👵🏾 **Tanty Spice** | Cultural storyteller, heart of the island |
| 🌶️ **Scorcha Pepper** | Big feelings & brave choices coach |
| 🥭 **Mango Moko** | Observation, balance & perspective guide |
| 🤖 **R.O.T.I.** | Robot study buddy |

Every character has a kid-safe AI chat at `/portal/buddy/<character>` and a
featured game in the portal.

## Stack

- **Next.js 14** (App Router) · React · TypeScript · Tailwind CSS
- **Supabase** — auth, database (RLS), storage
- **Gemini** — character buddy chat & content agents · **Claude** — content generator
- **PayPal** — checkout (app routes + Supabase Edge Functions for webhooks)
- **Resend** — email · **Phaser 3** — Doubles Dash arcade game

## Key areas

```
app/
  portal/            Kid/parent portal (auth) — dashboard, games, stories, buddy chat
  portal/games/      Games hub — 21 games, XP, categories
  games/             Public Game Zone (arcade games incl. Doubles Dash)
  admin/             Admin control center (~40 tools)
  api/payments/      PayPal confirm + webhooks
  api/cron/          Scheduled jobs (content, emails, streaks)
components/games/    Game implementations
lib/characterConfig.ts  The 5 Legends' AI personas & safety rules
supabase/            SQL migrations
deploy/              Self-hosted VPS deployment kit (see below)
```

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (standalone output)
```

Copy `.env.example` → `.env.local` and fill in keys. Required:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. Feature keys: `GEMINI_API_KEY` (buddy chat),
`ANTHROPIC_API_KEY` (content), `RESEND_API_KEY` (email), PayPal keys, `CRON_SECRET`.

## Production (self-hosted VPS)

The site runs on a VPS with open-source tooling: **Docker**, **Caddy**
(automatic HTTPS), and **cron** (replaces Vercel Cron). Full runbook:
[`deploy/README.md`](deploy/README.md).

```bash
# one-time setup on the VPS
cp .env.production.example .env.production   # fill in keys
docker compose --env-file .env.production up -d --build

# every update
./deploy/deploy.sh          # or: deploy/update.sh (auto-detects docker/pm2)
```

Merges to `main` can auto-deploy via GitHub Actions once the `VPS_HOST`,
`VPS_USER`, `VPS_SSH_KEY`, and `VPS_APP_DIR` repository secrets are set —
see `.github/workflows/deploy.yml`.

---
© 2026 Likkle Legends Universe. 🍢 Everything Cook & Curry!
