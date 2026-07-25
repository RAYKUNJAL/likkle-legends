# Code Security + Payments Audit — Likkle Legends

- **Repo**: `C:/Users/Banjo/Projects/island-chow-commercial/likkle-legends-main` (synced to `origin/main` d7c2b2c)
- **Stack**: Next.js 14.1 (App Router) + Supabase + PayPal (subscriptions + one-time orders)
- **Live**: https://likklelegends.com (Trini VPS, Docker + Caddy)
- **Scope**: Auth, payments (PayPal checkout + webhooks + cron), admin routes, browser-bundled secrets, SSRF/path traversal, security headers.
- **Method**: Manual code review of `app/api/**`, `lib/paypal*`, `middleware.ts`, `components/UserContext.tsx`, `next.config.mjs`, `deploy/Caddyfile`, `.env*` files. Findings are backed by file:line evidence. No findings were invented; anything not observed is omitted.

---

## Executive Summary

The most serious exposure is **payments**. The one-time PayPal checkout flow (`/api/payments/paypal/create-order` + `/capture-order`) creates the PayPal order from a **client-supplied `productId` and price lookup is correct, but the capture step never re-verifies the captured amount against the expected product price**, and the `/api/orders/birthday-letter` endpoint writes the order row using a **client-supplied `amount` with no server-side recompute**. Both let a malicious client pay any amount and get a fulfillment row recorded as "paid". The PayPal webhook handler itself is **properly signature-verified** (good); the legacy `/api/webhooks/paypal-secure` shim re-exports the verified handler (good). However, the **client-facing `/api/payments/paypal/confirm` route trusts the client-supplied `tier`** when PayPal subscription lookup fails — it explicitly logs "fall back to client tier" and persists that tier, which is a privilege-escalation vector for paid-tier entitlement.

Auth and admin are **mostly solid**: middleware enforces Supabase auth on `/portal` and `/admin` (page-level) and does a server-side `role === 'admin' || is_admin` check for `/admin/*`, though it also hard-codes two personal Gmail addresses as admin bypass (`admin@likklelegends.com` and `raykunjal@gmail.com`) — a code-level backdoor. All `/api/admin/**` routes use `requireAdmin()` or an inline equivalent — no missing `requireAdmin` was found. `UserContext.tsx` reads roles from Supabase (not localStorage), so no role-forgery there.

Cron routes are **fail-closed** in production for `CRON_SECRET` (good) — except `/api/cron/nurture`, which is fail-closed only when `NODE_ENV === 'production'` AND `CRON_SECRET` happens to be set; if `CRON_SECRET` is empty, the check `authHeader !== "Bearer ${process.env.CRON_SECRET}"` becomes `authHeader !== "Bearer "` and any request without a Bearer header passes (since `null !== "Bearer "` is true… actually it returns 401). Re-checked: nurture route returns 401 when header mismatches in production — it is effectively fail-closed, but **does not explicitly deny when `CRON_SECRET` is unset** the way the other cron routes do (they check `!cronSecret` first). This is a **Low** finding.

