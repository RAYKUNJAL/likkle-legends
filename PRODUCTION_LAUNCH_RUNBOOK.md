# Likkle Legends — Production Launch Runbook

## Identity
- **App:** Likkle Legends mail club + kids portal  
- **Domain:** https://www.likklelegends.com (also apex)  
- **Host:** trini `5.78.105.83`  
- **Path:** `/opt/likkle-legends`  
- **Proxy:** Coolify Traefik (`/data/coolify/proxy/dynamic/likkle-legends.yaml`)  
- **Runtime:** Docker Compose service `web` (Next.js standalone) + Alpine `cron`  
- **Auth/DB:** Self-hosted Supabase (`supabase-kong` → GoTrue/PostgREST)

## Critical rule
Self-host only. No Vercel. Do **not** run `docker system prune` on trini without an explicit inventory of other customer stacks.

---

## Current healthy auth topology (2026-07-25)

| Consumer | URL |
|----------|-----|
| Browser / NEXT_PUBLIC | `https://www.likklelegends.com/supabase` |
| Server container | `http://supabase-kong:8000` |
| Traefik | Host `likklelegends.com|www` + `PathPrefix(/supabase)` → strip `/supabase` → `http://supabase-kong:8000` |
| Networks on web | `coolify`, `likkle-legends_default`, `supabase_default` |

If login/signup dies again, check these four first.

---

## Deploy (preferred)

```bash
ssh root@5.78.105.83
cd /opt/likkle-legends
git fetch origin main
git reset --hard origin/main

# Ensure env before build (NEXT_PUBLIC_* are build-args)
grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL)=' .env.production
# Expect:
#   NEXT_PUBLIC_SUPABASE_URL=https://www.likklelegends.com/supabase
#   SUPABASE_URL=http://supabase-kong:8000

set -a && source .env.production && set +a
docker compose build web
docker compose up -d web

# Reattach networks (compose alone may drop them)
docker network connect supabase_default likkle-legends-web-1 2>/dev/null || true
docker network connect coolify likkle-legends-web-1 2>/dev/null || true

# Smoke
curl -sk https://www.likklelegends.com/api/health-check
curl -sk -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  https://www.likklelegends.com/supabase/auth/v1/settings | head -c 200
docker ps --filter name=likkle
```

**Do not** `docker compose up` the git `caddy` service on this host — ports 80/443 belong to Coolify Traefik. Live compose-on-disk may still list Caddy from git; only start `web` (+ `cron` if needed).

Auth emergency script (also in repo):  
`scripts/fix-auth-prod.sh` — rewrites Traefik file, env URLs, rebuilds web.

---

## Smoke checklist (every deploy)

1. `GET /api/health-check` → JSON with **fresh** `timestamp` (not days-old)  
2. `checks.api_keys`, `paypal`, `supabase` true  
3. `GET /supabase/auth/v1/settings` with anon key → 200  
4. Pages: `/` `/login` `/signup` `/pricing` `/shop/birthday-letter` → 200  
5. `/portal` unauthenticated → 307 `/login`  
6. Create a throwaway user (delete after): GoTrue signup + password token  
7. PayPal **sandbox** create/capture only if testing money (never live amount-manip probes on paid accounts)

---

## Rollback

```bash
cd /opt/likkle-legends
# Traefik bak from fix script lives under backups/
ls backups/likkle-legends.yaml.*.bak | tail -1
# restore yaml + reload is automatic for Coolify file provider

git log --oneline -5
git reset --hard <known-good-sha>
set -a && source .env.production && set +a
docker compose build web && docker compose up -d web
docker network connect supabase_default likkle-legends-web-1 2>/dev/null || true
docker network connect coolify likkle-legends-web-1 2>/dev/null || true
```

---

## Env keys required (names only)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,  
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`,  
`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`,  
`CRON_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`

Optional: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, Sentry, Twilio/WhatsApp.

---

## Known open blockers before paid ads

See `LAUNCH_RISK_TRACKER.md`:
1. Birthday letter / PayPal price integrity  
2. Confirm route client-tier fallback  
3. Cron 401s  
4. Disk pressure  

---

## Incident: “login failing / signup broken”

Checklist already hit on 2026-07-25:
1. Public `/supabase/*` returns connection closed / non-200 → Traefik stripPrefix route  
2. Container `SUPABASE_URL` not resolving `supabase-kong` → attach `supabase_default` + fix env  
3. Admin signup no-op → server must allow `http://` internal URL in `lib/supabase-client.ts`  
4. Stale health `api_keys:false` with old timestamp → rebuild; force-dynamic health route  

---

*Runbook updated 2026-07-25 after live auth fix deploy.*
