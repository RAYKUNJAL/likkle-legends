# Likkle Legends — Launch Risk Tracker

**Date:** 2026-07-25  
**Repo:** https://github.com/RAYKUNJAL/likkle-legends (`main` @ `0e7d3cf`)  
**Live:** https://www.likklelegends.com (trini Traefik → Docker `likkle-legends-web-1`)  
**Verdict:** **NO-GO for full commercial launch.** Marketing/site is up. **Auth path is restored (signup/login to Supabase works).** Payment/pricing integrity and a few production ops items still block a hard launch.

---

## Overall verdict (2026-07-25)

| Layer | Status |
|-------|--------|
| Site HTTP live | ✅ Done |
| Public pages (`/`, `/pricing`, `/login`, `/signup`, birthday letter) | ✅ Done |
| Auth transport to self-hosted Supabase | ✅ **Fixed this session** |
| Signup/login API (GoTrue via `/supabase`) | ✅ Verified 200 signup + password token |
| Portal auth gate | ✅ `/portal` → 307 login |
| AI keys present in container | ✅ `api_keys: true` (fresh health) |
| PayPal keys present | ✅ health reports `paypal: true` |
| Payment amount integrity | 🔴 Broken (client amount / capture verify) |
| Secret hygiene / archives | 🟡 Treat all keys as potentially exposed historically |
| Crons firing with correct secret | 🔴 Missing / failing (infra audit 401s) |
| Full GTM / mail-club ops | 🟡 Partial |

---

## Status snapshot (done / missing / broken)

| Status | Area |
|--------|------|
| ✅ Done | Homepage, pricing, characters, birthday-letter page, blog, security headers (CSP/XFO/nosniff), portal middleware gate, public Supabase path proxy, live rebuild `0e7d3cf`, health-check no longer stale-cached |
| 🔴 Broken / launch-block | Payment price integrity (`/api/orders/birthday-letter` trusts client `amount`; capture/confirm trust gaps); silent AI mock fallbacks if model 404; product catalog IDs without shop UI |
| 🟡 Missing / external | Cron jobs 401 (secret/network mismatch); HSTS not explicit on app; mail delivery dependent on Resend; WhatsApp not configured; GoTrue `SITE_URL` still points at bare IP for redirects |
| 🟡 Pending ops | Rotate secrets if `.env.local` ever left the machine; disk 95% on trini; compose Traefik labels not in git (live routing is file-based Traefik YAML) |

### Auth (user-reported) — FIXED LIVE

| Before | After |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL=https://www.likklelegends.com/supabase` with **no Traefik route** → browser auth dead | Traefik route `PathPrefix(/supabase)` → `supabase-kong:8000` + stripPrefix |
| `SUPABASE_URL=http://89.167.112.180:8800` fragile/public IP | `SUPABASE_URL=http://supabase-kong:8000` internal DNS |
| `supabaseAdmin` only accepted `https://` public URL → admin client no-op / broken signup | Server clients prefer internal HTTP Kong URL |
| Health frozen at 2026-07-19 `api_keys:false` (`x-nextjs-cache: HIT`) | Force-dynamic health + rebuild; live `api_keys:true`, timestamp fresh |
| Deploy stuck on `21ca9c0` | Live HEAD `0e7d3cf` |

**Proof (trini, 2026-07-25):**
- `GET /api/health-check` → `checks.api_keys:true`, `supabase_host: supabase-kong:8000`
- `GET https://www.likklelegends.com/supabase/auth/v1/settings` → **200**
- Public GoTrue signup + password grant → **200** with `access_token`
- Container env: `NEXT_PUBLIC_SUPABASE_URL=https://www.likklelegends.com/supabase`, `SUPABASE_URL=http://supabase-kong:8000`
- Networks: `coolify likkle-legends_default supabase_default`

---

## Critical (launch-blocking)

| # | Issue | Evidence | Lane | Status |
|---|-------|----------|------|--------|
| C1 | Birthday letter records **client-supplied `amount` as paid** with no PayPal amount check | `app/api/orders/birthday-letter/route.ts` insert `amount: amount`, `status:'paid'` | Payments | 🔴 Open |
| C2 | PayPal capture path weak on amount vs catalog price | `app/api/payments/paypal/capture-order` (code audit) | Payments | 🔴 Open |
| C3 | `/api/payments/paypal/confirm` can fall back to **client tier** when PayPal lookup fails | confirm route (code audit) | Payments | 🔴 Open |
| C4 | Crons 401 / not delivering scheduled content & email | Infra audit: cron container vs `CRON_SECRET` mismatch; health alone is not enough | Infra | 🔴 Open |

