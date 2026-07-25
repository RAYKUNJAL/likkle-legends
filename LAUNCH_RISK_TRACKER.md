# Likkle Legends — Launch Risk Tracker (updated 2026-07-25 late session)

**Live:** https://www.likklelegends.com  
**Git main:** `a6e95a5` (+ cron chmod fix `185b0f9`)  
**Verdict:** **Conditional GO for soft traffic / waitlist.** Auth + blog engine + critical payment integrity fixed live. Full commercial ads still blocked until PayPal E2E sandbox smoke + Paperclip/Goose real wiring (not present) + lengthier content backfill + disk pressure.

---

## Done / Missing / Broken

| Status | Area |
|--------|------|
| ✅ Done | Auth/signup/login path to self-hosted Supabase |
| ✅ Done | Health live (`api_keys`, `paypal`, `cron_secret` true) |
| ✅ Done | Blog cron models (`gemini-2.5-flash`) + schema mapper |
| ✅ Done | **3+ blog posts generated & published live** (engine unstuck) |
| ✅ Done | Cron DNS: no longer hits TideLinx; uses `likkle-legends-web-1` |
| ✅ Done | Payment: birthday amount server-side; capture amount check; confirm fail-closed |
| ✅ Done | 404 aliases: `/heritage` `/mail-club` `/shop` redirect |
| ✅ Done | Admin email/substring backdoors removed |
| ✅ Done | Family yearly PayPal env key typo fixed |
| 🟡 Missing | Full multi-week blog backlog (run weekly until caught up) |
| 🟡 Missing | Paperclip + Goose as **live** builders for Likkle (configs only; cutover room template stale; no Goose process) |
| 🟡 Missing | PayPal sandbox end-to-end subscription smoke with real plan IDs |
| 🟡 Missing | Free disk headroom (was ~95%) |
| 🟡 Missing | Fabricated traction cleanup on landing |
| 🔴 Broken / watch | If admin login relies on hardcoded gmail bypass only (now removed) you **must** have `profiles.role=admin` or `is_admin=true` for Ray's account |
| 🔴 Broken | Silent AI mock paths (Island Brain) still in code for some agents |
| 🔴 Broken | Story content APIs still public ungated |

---

## Live proof (2026-07-25)

### Blog unsticked
```
FIRE1..FIRE3 success:true
posts:
- Keeping the 'Gran-Gran' Connection Strong...
- Keeping Your Caribbean Language Alive...
- Easy Trinidadian Pelau...
```
Root causes fixed:
1. Retired Gemini models → `gemini-2.5-flash`
2. Cron container DNS `web` → **TideLinx** (wrong app)
3. Crontab had adhesive `Bearer ***` (not secret)
4. `blog_posts` schema mismatch (`ai_generated` etc.)

### Payments hardened
- `POST /api/orders/birthday-letter` with `amount:0.01` → **400 amount mismatch**
- Confirm without verified PayPal subscription refuses client tier upgrade

### 404s
- `/heritage` `/mail-club` `/shop` → redirect 307 → real pages 200

### Admin
- Nested `/admin/*` still middleware-gated (307 unauthenticated)
- Admin role = DB `role/is_admin` only

### Paperclip / Goose
| Expected | Reality |
|----------|---------|
| Live Paperclip controlling Likkle blog/site | `/opt/likkle-legends/paperclip/` = policies + **Google cutover** board template only |
| Goose agent OS | **Not installed/running** for Likkle |
| opaija-paperclip home | Exists as system user dir, not Likkle site daemon |

Likkle content agents that **do** run: Next.js cron → `generate-blog` / content-queue (now healthy). Admin UI at `/admin/agent-team` exists for in-app agents.

---

## Remaining sprint (priority)

1. **Set Ray admin flag in DB** if admin panel access broke after backdoor removal  
2. Run blog cron 1×/day until backlog filled (or loop 20 topics tonight)  
3. PayPal sandbox: real `create` → `capture`/`confirm` with production plan IDs env  
4. Decide Paperclip destiny: wire to Likkle agents **or** delete stale Google-cutover board so it isn’t mistaken for live ops  
5. Disk cleanup (safe; no broad prune)  
6. Strip fabricated stats; gate story APIs  

---

## Commits this wave

- `169151d` fix blog cron/payments/404s/compose  
- `185b0f9` cron ro-mount chmod  
- `a6e95a5` blog schema mapper  

---

*Soft launch OK once admin flag confirmed and one paid sandbox checkout succeeds.*
