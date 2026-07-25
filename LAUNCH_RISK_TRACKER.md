# Likkle Legends — Launch Risk Tracker (FINAL wrap 2026-07-25)

**Live:** https://www.likklelegends.com  
**Git / deploy:** `main` through admin + blog fixes (see commits below)  
**Verdict:** **Soft-launch ready.** Core buyer paths, auth, blog engine, payment integrity guards, redirects, and admin access are live. Hold mass paid ads until one real PayPal sandbox subscription completes end-to-end.

---

## Done / Missing / Broken

| Status | Area |
|--------|------|
| ✅ Done | Site live (Traefik → Docker web healthy) |
| ✅ Done | Auth signup/login → self-hosted Supabase (`/supabase` proxy + internal Kong) |
| ✅ Done | Health: `api_keys`, `paypal`, `cron_secret`, supabase true |
| ✅ Done | Blog engine unstuck + **9 published posts** in DB |
| ✅ Done | Cron container reaches **Likkle** web (not TideLinx) |
| ✅ Done | Birthday letter rejects fake `amount:0.01` |
| ✅ Done | PayPal confirm fails closed on unverified tier |
| ✅ Done | Capture amount vs catalog check |
| ✅ Done | `/heritage` `/mail-club` `/shop` redirect (no more dead 404) |
| ✅ Done | Admin: Ray `raykunjal@gmail.com` → `role=super_admin`, `is_admin=true` |
| ✅ Done | Middleware accepts `admin` **and** `super_admin` |
| ✅ Done | Removed email-substring + hardcoded gmail admin backdoors (DB flags now) |
| 🟡 Missing | Long blog backlog (weeks of content) — engine ready; keep daily cron |
| 🟡 Missing | PayPal sandbox full subscription smoke with live plan IDs |
| 🟡 Missing | Paperclip/Goose as live builders (not wired; cron/agents are content path) |
| 🟡 Missing | Fabricated traction cleanup on landing |
| 🟡 Missing | Public story API gating |
| 🟡 Missing | Disk pressure relief on trini (~95% earlier) |
| 🔴 Watch | Nested `/admin/*` still needs login session; root `/admin` is 200 (marketing shell — confirm it never exposes admin APIs without auth) |

---

## Live proof snippets

```
GET /api/health-check → api_keys/paypal/cron_secret true, supabase-kong:8000
POST /api/orders/birthday-letter amount=0.01 → 400 expectedAmount 29
blog_posts count → 9
profiles raykunjal@gmail.com → is_admin true, role super_admin
/portal /admin/blog → 307 unauthenticated
cron → wget likkle-legends-web-1:3000 health operational
```

### Blog posts published this wave (sample)
1. Gran-Gran Connection  
2. Caribbean Language Alive Abroad  
3. Trinidadian Pelau with Kids  
4. Bajan Beat Words  
5. Explore Caribbean Islands  
6. Island Genius STEM  
7. Caribbean Birthday Bash  
8. *(batch)*  
9. Kid-Friendly Jamaican Patty Recipe  

---

## Paperclip / Goose (honest)

- **Not** a live website-builder for Likkle right now.  
- Repo has policy + stale “Google cutover” board template.  
- **Working content agent:** `/api/cron/generate-blog` (Gemini 2.5) + admin agent UI.  

---

## Key commits (this finish wave)

- Auth Supabase path restore  
- Blog model + schema + cron DNS  
- Payment integrity  
- 404 redirects + compose Traefik  
- Admin super_admin + is_admin  

---

## Ops you may still want tonight

1. Login as Ray → open `/admin/blog` and confirm panel (session cookies).  
2. Optional: run blog cron more times for backlog.  
3. One PayPal sandbox subscription start → confirm activation.  
4. Safe disk cleanup when ready (no blind `docker system prune`).  

**Soft launch: YES for traffic / signup / free explorers.**  
**Hard launch ads/spend: after sandbox payment proof.**