Note: code-audit “committed `.env.local`” finding is **downgraded** for this tree — file is gitignored and **not** tracked (`git ls-files .env.local` empty). Still rotate if that file was ever shared.

## High

| # | Issue | Evidence | Lane | Status |
|---|-------|----------|------|--------|
| H1 | Island Brain / some chat routes return **silent 200 mock** AI content | `AI_PRODUCT_AUDIT.md` | AI | 🟡 Open |
| H2 | Hardcoded gmail admin bypass in middleware | `lib/supabase/middleware.ts` | Auth | 🟡 Accept risk / remove before scale |
| H3 | Unauthenticated story content endpoints | `/api/story-data`, `/api/library/stories` | Content leak | 🟡 Open |
| H4 | Free-trial/create-account magic-link patterns | API audit | Auth abuse | 🟡 Open |
| H5 | Disk ~95% on trini | Infra audit | Infra | 🟡 Open (do **not** docker prune blindly) |
| H6 | GoTrue `SITE_URL`/`API_EXTERNAL_URL` still bare server IP | `supabase-auth` env | Auth redirects | 🟡 Open |

## Medium

| # | Issue | Lane | Status |
|---|-------|------|--------|
| M1 | `/api/auth/verify-token` admin if email includes `"admin"` | Auth | 🔴 Open |
| M2 | Music/gamification product IDs have no shop UI | Product | 🟡 Open |
| M3 | Onboarding still multi-step after signup (welcome/goals/plan) | UX | 🟡 Open |
| M4 | Compose in git still describes Caddy; live is Traefik file routing — drift | Deploy | 🟡 Open |
| M5 | HTTP→HTTPS Traefik redirect gaps reported | Infra | 🟡 Open |
| M6 | No migration version tracking on self-hosted DB | Data | 🟡 Open |

## Low

| # | Issue | Status |
|---|-------|--------|
| L1 | No explicit HSTS in Next headers (may rely on edge) | Open |
| L2 | CSP allows `unsafe-eval` / `unsafe-inline` | Accepted for PayPal/Next |
| L3 | `ignoreBuildErrors` / `ignoreDuringBuilds` | Open |
| L4 | Model names with `-exp` suffix risk | Open |

---

## Recommended sprint order

### Day 0 (auth — DONE this session)
- [x] Traefik `/supabase` → Kong stripPrefix
- [x] Fix `SUPABASE_URL` internal
- [x] Fix server admin client HTTP internal URL
- [x] Rebuild web with public Supabase URL baked in
- [x] Verify signup/login token grants

### Day 1 (money path — must fix before ads)
- [ ] Server-side price table for birthday letter + capture amount match
- [ ] Never trust client `tier` on confirm failure — fail closed
- [ ] Smoke sandbox PayPal checkout end-to-end
- [ ] Fix cron secret + network so nurture/email jobs run

### Day 2 (trust + ops)
- [ ] Remove silent AI mocks or label them client-side
- [ ] Gate story library APIs or strip premium bodies
- [ ] Align GoTrue `SITE_URL` to `https://www.likklelegends.com`
- [ ] Free disk safely (images/logs only — never `docker system prune` without inventory)

### Day 3 (launch polish)
- [ ] HSTS, mail club funnel final CRO
- [ ] PRODUCTION smoke checklist + rollback drill

---

## External dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Self-hosted Supabase (Kong :8800 / docker DNS) | Ray / trini | 🟢 Reachable |
| Traefik Coolify proxy | trini | 🟢 Auth path fixed |
| PayPal live/sandbox + webhook ID | Ray | 🟡 Keys present; integrity code still open |
| Gemini API key | Ray | 🟢 Present in container |
| Resend | Ray | 🟡 Present; delivery not E2E tested this session |
| DNS Spaceship → 5.78.105.83 | Ray | 🟢 |
| Meta/WhatsApp | — | 🔴 Not wired |

---

## Code vs live gap (this session end)

| | Commit / note |
|--|--|
| GitHub `main` | `0e7d3cf` fix(auth)… |
| Live container | Rebuilt from `0e7d3cf` |
| Traefik | `/data/coolify/proxy/dynamic/likkle-legends.yaml` includes `/supabase` |
| `.env.production` | Internal Kong + public path URL |

---

*Tracker generated from live probes + parallel code/AI/infra audits on 2026-07-25. Auth fix applied and verified live before marking done.*