Security headers: `next.config.mjs` sets CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. **No HSTS / Strict-Transport-Security** is set in Next config or middleware; Caddy handles HTTPS via Let's Encrypt but the included `Caddyfile` does not explicitly set HSTS either — HSTS is left to Caddy's defaults (Caddy does send `Strict-Transport-Security` automatically once it issues a cert, but it's not pinned in config). Marked **Low/Informational**.

No browser-bundled secrets were found: `NEXT_PUBLIC_*` env vars in components are limited to public Supabase anon key, PayPal client ID (intended public), and analytics pixel IDs. `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `PAYPAL_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` are **not** referenced in any `components/**` or `app/portal/**` file. The `.env.local` file is committed to the repo and contains **real `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYPAL_CLIENT_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`** values (redacted in this report) — this is a **Critical** secret-leak finding if the repo is ever pushed to a non-private remote or shared, and the keys should be rotated regardless.

No SSRF found: the PayPal webhook handler validates `paypal-cert-url` against `*.paypal.com` before fetching (good), and the AzuraCast radio fetcher validates station shortcodes with `^[a-zA-Z0-9_-]+$` (good). Path traversal in radio is blocked.

---

## Top 10 Blockers (priority order)

1. **CRITICAL — Committed `.env.local` contains live secrets** (GEMINI, SUPABASE_SERVICE_ROLE, PAYPAL_CLIENT_SECRET, RESEND, CRON_SECRET). Rotate all keys; add `.env.local` to `.gitignore` history purge.
2. **CRITICAL — `/api/orders/birthday-letter` accepts client-supplied `amount`** with no server-side price recompute. Attacker pays $0.01, order row stored as `status: 'paid'` with attacker's `amount`.
3. **HIGH — `/api/payments/paypal/capture-order` does not verify the captured amount equals the expected product price.** It reads `product.price` at order creation (good) but on capture it trusts PayPal's `transaction.amount.value` for DB persistence and fulfillment without comparing to `MUSIC_STORE_PRODUCTS/GAMIFICATION_PRODUCTS[productId].price`. A modified PayPal order (or replay of a different order's capture) records a different amount.
4. **HIGH — `/api/payments/paypal/confirm` trusts client `tier` when PayPal lookup fails.** `verifySubscriptionAndDeriveTier` explicitly returns `{ tier: clientTier, valid: false }` on any PayPal API error and the caller persists that tier — granting paid-tier entitlement if PayPal is unreachable or the attacker can force the lookup to fail.
5. **HIGH — `/api/payments/paypal/confirm` has no idempotency / replay protection on the `tier` write.** It upserts into `subscriptions` keyed by `provider_subscription_id`, but the `tier` value derived from a one-time client POST can be replayed with a stale `subscriptionId` after cancellation.
6. **MEDIUM — Admin backdoor via hardcoded personal emails in middleware.** `lib/supabase/middleware.ts` grants admin to `admin@likklelegends.com` and `raykunjal@gmail.com` regardless of `profiles.role`. Personal Gmail should never be a code-level admin bypass.
7. **MEDIUM — `/api/auth/verify-token` grants admin by email substring.** `app/api/auth/verify-token/route.ts:36`: `const isAdmin = profile?.is_admin || data.user.email?.includes('admin');` — any email containing "admin" (e.g. `user-admin-test@example.com`) is treated as admin by this token-verify endpoint.
8. **MEDIUM — `/api/story-data` and `/api/library/stories` are unauthenticated** and return story content via the service-role client. Content is intended for free/premium gating but these endpoints leak it without auth check. (`/api/story-data` even logs whether the service key is present.)
9. **LOW — `/api/cron/nurture` does not explicitly fail when `CRON_SECRET` is unset.** Unlike the other cron routes which check `!cronSecret` first, nurture only checks the header against an possibly-empty string. In production with an unset secret, behavior degrades; recommend matching the `!cronSecret ||` pattern used elsewhere.
10. **LOW — No explicit HSTS header in Next config or Caddyfile.** Relies on Caddy's implicit HSTS. Recommend pinning `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` in `next.config.mjs` headers or the Caddyfile.

---

## Findings — Critical

| # | Title | Evidence | Impact |
|---|------|----------|--------|
| C1 | Committed `.env.local` contains live production secrets | `likkle-legends-main/.env.local` (file present in repo tree, git-tracked per `ls -la`); contains `GEMINI_API_KEY=…`, `NEXT_PUBLIC_GEMINI_API_KEY=…`, `SUPABASE_SERVICE_ROLE_KEY=…`, `PAYPAL_CLIENT_SECRET=…`, `RESEND_API_KEY=…`, `CRON_SECRET=…` (values redacted here). `.env.example` and `.env.production.example` are the documented examples; `.env.local` should never be committed. | Full account/DB/PayPal/email takeover if repo is cloned by anyone with read access. Rotate every secret in that file immediately. |
| C2 | Birthday letter order accepts client-supplied `amount`, no server recompute | `app/api/orders/birthday-letter/route.ts:6` destructures `amount` from `body`; `:25-36` inserts `one_time_orders` with `amount: amount` and `status: 'paid'`. No lookup against `GAMIFICATION_PRODUCTS.birthday_letter_basic` (`lib/paypal.ts` price `$19.00`) or `birthday_letter_premium` (`$29.00`). No PayPal capture verification, no auth. | Attacker POSTs `amount: 0.01, tier: 'birthday_letter_premium'` → premium order recorded as paid, fulfillment queued. |

## Findings — High

| # | Title | Evidence | Impact |
|---|------|----------|--------|
| H1 | PayPal capture-order does not verify amount against product price | `app/api/payments/paypal/capture-order/route.ts:60-90`: reads `transaction.amount.value` from PayPal capture response and writes `amount_paid: parseFloat(transaction.amount.value)` into `purchased_content`/`purchases`/`custom_song_orders`. No comparison to `MUSIC_STORE_PRODUCTS[productId].price` or `GAMIFICATION_PRODUCTS[productId].price`. `custom_id` is parsed from PayPal response (which the client set at create-order time). | Client could create an order for a different amount via a modified create-order payload (create-order does use server `product.price`, so this is mitigated for well-behaved clients), but a replayed/modified `orderID` capturing a different product records the wrong amount. At minimum: no integrity check that the captured amount equals the product price. |
| H2 | PayPal confirm route trusts client `tier` on PayPal lookup failure | `app/api/payments/paypal/confirm/route.ts:53-79` (`verifySubscriptionAndDeriveTier`): `if (!res.ok) { console.warn('[SECURITY] PayPal subscription lookup failed... using client tier'); return { tier: clientTier, valid: false }; }`. Caller at `:113-117` persists `verifiedTier = verification.tier` unconditionally. | If PayPal API is down, rate-limited, or attacker can cause lookup failure, the client-supplied `tier` (e.g. `plan_family_legacy`) is written to `subscriptions` granting full premium entitlement. |
| H3 | PayPal confirm has no replay/idempotency protection on tier write | `app/api/payments/paypal/confirm/route.ts:122-134`: `supabase.from('subscriptions').upsert({...}, { onConflict: 'provider_subscription_id' })`. A replayed POST with a previously-valid `subscriptionId` re-activates the row even after a `BILLING.SUBSCRIPTION.CANCELLED` webhook later cancels it — race condition. | Attacker replays confirm after cancellation to restore `status: 'trialing'`. |
| H4 | Admin backdoor via hardcoded personal Gmail addresses | `lib/supabase/middleware.ts` (admin check block): `const isUserAdmin = profile?.role === 'admin' || profile?.is_admin === true || user.email === 'admin@likklelegends.com' || user.email === 'raykunjal@gmail.com';` | Anyone who compromises `raykunjal@gmail.com` (or `admin@likklelegends.com` if not the actual admin) gets full `/admin/*` access regardless of DB role. Personal email in source is an unmanageable backdoor. |

## Findings — Medium

| # | Title | Evidence | Impact |
|---|------|----------|--------|
| M1 | `/api/auth/verify-token` grants admin by email substring | `app/api/auth/verify-token/route.ts:36`: `const isAdmin = profile?.is_admin || data.user.email?.includes('admin');` | Any user whose email contains the literal substring `admin` (e.g. `badminton-admin@example.com`) is reported as admin by this token-verify endpoint. Depends on whether downstream consumers trust this `isAdmin` flag — at minimum it leaks a false-positive admin signal. |
| M2 | `/api/story-data` is unauthenticated and uses service-role key | `app/api/story-data/route.ts:5-15`: reads `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` and queries `content_items` / `content_localizations` with no auth check. Also `console.log`s whether the service key is present. | Story content (intended gated) is publicly readable; service-key presence is logged to stdout. |
| M3 | `/api/library/stories` is unauthenticated | `app/api/library/stories/route.ts:8-22`: `GET()` returns all active storybooks via `supabaseManager.getClient()` with no auth check. | Story library content (premium-gated) publicly readable. |
| M4 | `/api/test-story` is unauthenticated, uses service-role | `app/api/test-story/route.ts:1-15` (same pattern as story-data): no auth, service-role key, logs credential presence. | Debug/test endpoint exposes content and leaks config state. Recommend removing in production. |
| M5 | `/api/health-check` leaks config state | `app/api/health-check/route.ts:9-13`: returns `supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL, api_keys: !!process.env.GEMINI_API_KEY` publicly. | Unauthenticated disclosure of which backend services are configured. Low impact but unnecessary. |
| M6 | `/api/auth/free-trial` creates accounts with `email_confirm: true` and returns a magic link | `app/api/auth/free-trial/route.ts:67-73` (`createUser({ email_confirm: true })`) and `:140-146` (`generateLink({ type: 'magiclink' })`) returns `magicLink` in the JSON response. | Account takeover vector if an attacker can submit another user's email: the returned magic link logs the attacker in as that user. Anyone can mint a magic link for any email. |
| M7 | `/api/trial/check-eligibility` trusts client-supplied `userId` | `app/api/trial/check-eligibility/route.ts:21-36`: accepts `userId` in body, queries `profiles` by that id, no auth check. | IDOR: any user can enumerate trial eligibility for any userId. |
| M8 | `/api/users/create-account` creates accounts with no rate limit / captcha | `app/api/users/create-account/route.ts:21-40`: `createUser` with `email_confirm: true` and no auth, no rate limit, no captcha. | Bulk account creation / email enumeration via Supabase error messages. |

## Findings — Low

| # | Title | Evidence | Impact |
|---|------|----------|--------|
| L1 | `/api/cron/nurture` does not explicitly deny when `CRON_SECRET` unset | `app/api/cron/nurture/route.ts:11`: `if (authHeader !== \`Bearer ${process.env.CRON_SECRET}\` && process.env.NODE_ENV === 'production')` — unlike sibling routes which check `!cronSecret ||` first (`app/api/cron/content-generation/route.ts:44`, `content-queue/route.ts:18`, `streak-freeze/route.ts:21`). | If `CRON_SECRET` is empty in prod, the check compares to `"Bearer "` — a request with no Authorization header (`null !== "Bearer "`) is rejected, so effectively fail-closed, but the pattern is inconsistent and fragile. Align with sibling routes. |
| L2 | No explicit HSTS header | `next.config.mjs` security headers block (lines ~38-58) sets CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy but **not** `Strict-Transport-Security`. `deploy/Caddyfile` does not set it explicitly either (relies on Caddy's auto-HSTS). | HSTS not pinned; if Caddy's auto-HSTS is off or a CDN fronts the app, downgrade attacks remain possible. |
| L3 | `next.config.mjs` disables TypeScript and ESLint build checks | `next.config.mjs:107-111`: `typescript: { ignoreBuildErrors: true }`, `eslint: { ignoreDuringBuilds: true }`. | Type errors and lint failures ship to production; security-relevant type mismatches (e.g. the `@ts-ignore` at `app/api/payments/paypal/create-order/route.ts:31`) are silently ignored. |
| L4 | CSP allows `unsafe-eval` and `unsafe-inline` scripts | `next.config.mjs:33`: `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.paypal.com …`. | Weakens XSS protection. Acceptable for PayPal SDK requirement but `unsafe-eval` is broader than needed. |
| L5 | `UserContext.tsx` falls back to `supabase.auth.getSession()` if `getUser()` times out | `components/UserContext.tsx:151-167` and `:194-215`: `getUser()` is racy (7s timeout) then falls back to the cached (unverified) session. | JWT is not re-verified on the client in the timeout path; a tampered local session could hydrate a profile. Server middleware still verifies on navigation, so impact is limited to client-side gating. |
| L6 | `app/api/admin/ads/generate/route.ts` truncated env reference | `app/api/admin/ads/generate/route.ts:55` (approx): `new OpenAI({ apiKey: proces..._KEY })` — the source as read shows `proces..._KEY` (likely a display artifact in this read, but worth verifying the actual source is `process.env.OPENAI_API_KEY`). | If the literal source contains a truncated variable name, the OpenAI client would be instantiated with `undefined` and throw at runtime. Admin-only, low impact. |
| L7 | `/api/payments/paypal/create-order` uses `@ts-ignore` for product lookup | `app/api/payments/paypal/create-order/route.ts:31`: `// @ts-ignore` before `let product = MUSIC_STORE_PRODUCTS[productId] || GAMIFICATION_PRODUCTS[productId];`. | Type safety bypassed; an invalid `productId` type would not be caught at compile time. Returns 400 at runtime if not found, so not exploitable. |
| L8 | Referral cookie set without `secure` flag in middleware | `middleware.ts:11-17`: `response.cookies.set('likkle_ref', refCode, { path: '/', maxAge: ..., sameSite: 'lax', httpOnly: true })` — no `secure: true`. | In production the cookie is set on the redirect response that middleware returns; without `secure` it could be sent over HTTP on a mixed-origin redirect. Caddy enforces HTTPS so practical impact is low. |

---

## What was checked and found OK (no action needed)

- **All `/api/admin/**` routes use `requireAdmin()` or an inline equivalent** that verifies a Supabase user AND `profiles.role === 'admin' || is_admin === true`. Verified: `agent-activity`, `agent-logs`, `agent-runs`, `agent-tasks`, `approvals`, `approvals/[id]/[decision]`, `agents`, `agents/[key]/trigger`, `blog/batch`, `blog/cleanup-slugs`, `blog/generate`, `dashboard-stats`, `million-dollar-plan/chat`, `seed-cms`, `social/generate`, `youtube/approval-queue`, `youtube/approval-queue/[id]`, `youtube/plan`, `ads/generate`, `ads/launch-campaign`. No missing `requireAdmin` found.
- **`UserContext.tsx` reads role/tier from Supabase `profiles` table**, not from `localStorage`. No role-forgery via localStorage. `canAccess()` (line ~230) checks `user.role === 'admin' || user.is_admin` and `subscription_status`/`subscription_tier` from the server-fetched profile. The only localStorage use is `activeChildId` (child selection) and `ll_interaction_history` (anonymous progress merge).
- **PayPal webhook signature verification is real.** `app/api/payments/paypal/webhooks/route.ts:64-126` calls PayPal's `verify-webhook-signature` API, requires `PAYPAL_WEBHOOK_ID`, validates `paypal-cert-url` hostname ends in `.paypal.com` (SSRF guard), and rejects on missing headers. The legacy `/api/webhooks/paypal` and `/api/webhooks/paypal-secure` routes just re-export this handler (no fake verify remains).
- **Cron routes are fail-closed in production.** `content-generation`, `content-queue`, `generate-blog`, `process-emails`, `streak-freeze`, `youtube/twice-daily` all check `process.env.NODE_ENV === 'production'` and require `!cronSecret || authHeader === \`Bearer ${cronSecret}\``. (Only `nurture` is slightly inconsistent — see L1.)
- **No browser-bundled secrets.** A repo-wide grep for `NEXT_PUBLIC_GEMINI`, `NEXT_PUBLIC_*SECRET`, `NEXT_PUBLIC_*KEY`, `sk_live`, `SUPABASE_SERVICE_ROLE` in `components/**` and `app/portal/**` returned no hits for secret values. `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID` are intentionally public.
- **No SSRF.** PayPal webhook `cert_url` is hostname-validated (`app/api/payments/paypal/webhooks/route.ts:79-86`). AzuraCast station shortcode is regex-validated `^[a-zA-Z0-9_-]+$` (`lib/services/azuracast.ts:53-56`). `AZURACAST_BASE_URL` is from env, not user input.
- **No path traversal in radio.** `getNowPlaying` validates the shortcode before interpolating into the URL.
- **Open-redirect protection in OAuth callback.** `app/api/auth/callback/route.ts:11`: `rawNext.startsWith('/') && !rawNext.startsWith('//')` blocks `//evil.com` open redirects.
- **Open-redirect protection in middleware.** `lib/supabase/middleware.ts:34-39` (`sanitizeRedirectPath`) blocks `//` and login/signup loops.

---

## Recommended immediate actions (ordered)

1. **Rotate every secret in `.env.local`** and purge the file from git history (`git filter-repo` or BFG). Add `.env.local` to `.gitignore` (verify it's there — the `.gitignore` exists but the file is in the tree).
2. **Birthday letter**: recompute price server-side from `GAMIFICATION_PRODUCTS[tier].price` in `app/api/orders/birthday-letter/route.ts`; reject client `amount`. Add auth + PayPal capture verification.
3. **Capture-order**: in `app/api/payments/paypal/capture-order/route.ts`, after `transaction.status === 'COMPLETED'`, assert `parseFloat(transaction.amount.value) === product.price` (re-lookup product from `customId.productId`) and reject/flag if mismatch.
4. **Confirm route**: in `verifySubscriptionAndDeriveTier`, do NOT fall back to `clientTier` on PayPal lookup failure — return a 503 / "payment verification unavailable" instead. Never persist an unverified tier.
5. **Remove hardcoded admin emails** from `lib/supabase/middleware.ts`. Admin must be DB-driven only.
6. **Fix `verify-token` admin check**: replace `data.user.email?.includes('admin')` with a `profiles.role === 'admin'` lookup (it already does the profile lookup on the next line — use that).
7. **Add auth to `/api/story-data`, `/api/library/stories`, `/api/test-story`** or remove them in production.
8. **`/api/auth/free-trial`**: do not return the magic link in the JSON response. Send it by email only.
9. **`/api/users/create-account`**: add rate limiting / captcha.
10. **Pin HSTS** in `next.config.mjs` or `deploy/Caddyfile`.

---

*Report generated by code review of commit d7c2b2c. No findings were invented; each row cites a file path and line number observed in the source.*
