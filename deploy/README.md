# Likkle Legends — Self-Hosted VPS Deployment

Everything here is open source: **Docker** (containers), **Caddy** (web server
with automatic free HTTPS from Let's Encrypt), and **Alpine cron** (scheduled
jobs). No Vercel, no paid services.

The stack (defined in `docker-compose.yml` at the repo root):

| Container | What it does |
|---|---|
| `web`   | The Next.js app (standalone build) on the internal network |
| `caddy` | Public entry: ports 80/443, auto-HTTPS, proxies to `web` |
| `cron`  | Fires the app's `/api/cron/*` jobs on schedule (replaces Vercel Cron) |

Supabase (database, auth, storage) stays on supabase.com — nothing to host
for it. PayPal, Resend, Gemini, and Anthropic are external APIs.

---

## One-time setup

### 1. Point DNS at the VPS
At your DNS provider, create **A records** for `likklelegends.com` and
`www.likklelegends.com` pointing to the VPS's public IP. (Caddy needs this to
issue the HTTPS certificate automatically.)

### 2. Install Docker (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com | sh
```

### 3. Clone the repo
```bash
git clone https://github.com/RAYKUNJAL/likkle-legends.git
cd likkle-legends
```

### 4. Create your environment file
```bash
cp .env.production.example .env.production
nano .env.production           # fill in every key
openssl rand -hex 32           # paste the output as CRON_SECRET
chmod 600 .env.production
```
The Supabase anon key is in your Supabase dashboard → Settings → API.
The service-role key is on the same page (keep it secret — it bypasses all
row-level security).

### 5. Launch
```bash
docker compose --env-file .env.production up -d --build
```
First build takes a few minutes. Then:
```bash
docker compose ps                      # all three services "running"
docker compose logs -f web            # watch app logs
curl -s https://www.likklelegends.com/api/health
```

### 6. Update the PayPal webhook URL
In the PayPal developer dashboard, point your webhook at
`https://www.likklelegends.com/api/payments/paypal/webhooks`
(subscription renewals/cancellations are processed there).

---

## Deploying updates

```bash
cd likkle-legends
./deploy/deploy.sh
```
That pulls the latest `main`, rebuilds the app image, restarts containers,
and health-checks the app before finishing.

---

## Journey Stories pictures

Picture jobs are rows in Supabase (`journey_story_jobs`). The parent wizard
sends **one `pageIndex` per request** and shows progress per page. Do not draw
every page image inside one serverless request.

**QStash (primary wake-up)** when all three are set in the server env (never in git):

- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`

The adult API inserts the row, publishes that one page to QStash, and returns
`200` with the story id immediately. QStash calls
`POST /api/island-helpers/journey-stories/jobs/worker` on
`NEXT_PUBLIC_APP_URL`. The route checks the `Upstash-Signature` header and
rejects unsigned or partially configured calls. It draws that single page,
writes `journey_story_pages`, and Realtime streams the picture. A retry is
safe: `claim_journey_story_job_by_id` skips a job that is already done or
still running. There is no Redis service in compose.

If any of the three QStash vars is missing, publish is skipped and the parent
UI does not crash. `POST /api/island-helpers/journey-stories/illustrate` still
illustrates one `pageIndex` at a time, and the on-host worker below can claim
the Postgres row.

**On-host backup (`journey-worker`)** in `docker-compose.yml` joins
`supabase_default`, has no host port, and does not change
`web` `traefik.enable=false`. It claims with `claim_journey_story_job()`
(`FOR UPDATE SKIP LOCKED`) and draws pages one after another when
`GEMINI_API_KEY` is set.

Apply `supabase/migrations/20260925_journey_story_jobs.sql` on the database
once. Without `GEMINI_API_KEY`, picture jobs fail closed. The words still work,
and a parent can use simple local pictures page by page. Set
`GEMINI_IMAGE_MODEL` only to override Imagen (default `imagen-3.0-generate-002`).

A published Journey Story with the same scenario, literal/standard mode, and
cast (`library_key`) reuses hosted page images instead of calling Imagen again.

```bash
docker compose --env-file .env.production up -d --build journey-worker
docker compose logs -f journey-worker
```

Code building deploys this with the rest of the compose stack at
`/opt/likkle-legends`. Set the three QStash names in the server env before
compose. Do not commit the values.

---

## Scheduled jobs

`deploy/crontab` mirrors the schedules that used to live in `vercel.json`
(content queue, blog generation, nurture emails, streak freeze, …). The cron
container authenticates to the app with `CRON_SECRET`. To check jobs are
firing:
```bash
docker compose logs cron | tail
```
Edit `deploy/crontab` and run `docker compose restart cron` to change
schedules.

---

## The agent orchestrator (Goose ↔ Paperclip)

`scripts/agent-orchestrator.py` bridges the paperclip control-plane and the
`goose` container already on this VPS. It is **not** part of the compose
stack; schedule it with the host's crontab if you want it running:
```bash
crontab -e
# every 10 minutes:
*/10 * * * * cd /path/to/likkle-legends && SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/agent-orchestrator.py >> /var/log/agent-orchestrator.log 2>&1
```

---

## Troubleshooting

- **HTTPS not working** — DNS must already resolve to the VPS; check
  `docker compose logs caddy` for certificate errors. Ports 80/443 must be
  open in your VPS firewall (`ufw allow 80,443/tcp`).
- **App restarts in a loop** — `docker compose logs web`; usually a missing
  `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` in `.env.production`.
- **Cron jobs 401** — `CRON_SECRET` in `.env.production` must be non-empty;
  the cron container and web container read the same file.
- **Buddy chat silent** — set `GEMINI_API_KEY`.
- **Emails not sending** — set `RESEND_API_KEY`.
