# Likkle Legends — Infra Readiness Audit

**Date:** 2026-07-25 (UTC)
**Host:** trinibuild-prod (5.78.105.83) — Ubuntu 6.8.0, kernel 6.8.0-124-generic
**App path:** /opt/likkle-legends
**Audit mode:** READ-ONLY. No prune, no restart, no config edits performed.
**Local baseline:** `C:\Users\Banjo\Projects\island-chow-commercial\likkle-legends-main` @ `d7c2b2c` (origin/main HEAD)

---

## TL;DR — Top Infra Blockers (severity ordered)

| # | Blocker | Impact | Severity |
|---|---------|--------|----------|
| 1 | **Health endpoint serves build-time cached response** (`x-nextjs-cache: HIT`, timestamp frozen at 2026-07-19T01:39:36, `api_keys:false` baked) | Health monitoring, cron liveness, and deploy-readiness checks are all unreliable. The "healthy" status is a lie. | 🔴 Critical |
| 2 | **Cron container gets 401 Unauthorized on every scheduled job** (CRON_SECRET mismatch between mounted `deploy/crontab` and `.env.production`) | All scheduled content/email/nurture/streak jobs are silently failing. No content generation, no email digests. | 🔴 Critical |
| 3 | **Disk at 95%** (137G/150G used, 7.8G free; 14.9G build cache reclaimable) | Imminent risk of write failures, DB corruption, container eviction. | 🔴 Critical |
| 4 | **Server is 1 commit behind local main** — live `21ca9c0` vs expected `d7c2b2c` (PR #11 game-zone merge) | Game Zone feature not deployed. | 🟠 High |
| 5 | **3 uncommitted modifications on server** (app/api/health/route.ts, docker-compose.yml, next.config.mjs) + 2 `.bak` files | Drift between repo and live; Traefik labels + Supabase proxy rewrite exist only on server, not in git. | 🟠 High |
| 6 | **Likkle containers NOT on `supabase_default` network** (only `coolify` + `likkle-legends_default`; cron on `caddy_default`) | Web reaches Supabase via public IP `89.167.112.180:8800` instead of internal network. Works but fragile + leaks internal traffic to public interface. | 🟡 Medium |
| 7 | **No migration version tracking** (no `supabase_migrations.schema_migrations` table) | Cannot verify which of 39 migration files are applied. DB has 120 public tables, key tables exist, but drift is undetectable. | 🟡 Medium |
| 8 | **HTTP→HTTPS redirect broken** — `http://likklelegends.com/` returns Traefik 404, not a redirect | Direct HTTP links 404 instead of upgrading. HTTPS works. | 🟡 Medium |

---

## 1. Git: code vs live gap

| | Commit | Date | Subject |
|---|--------|------|---------|
| **Local main (expected)** | `d7c2b2c99caf97a55aea6437a1b584f610d1ae5f` | 2026-07-13 02:02 -0400 | Merge pull request #11 from RAYKUNJAL/claude/likkle-legends-game-zone-AOmTy |
| **Server HEAD (live)** | `21ca9c081b123bd39a8b6912b8a543d38a1c2ade` | 2026-07-12 10:32:31 -0400 | feat: IslandPicker component, onboarding simplification, 4 missing islands with regions |

**Server is 1 commit behind** (`21ca9c0` → `d7c2b2c`). The missing commit is the Game Zone PR #11 merge.

### Uncommitted modifications on server (working tree dirty)
```
 M app/api/health/route.ts          ← health route neutered to liveness-only (no DB check)
 M docker-compose.yml               ← Caddy removed, Traefik labels + coolify network added
 M next.config.mjs                  ← /supabase/* rewrite to http://89.167.112.180:8800 added
 M package-lock.json
 M package.json                     ← sharp@0.33.5 added
?? app/api/health/route.ts.bak-20260718-incident
?? next.config.mjs.bak-20260719-supabase-proxy
```

**Evidence:**
- `docker-compose.yml` diff: removed `caddy` service, added 10 Traefik labels + `coolify` external network. Comment changed from "Open-source tooling only: Docker, Caddy" → "Routes through Coolify Traefik proxy."
- `next.config.mjs` diff: added `rewrites()` mapping `/supabase/:path*` → `http://89.167.112.180:8800/:path*` (public-IP Supabase proxy).
- `app/api/health/route.ts` diff: replaced live `supabase.from('site_settings').select()` DB check with a pure env-var presence check (`databaseConfigured = Boolean(URL && KEY)`). No live DB probe anymore. Backup `.bak-20260718-incident` suggests this was an incident hotfix.

**These changes are NOT in git.** A `git stash`/commit or re-deploy from clean main would lose them.

---

## 2. Containers & networks

```
NAMES                   STATUS                IMAGE                PORTS
likkle-legends-web-1    Up 6 days (healthy)   likkle-legends-web   3000/tcp
likkle-legends-cron-1   Up 2 weeks            alpine:3.20
```

- **web:** RestartCount=0, StartedAt=2026-07-19T01:41:06Z. Process `next-server` PID 1, 11:41 CPU time. Listening on `0.0.0.0:3000`. No host port published (exposed only via Traefik).
- **cron:** RestartCount=0, StartedAt=2026-07-08T12:27:56Z. Cmd `crond -f -l 6`. Alpine 3.20.

### Networks (⚠ mismatch vs expected)
| Container | Networks attached | Expected |
|-----------|-------------------|----------|
| likkle-legends-web-1 | `coolify`, `likkle-legends_default` | + `supabase_default` |
| likkle-legends-cron-1 | `caddy_default` ⚠ | `likkle-legends_default` (to reach `web:3000`) |

**Findings:**
- Web is **NOT** on `supabase_default`. It reaches Supabase via `SUPABASE_URL=http://89.167.112.180:8800` (public IP, port 8800). This works (host curl returned `{"message":"No API key found in request"}` — Kong is live) but routes through the public interface instead of the internal Docker network.
- Cron is on `caddy_default`, not `likkle-legends_default`. Cron jobs target `http://web:3000/...` — DNS resolution depends on whether `caddy_default` and `likkle-legends_default` can route to each other. The 401s suggest cron IS reaching web (it gets an auth error, not a connection error), so cross-network DNS works.

---

## 3. `.env.production` key presence matrix (names only, no values)

All expected keys are **SET**. Lengths shown to confirm non-empty/non-placeholder.

| Key | Status | Length |
|-----|--------|--------|
| `GEMINI_API_KEY` | ✅ SET | 39 |
| `PAYPAL_CLIENT_ID` | ✅ SET | 80 |
| `PAYPAL_CLIENT_SECRET` | ✅ SET | 80 |
| `PAYPAL_WEBHOOK_ID` | ✅ SET | (present) |
| `SUPABASE_URL` | ✅ SET | 26 → `http://89.167.112.180:8800` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ SET | 180 |
| `SUPABASE_ANON_KEY` | ✅ SET | 169 |
| `CRON_SECRET` | ✅ SET | 64 |
| `RESEND_API_KEY` | ✅ SET | 36 |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ SET | 38 → `https://www.likklelegends.com/supabase` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ SET | 169 |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | ✅ SET | (present) |
| `NEXT_PUBLIC_PAYPAL_PLAN_*` (7 keys) | ✅ SET | (present) |
| `NEXT_PUBLIC_APP_URL` | ✅ SET | → `https://www.likklelegends.com` |
| `ANTHROPIC_API_KEY` | ✅ SET | (present) |
| `ELEVENLABS_API_KEY` | ✅ SET | (present) |

**Note:** `NEXT_PUBLIC_SUPABASE_URL` points to `https://www.likklelegends.com/supabase` (self-hosted proxy via the `next.config.mjs` rewrite), NOT to a `*.supabase.co` Vercel URL. **No Vercel residual detected** — the self-host migration is complete on the env side.

---

## 4. Health endpoints

### Internal (host → container IP 10.0.1.3:3000)
```
GET /api/health-check → 200
{"success":true,"timestamp":"2026-07-19T01:39:36.201Z","uptime":22.102782599,
 "environment":"production","checks":{"supabase":true,"api_keys":false}}
```
```
GET /api/health → 200
{"status":"operational","timestamp":"2026-07-19T01:39:36.280Z",
 "services":{"api":{"status":"ok","uptime":22.198302617},
            "database":{"status":"configured"}}}
```

⚠ **Both responses are FROZEN.** Repeated calls 3 seconds apart return the **identical** timestamp (`2026-07-19T01:39:36`) and **identical** `uptime` (`22.10s` / `22.19s`). The container actually started 2026-07-19T01:41:06 and has been up 6 days — real uptime should be ~527,000s, not 22s.

**Root cause:** `x-nextjs-cache: HIT` header on the external response confirms Next.js is serving a **build-time statically generated** page. The route was baked into the standalone build output at `next build` time (2026-07-19 ~01:39), and `new Date()` / `process.uptime()` were evaluated once at build, frozen forever. The modified `/api/health` route (env-var-only check) suffers the same static caching.

**Consequences:**
- `api_keys:false` is a **build-time artifact** (GEMINI_API_KEY is set at runtime, len 39). The health check will always report `false` regardless of reality.
- `supabase:true` is also baked — it only checks `!!process.env.NEXT_PUBLIC_SUPABASE_URL` at build time.
- The Docker healthcheck (`wget http://127.0.0.1:3000/api/health`) passes because the static 200 is returned, so the container shows "healthy" even if Supabase is down.
- **Health monitoring is non-functional.** Any uptime monitor polling this endpoint is getting stale build data, not live status.

### External (https://likklelegends.com/api/health-check)
```
HTTP/2 200
x-nextjs-cache: HIT
cache-control: no-store, no-cache
content-type: application/json
date: Sat, 25 Jul 2026 06:18:44 GMT   ← fresh HTTP date, but BODY is stale

{"success":true,"timestamp":"2026-07-19T01:39:36.201Z","uptime":22.102782599,
 "environment":"production","checks":{"supabase":true,"api_keys":false}}
```

- **First external attempt timed out** (10s, 0 bytes). **Second attempt succeeded.** Intermittent — likely cold connection / transient network blip. Not a persistent outage.
- TLS cert valid, served via Coolify Traefik (`coolify-proxy`, 80/443/8080 published).
- **HTTP (port 80) returns Traefik 404** instead of redirecting to HTTPS. The `redirect-to-https` middleware is attached to `ll-http` router but the router's Host rule (`likklelegends.com || www.likklelegends.com`) should match — yet `curl http://likklelegends.com/` gets a raw Traefik 404. The redirect middleware may be misconfigured or the router isn't winning the Host match. HTTPS works; HTTP does not redirect.

---

## 5. Traefik routing

Configured via **Docker Compose labels** on the `web` service (not a dynamic config file):

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.ll-http.entryPoints=http"
  - 'traefik.http.routers.ll-http.rule=Host(`likklelegends.com`) || Host(`www.likklelegends.com`)'
  - "traefik.http.routers.ll-http.middlewares=redirect-to-https"
  - "traefik.http.routers.ll-https.entryPoints=https"
  - 'traefik.http.routers.ll-https.rule=Host(`likklelegends.com`) || Host(`www.likklelegends.com`)'
  - "traefik.http.routers.ll-https.tls=true"
  - "traefik.http.routers.ll-https.tls.certresolver=letsencrypt"
  - "traefik.http.routers.ll-https.service=ll-svc"
  - "traefik.http.services.ll-svc.loadbalancer.server.port=3000"
networks: [default, coolify]
```

- HTTPS router: working (200 on 443 with correct Host).
- HTTP router: **not redirecting** — returns 404. The `redirect-to-https` middleware is referenced but Coolify's Traefik may not have this middleware defined globally (it's a Coolify-managed proxy, middleware names must match Coolify's). This is the likely cause of the HTTP 404.
- A host crontab runs `/opt/trinibuild/monitor/traefik-config-guard.sh` every 10 min to validate dynamic configs in `/data/coolify/proxy/dynamic/` — but the likkle routing is in labels, not dynamic config, so the guard doesn't cover it.
- No likkle-specific dynamic config file found in the standard Coolify dynamic dir (not checked exhaustively — read-only).

---

## 6. Supabase reachability & Vercel residual

- **Self-hosted Supabase is live** on the same host: 12 `supabase-*` containers, all `Up 7 days`, most healthy. `supabase-kong` publishes `0.0.0.0:8800->8000/tcp`.
- **Web container reaches Supabase via public IP** `http://89.167.112.180:8800` (Kong gateway). Confirmed reachable: returns `{"message":"No API key found in request"}` (401 — expected without API key).
- **`NEXT_PUBLIC_SUPABASE_URL=https://www.likklelegends.com/supabase`** — browser traffic is proxied through the Next.js app via the `next.config.mjs` rewrite to `http://89.167.112.180:8800/:path*`. This keeps the public-facing Supabase URL on the same origin (good for CSP/cookies).
- **No Vercel residual detected.** No `*.vercel.app` URLs, no `NEXT_PUBLIC_SUPABASE_URL` pointing to `*.supabase.co`. The self-host migration is complete.
- **Gap:** Web container is not on `supabase_default` network, so it cannot use the internal `supabase-kong:8000` hostname. It depends on the public IP being reachable from inside the container (it is, via the host's `5.78.105.83`/`89.167.112.180` interfaces). If the public IP changes or the Kong port binding changes, Supabase connectivity breaks.

---

## 7. Cron scheduling

**Mechanism:** Docker cron container (`likkle-legends-cron-1`, alpine:3.20, `crond -f -l 6`) with `deploy/crontab` mounted read-only to `/etc/crontabs/root`. **No host crontab** for likkle jobs (host crontab only has the Traefik config guard).

**Scheduled jobs (UTC):**
| Schedule | Endpoint |
|----------|----------|
| `0 8 * * *` | `/api/cron/content-queue` |
| `0 9 * * 1` | `/api/cron/content-generation` |
| `0 9 * * 0` | `/api/cron/process-emails` |
| `0 18 * * *` | `/api/cron/process-emails?type=nudge` |
| `0 9 * * *` | `/api/cron/nurture` |
| `5 0 * * *` | `/api/cron/streak-freeze` |
| `0 8 * * *` | `/api/cron/generate-blog` |

All use `wget -qO- --header="Authorization: Bearer ***" http://web:3000/api/cron/...` (secret redacted in the mounted file as `***` — but the actual mounted file has the real token; only the display in `cat` showed `***` because... actually the cat output literally showed `***`, meaning **the crontab file on disk contains literal `***` as the bearer token, not the real secret**).

🔴 **CRITICAL:** The `deploy/crontab` file contains `Bearer ***` (literal asterisks) as the authorization header. The web container's cron routes expect `CRON_SECRET` (len 64 from `.env.production`). **Every cron job is returning 401 Unauthorized.** Confirmed by cron container logs:
```
wget: server returned error: HTTP/1.1 401 Unauthorized
wget: server returned error: HTTP/1.1 401 Unauthorized
wget: server returned error: HTTP/1.1 401 Unauthorized
... (repeated for every job run)
```
**All scheduled jobs are failing.** No content generation, no email digests, no nurture sequences, no streak freezes have been running. The cron container has been up 2 weeks — 2 weeks of failed jobs.

> Note: The `***` in the cat output could be a redaction artifact, but the 401 errors in the logs confirm the token mismatch is real. Either the crontab has a wrong/stale token, or it literally contains `***`.

---

## 8. Disk & restart loops

```
Filesystem      Size  Used Avail Use%
/dev/sda1       150G  137G  7.8G  95%
```
🔴 **Disk at 95% — 7.8G free.** Critical.

```
Docker disk:
  Images:       48 total, 59.18GB, 3.3GB reclaimable (5%)
  Containers:   59 total, 7.7GB, 177MB reclaimable
  Volumes:      30 total, 1.29GB, 546MB reclaimable
  Build Cache:  14.9GB, 14.9GB reclaimable (100%)  ← biggest win
```

**No restart loops:** both likkle containers have `RestartCount=0`. Web up 6 days, cron up 2 weeks.

**Recommended (non-destructive, not performed):** `docker builder prune` would reclaim ~14.9G build cache. `docker image prune` ~3.3G. Do NOT run `docker system prune -a` (would remove unused images other apps need). The build cache alone would bring disk to ~85%.

---

## 9. Deploy age vs git HEAD

| | Timestamp |
|---|-----------|
| Server git HEAD | 2026-07-12 10:32:31 -0400 |
| Web container created | 2026-07-19T01:41:05Z |
| Web container started | 2026-07-19T01:41:06Z |
| Frozen health timestamp (build time) | 2026-07-19T01:39:36Z |
| Audit time | 2026-07-25T06:18:50Z |

- Container was **built/redeployed on 2026-07-19**, 7 days after the git HEAD commit (2026-07-12). The build includes the uncommitted working-tree changes (Traefik labels, health route neuter, supabase proxy rewrite).
- Last deploy: **6 days ago**. No restart since.
- The `d7c2b2c` commit (2026-07-13) has never been deployed — it postdates the server's HEAD but predates the container build. The working-tree changes were applied on top of `21ca9c0` without committing.

---

## 10. Migrations

- **39 migration files** in `/opt/likkle-legends/supabase/migrations/` (oldest `20240210_gamification.sql`, newest `20260712_launch_missing_tables.sql`).
- **No `supabase_migrations.schema_migrations` tracking table** exists. Migrations were applied manually (likely via `psql` or Supabase Studio), not via `supabase db push` / `supabase migration list`.
- **`supabase` CLI is NOT installed** on the server.
- **DB is populated:** 120 tables in `public` schema. Key tables confirmed present: `children`, `profiles`, `site_settings`, `blog_posts`, `stories`, `subscriptions`, `orders`.
- **Cannot verify migration drift** without a tracking table. The newest file (`20260712_launch_missing_tables.sql`) matches the git HEAD date — consistent with migrations being current as of the deployed commit, but unconfirmable beyond that.

---

## Summary matrix

| Check | Status | Notes |
|-------|--------|-------|
| Git HEAD vs expected `d7c2b2c` | ⚠ Behind | Live `21ca9c0`, 1 commit behind (Game Zone PR #11) |
| Uncommitted server changes | ⚠ Drift | 3 modified files + 2 `.bak` (Traefik, health, supabase proxy) |
| Containers running | ✅ | web (healthy, 6d), cron (2w). No restart loops. |
| Networks | ⚠ | Web not on `supabase_default`; cron on `caddy_default`. Works via public IP. |
| Env keys present | ✅ | All 17+ keys SET and non-empty. |
| Internal health | 🔴 Stale | Frozen build-time response. `api_keys:false` is a lie. |
| External health | 🟡 Flaky | Works on 2nd try. HTTP 404 (no redirect). HTTPS OK. |
| Traefik routing | 🟡 | HTTPS works; HTTP redirect broken (middleware mismatch?). |
| Supabase reachability | ✅ | Live, reachable via public IP. No Vercel residual. |
| Cron scheduling | 🔴 Broken | All jobs 401 Unauthorized (CRON_SECRET mismatch). 2 weeks of failures. |
| Disk space | 🔴 95% | 7.8G free. 14.9G build cache reclaimable. |
| Restart loops | ✅ | RestartCount=0 on both containers. |
| Deploy age | ℹ️ | 6 days. Built 2026-07-19 from `21ca9c0` + uncommitted changes. |
| Migrations applied | 🟡 Untracked | 39 files, no version tracking. 120 tables present. |

---

## Recommended next actions (not performed — read-only audit)

1. **Fix cron auth:** Investigate whether `deploy/crontab` contains literal `***` or a stale token. Replace with the real `CRON_SECRET` value (or use env substitution `Bearer ${CRON_SECRET}` if the cron container's shell supports it — note alpine `crond` does NOT do env expansion in crontabs by default; may need a wrapper script).
2. **Fix health endpoint static caching:** Add `export const dynamic = 'force-dynamic'` (or `revalidate=0`) to both `/api/health/route.ts` and `/api/health-check/route.ts` to prevent build-time staticization. Redeploy.
3. **Reclaim disk:** `docker builder prune -f` (14.9G) — safe, non-destructive. Avoid `-a` variants.
4. **Commit or discard server drift:** The Traefik labels + supabase proxy rewrite are essential for the current deployment. Commit them to a branch or they'll be lost on next `git pull` deploy.
5. **Deploy `d7c2b2c`:** Once drift is committed, deploy the Game Zone PR #11 merge.
6. **Fix HTTP→HTTPS redirect:** Verify the `redirect-to-https` middleware exists in Coolify's Traefik (it may be named differently, e.g., `coolify-redirect`). Or add a catch-all HTTP router.
7. **Attach web to `supabase_default`:** Add `supabase_default` to the web service's networks and change `SUPABASE_URL` to `http://supabase-kong:8000` to avoid public-IP dependency.
8. **Set up migration tracking:** Either install `supabase` CLI and use `supabase migration list`, or create a `schema_migrations` table manually.

---

*Audit performed via SSH (root@5.78.105.83). No destructive commands run. All checks read-only: `git log/status/diff`, `docker ps/inspect/exec/port/logs`, `curl`, `wget`, `psql SELECT`, `df`, `ls/cat`, `iptables -L`, `nft list`. No prune, no restart, no config writes.*
