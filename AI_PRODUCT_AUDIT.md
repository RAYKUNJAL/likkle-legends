# Likkle Legends — AI Features + Product CTA Audit

**Repo:** `likkle-legends-main` (main @ d7c2b2c)
**Live:** https://likklelegends.com
**Audit date:** 2026-07-25
**Scope:** Inventory which AI/product features actually work vs. are stubbed/fabricated. No code changes made.

---

## 1. AI Feature Inventory — Status Table

| Feature | Code exists? | Env / Key read | Model name(s) | Silent fallback / mock on failure? | Live risk |
|---|---|---|---|---|---|
| **Buddy Chat** (`app/api/character-chat/route.ts`) | ✅ Real, full implementation | `GEMINI_API_KEY` (line 12). Hard-fails with 503 if missing — **no silent fallback**. | From `characterConfig.technical.brainModel` per character (roti / tanty / dilly). Returns 503 on API error. | ❌ No mock. Real safety layer (regex + Gemini safety settings), Supabase auth + parent/child check, rate limits. | 🟢 **Real & safe.** The gold-standard route in this codebase. |
| **Anansi Brain** (`app/api/brain/chat/route.ts` → `lib/ai-content-generator/orchestrator.ts`) | ⚠️ Partial. `processRequest` only dispatches `intent === 'chat'`. All other intents return hardcoded `"I'm still learning how to do that! Let's chat instead."` (line 26). | `GEMINI_API_KEY` via `provider-wrapper.ts` | Tiered via `geminiProvider.executeTiered('tier_0_low_cost', …)` | Auto-creates a dev profile if none exists (line 43). Other intents are stubs. | 🟡 Chat path works; worksheet/story intents are stubbed. |
| **Island Brain Orchestrator** (`app/api/island-brain/generate/route.ts` → `lib/agent-orchestrator.ts`) | ⚠️ **Mock fallback by design.** `IslandBrainOrchestrator.generateContent` catches *all* AI errors and returns `getMockPayload()` (lines 115–122), including on JSON parse errors and timeouts. Returns HTTP 200 with mock content titled `"Mock: The Doubles Song"` / `"Mock Content Generated"`. | `GEMINI_API_KEY` (passed to constructor; empty string allowed) | Hardcoded `gemini-2.0-flash` (line 36, comment says "UPGRADED from 1.5") | ⚠️ **YES — silent 200 with hardcoded mock content** on 404, fetch fail, timeout, or parse error. Kid-mode throws if safety fails, but parent-mode returns mock. | 🔴 **High.** A visitor/parent hitting this route when Gemini 404s or key is missing gets a believable-looking "generated" song/story that is actually a hardcoded mock. Indistinguishable from real AI output. |
| **Island Brain Monthly Drop** (`app/api/island-brain/monthly-drop/generate/route.ts`) | Same orchestrator as above | Same | Same | Same mock-fallback behaviour. | 🔴 Same risk. |
| **Roti Chat** (`app/api/roti-chat/route.ts`) | ⚠️ Returns **HTTP 200 with hardcoded string** when `GEMINI_API_KEY` missing: `"Beep boop! I'm having trouble connecting right now…"`. Also returns 200 with another hardcoded string on any error. | `GEMINI_API_KEY` (line 12) | `gemini-2.0-flash-exp` (line 23) — **`-exp` suffix is unstable/deprecated-prone** | ⚠️ Silent 200 fallback on missing key AND on error. | 🟡 Looks "online" even when AI is down. |
| **Tanty Spice Chat** (`app/api/tanty-spice/route.ts`) | ⚠️ Same pattern — returns 200 with `"Mmm-hmmm! Tanty ears not hearing too well right now…"` when key missing, and 200 with `"Lawd! Tanty had a little stumble…"` on error. | `GEMINI_API_KEY` (line 5) | From `TANTY_ISLAND_ENGINE.technical_stack.brain_model` | ⚠️ Silent 200 fallback. | 🟡 Same as Roti. |
| **Story Generate** (`app/api/story/generate/route.ts` → `lib/ai-content-generator/generators/story-generator.ts` → `core.ts`) | ✅ Real. Auth-gated, usage-limited, saves to DB, generates audio. | `ANTHROPIC_API_KEY` (preferred) → `GEMINI_API_KEY` fallback (`core.ts` lines 9–10) | Claude: `claude-3-5-sonnet-20241022`. Gemini fallback: `gemini-2.0-flash-exp`. Admin can override via `site_settings.ai_cost_controls.taskRouting`. | ❌ No mock. Throws `Critical AI Failure` on error. `generateImage` returns `'placeholder-image-url'` string on failure (line 172). | 🟢 Real. Minor: image placeholder string if image gen fails. |
| **Voice / TTS** (`app/api/voice/generate/route.ts`) | ✅ Real, well-built. ElevenLabs primary → Google Cloud TTS fallback. Rate-limited, sanitizes text, blocks unsafe patterns. | `serverEnv.ELEVENLABS_API_KEY` (optional) + `GOOGLE_CLOUD_TTS_API_KEY` / `GOOGLE_API_KEY` (`lib/google-cloud-tts.ts`) | ElevenLabs `eleven_multilingual_v2`; Google Cloud `en-GB-Neural2-C`; Gemini TTS (`models/gemini-2.5-flash-preview-tts` → `models/gemini-2.0-flash`) | Returns 503 if both providers fail. No mock audio. | 🟢 Real. Requires either ElevenLabs OR Google Cloud TTS key configured. |
| **ElevenLabs TTS proxy** (`app/api/elevenlabs-tts/route.ts`) | ⚠️ Legacy/duplicate of the voice route above. Reads `ELEVENLABS_API_KEY || VITE_ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID || VITE_ELEVENLABS_VOICE_ID` — **VITE_ prefix is a Vite convention, not Next.js**; those env names are likely never set. Hardcoded fallback voice `JfiM1myzVx7xU2MZOAJS`. | `ELEVENLABS_API_KEY` + `VITE_ELEVENLABS_API_KEY` (wrong) | `eleven_multilingual_v2` | 500 on missing key. | 🟡 Dead-ish legacy route; VITE_ vars will never resolve in Next. |
| **Blog Cron** (`app/api/cron/generate-blog/route.ts` → `lib/services/blog-agent.ts`) | ✅ Real. Picks from `CONTENT_IDEAS` catalog (33 topics), generates + auto-publishes + generates featured image. | `GEMINI_API_KEY`. Throws if missing. | Tries `gemini-2.0-flash` → `1.5-flash` → `1.5-pro` → `gemini-pro` in order. Uses `v1` for `gemini-pro`, `v1beta` for others. | Throws on all-models-failed. No mock. | 🟢 Real. Secured by `CRON_SECRET` bearer in production. |
| **Admin Blog Generate** (`app/api/admin/blog/generate/route.ts`) | ✅ Real. Admin-auth required. | `GEMINI_API_KEY` | `gemini-2.0-flash` | Throws on missing key. | 🟢 Real (admin-only). |
| **Admin Social Generate** (`app/api/admin/social/generate/route.ts`) | ✅ Real. Admin-auth. | `GEMINI_API_KEY` | `gemini-2.0-flash` | Throws on missing key. | 🟢 Real (admin-only). |
| **Admin Million-Dollar-Plan Chat** (`app/api/admin/million-dollar-plan/chat/route.ts`) | ✅ Real. Admin-auth. | `GEMINI_API_KEY` + `GEMINI_AGENT_MODEL` (env-overridable, default `gemini-2.0-flash`) | Configurable via env | 503 on missing key. | 🟢 Real (admin-only). |
| **Content Generation Cron** (`app/api/cron/content-generation/route.ts`) | ✅ Real. Weekly themes, logs to `agent_logs`. | Uses `createAdminClient` (Supabase service role) | — | — | 🟢 Real (cron). |
| **YouTube Video Planner** (`lib/youtube/video-planner.ts`) | ⚠️ Returns hardcoded `fallbackPlan()` when `GEMINI_API_KEY` missing (line 87) or on any error (lines 127–131). | `GEMINI_API_KEY` + `GEMINI_VIDEO_MODEL` (default `gemini-2.0-flash`) | `gemini-2.0-flash` | ⚠️ Silent fallback to `fallbackTopics`-seeded plan. | 🟡 Fallback plan looks like a real plan. |
| **Features Generate** (`app/api/features/generate/route.ts`) | ⚠️ Returns `buildFallbackModule()` (template) when `GEMINI_API_KEY` missing **or** when AI throws. Response includes `source: 'template-fallback'` flag (good — but client may not check it). | `GEMINI_API_KEY` | via `moduleManagerAgent.buildCompleteModule` | ⚠️ Silent 200 with template fallback. | 🟡 Tagged, but still a silent fallback. |
| **Island Concierge** (`lib/agents/island-concierge.ts`) | ⚠️ Real generation path, but `generateLesson` returns `getFallbackLesson()` on any error (line 136) and `generateWeeklyCurriculum` returns `getFallbackCurriculum()` when key missing (line 97). | `GEMINI_API_KEY` | `gemini-2.0-flash-exp` | ⚠️ Silent fallback to registry-derived basic lesson. | 🟡 Falls back to canned lesson. |
| **Image Generation** (`lib/ai-image-generator/image-client.ts` → `core.ts.generateImage`) | ⚠️ Returns `'placeholder-image-url'` string on failure (`core.ts` line 172) instead of throwing. | `GEMINI_API_KEY` | Gemini image (Story Maker) | ⚠️ Silent placeholder string. | 🟡 Could render broken images if not filtered. |
| **Game Generator** (`lib/game-generator.ts`) | Reads `GEMINI_API_KEY`; `|| ""` fallback (line 9) | `GEMINI_API_KEY` | — | Not fully inspected. | 🟡 Low priority. |

### Env-var naming — verdict
**Clean.** Every AI route reads `GEMINI_API_KEY`. There is **no** `GOOGLE_GENERATIVE_AI_API_KEY` and **no** `NEXT_PUBLIC_GEMINI` confusion anywhere. The only naming oddity is `VITE_ELEVENLABS_*` in the legacy `elevenlabs-tts` route (Vite convention in a Next app — effectively dead). `lib/env/server.ts` correctly treats `GEMINI_API_KEY` and `ELEVENLABS_API_KEY` as optional.

### Invalid / risky model names
- `gemini-2.0-flash-exp` — used by `roti-chat`, `island-concierge`, `ai-content-generator/core.ts` (Gemini fallback). The `-exp` suffix is experimental and has been retired/renamed by Google in the past. **High rotation risk.**
- `gemini-2.0-flash` — used by `agent-orchestrator`, `blog-agent`, admin routes, youtube planner. Stable-ish.
- `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro` — only as fallback chain in `blog-agent` (v1/v1beta mixing handled).
- `claude-3-5-sonnet-20241022` — hardcoded in `core.ts`; dated but valid.

### Health-check route (`app/api/health-check/route.ts`)
`GET /api/health-check` returns `checks.api_keys: !!process.env.GEMINI_API_KEY`.
- This boolean means **only** "is `GEMINI_API_KEY` set as a non-empty string." It does **not** validate the key, does not check Anthropic, ElevenLabs, Google Cloud TTS, PayPal, or Resend. A `true` here does not mean the AI actually works — just that the env var is non-empty. Misleading as a "keys healthy" signal.

---

## 2. Product / CTA Dead Ends

| CTA / path | Destination | Status |
|---|---|---|
| Pricing → "Claim Your Child's Passport" (starter_mailer) | `/checkout?plan=starter_mailer` | ✅ `/checkout` exists. |
| Pricing → "Unlock Premium" (legends_plus) | `/checkout?plan=legends_plus` | ✅ |
| Pricing → "Build Your Legacy" (family_legacy) | `/checkout?plan=family_legacy` | ✅ |
| Pricing → "Start Digital" (digital_explorer) | `/checkout?plan=digital_explorer` | ✅ |
| Pricing → "Explore Free" | `/signup?plan=free` | ✅ |
| Pricing page final CTA "Get Started Now" | `/get-started` | ✅ exists (wizard). |
| Header/hero "Try $10 Intro" / "Start Your Child's Adventure" | `/signup?plan=starter_mailer` | ✅ |
| CTA banner "Start Mail Club for $10/month" | `/get-started` | ✅ |
| Pricing add-on "Shop Birthday Letter" | `/shop/birthday-letter` | ✅ exists, has real PayPal buttons (`PAYPAL_CLIENT_ID || 'sb'`). |
| Pricing add-on fallback (non-birthday) | `/checkout` | ✅ |
| Character page "Start Adventure with {name}" | `/signup` (generic, **no plan param**) | 🟡 Works but drops plan context — user lands on signup defaulting to `mail_club`. Minor. |
| Character page "Learn More" link | `/#tanty` | 🟡 Anchors to a homepage section that may or may not exist (depends on landing variant mounted). Not a product dead-end but fragile. |
| Character "Interact in 3D" button | toggles `CharacterARViewer` (local state) | ✅ Works if `model_3d_url` present. |
| Checkout "Activate Free Account" | `/onboarding/welcome` or `/signup` | ✅ |
| Checkout PayPal `onApprove` | `/api/payments/paypal/confirm` | ✅ exists. |
| Onboarding welcome → "Continue" | `/onboarding/child` | ✅ |
| Onboarding child → submit | `/onboarding/learning-goals` (implied) | ✅ |
| Onboarding learning-goals → | `/onboarding/plan-preview?childId=…&character=…` | ✅ |
| Onboarding plan-preview → "Enter Portal" | `/portal` | ✅ |
| Onboarding plan-preview upgrade CTAs | `/pricing` | ✅ |
| Onboarding complete → referral copy | copies `${APP_URL}/signup?ref=…` | ✅ |

**No `<button>` with missing `onClick`/`href` was found in the inspected CTA surfaces.** All primary CTAs resolve to real routes. The only soft issue is the character page CTA going to `/signup` without a plan param.

### Shop products
- `/shop/birthday-letter` — real, wired to PayPal, $19 / $29 tiers via `birthday_letter_basic` / `birthday_letter_premium`.
- No other shop product pages exist despite `MUSIC_STORE_PRODUCTS` (single_track, track_bundle_5, custom_song_request) and `GAMIFICATION_PRODUCTS` (streak_freeze, birthday letters) being defined in `lib/paypal.ts`. **Those product IDs are defined but have no purchase UI/route.** Dead catalog entries.

---

## 3. Fabricated Traction / Social Proof

| Location | Claim | Evidence |
|---|---|---|
| `components/landing-v4/LandingPageV4.tsx` line 314 | **"10,000+ Kids Learning"** | Hardcoded stat in `SocialProofSection` stats array. |
| same, line 315 | **"97% Parents Renew"** | Hardcoded. |
| same, line 316 | **"4.9/5 App Rating"** | Hardcoded. |
| same, line 1013 | **"Join 10,000+ Caribbean families"** | Hardcoded in final CTA. |
| same, testimonials array (lines 276–298) | 3 testimonials: "Maria D.", "David M.", "Amara K." with `pravatar.cc` stock avatars | **Fabricated.** Avatars are literally `https://i.pravatar.cc/100?img=47/48/49` (placeholder-avatar service). Quotes are hardcoded. |
| `app/checkout/page.tsx` line 253 | **"Join 2,000+ diaspora families"** | Hardcoded in checkout left panel. |
| same, lines 337–340 | Testimonial `"The only app that actually makes my son excited…"` attributed to **"Sarah M., NY"** with 5 stars | Hardcoded, no source. |

**These are not backed by any database query, analytics, or reviews table.** They are static literals in JSX. The pravatar avatar URLs are a strong tell that these are placeholder personas, not real users.

---

## 4. Onboarding Flow Complexity

**Full path (5 screens):**
1. `/signup` — parent account (email, password, parent name, child name, age, island) + guardian checkbox
2. `/checkout` (only for paid plans) — 4-step wizard: email → personalize (child name, plan, heritage) → upsells (3 one-time offers + discount code) → PayPal
3. `/onboarding/welcome` — marketing-style welcome screen
4. `/onboarding/child` — 4-step micro-wizard: name → age → island (28 options) → avatar, with Tanty voice playback per step
5. `/onboarding/learning-goals` — multi-question learning-goal selection
6. `/onboarding/plan-preview` — shows generated learning plan, offers "Enter Portal" or upgrade to `/pricing`
7. `/onboarding/complete` — referral code + portal entry

**Assessment:** This is **still too many steps** for a kids' edutech signup. A parent going through a paid plan hits ~4 (signup) + 4 (checkout) + 4 (child wizard) + 1 (welcome) + 1 (learning-goals) + 1 (plan-preview) + 1 (complete) ≈ **16 interaction steps** before reaching the portal. The child sub-wizard alone repeats name/age/island already collected at signup and checkout (island is asked **three times**: signup, checkout step 2, onboarding/child step 3). The voice playback on each child step adds latency. The learning-goals + plan-preview screens are value-add but sit between the parent paying and the child actually using the product.

**Recommendation (no code changes here):** Collapse signup + checkout step 2 into one form; skip onboarding/child entirely when signup already captured child name/age/island; make learning-goals + plan-preview optional post-portal.

---

## 5. PayPal Subscription Plan IDs (`lib/paypal.ts`)

All plan IDs are resolved via `requireEnv()`:

| Plan key | Env var read | Default if unset | Price | Risk |
|---|---|---|---|---|
| `plan_free_forever` | — (empty string literal) | `''` | $0 | ✅ Correct (free has no PayPal ID). |
| `plan_digital_legends` | `NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL` + `…_YEARLY` | `requireEnv` returns `""` in non-Vercel-prod | $4.99 / $49.90 | 🟡 If env unset, `paypalPlanId` is `""` — checkout's `createSubscription` throws "Missing PayPal Plan ID" toast at runtime. |
| `plan_mail_intro` (Island Starter / "$10 mail club") | `NEXT_PUBLIC_PAYPAL_PLAN_STARTER` + `NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY` | `""` | $9.99 / $99.00 | 🟡 Same — empty string if env missing. |
| `plan_legends_plus` | `NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS` + `NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY` | `""` | $19.99 / $199.00 | 🟡 Same. |
| `plan_family_legacy` | `NEXT_PUBLIC_PAYPAL_PLAN_FAMILY` + `NEXT_PUBLIC_PLAN_FAMILY_YEARLY` (**typo: missing `PAYPAL_`**) | `""` | $34.99 / $349.00 | 🔴 **Env var name typo** — `NEXT_PUBLIC_PLAN_FAMILY_YEARLY` is inconsistent with the `NEXT_PUBLIC_PAYPAL_PLAN_*` convention used everywhere else. This yearly plan ID will almost certainly be empty in production. |

**Production vs sandbox:** `requireEnv` only throws **at runtime on Vercel** (`process.env.VERCEL_URL` set, not in build phase). The app is self-hosted on a VPS (per `CLAUDE.md`), so `VERCEL_URL` is never set — meaning **`requireEnv` will silently return `""` for every missing PayPal plan ID in production** rather than throwing. This is a real risk: the checkout will render, let a user pick a plan, and only fail at the PayPal `createSubscription` step with a toast.

**PayPal client ID:** `app/checkout/page.tsx` line 32: `NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb"`. The `"sb"` fallback is PayPal's **sandbox client ID** — if the env var is unset, the checkout silently loads PayPal in sandbox mode in production.

---

## 6. Summary of Highest-Risk Findings

1. 🔴 **`IslandBrainOrchestrator` silently returns hardcoded mock content as HTTP 200** on any Gemini error/timeout/parse failure (`lib/agent-orchestrator.ts` lines 115–122). Mock output is indistinguishable from real AI generation to the caller.
2. 🔴 **PayPal plan ID env var typo**: `NEXT_PUBLIC_PLAN_FAMILY_YEARLY` (missing `PAYPAL_`) in `lib/paypal.ts` line 116 — Family Legacy yearly plan ID will be empty.
3. 🔴 **`requireEnv` never throws on the self-hosted VPS** (only throws on Vercel runtime), so all missing PayPal plan IDs silently become `""` and only fail at the PayPal SDK step.
4. 🔴 **Fabricated traction**: "10,000+ Kids Learning", "97% Parents Renew", "4.9/5 App Rating", "2,000+ diaspora families", and three testimonials with `pravatar.cc` stock avatars — all hardcoded in landing/checkout.
5. 🟡 **`roti-chat` and `tanty-spice` return HTTP 200 with hardcoded "connection trouble" strings** when `GEMINI_API_KEY` is missing or AI errors — the UI looks online while being dead.
6. 🟡 **`gemini-2.0-flash-exp` model name** used in 3 routes (roti-chat, island-concierge, content-generator Gemini fallback) — experimental suffix, high rotation risk.
7. 🟡 **`/api/health-check` `api_keys` boolean only checks `GEMINI_API_KEY` presence**, not validity, and ignores Anthropic/ElevenLabs/Google TTS/PayPal/Resend. Misleading as a "keys healthy" signal.
8. 🟡 **Onboarding is ~16 steps** with island asked 3× (signup, checkout, onboarding/child) and name/age asked 2×.
9. 🟡 **Dead shop catalog**: `MUSIC_STORE_PRODUCTS` and `GAMIFICATION_PRODUCTS` (streak_freeze etc.) are defined in `lib/paypal.ts` but have no purchase pages.
10. 🟡 **Legacy `elevenlabs-tts` route** reads `VITE_ELEVENLABS_*` env vars (Vite convention) — dead in Next.js.

### What actually works (the real, shippable AI surface)
- `character-chat` (buddy chat) — properly built, safe, auth-gated, rate-limited, no mock fallback.
- `story/generate` — real Claude→Gemini pipeline with DB persistence + audio.
- `voice/generate` — real ElevenLabs→Google Cloud TTS with sanitization + rate limiting.
- `cron/generate-blog` + admin blog/social/million-dollar-plan routes — real, auth-protected.
- Checkout + PayPal subscription flow (when env vars are correctly set).

### What is stubbed or silently faking it
- `island-brain/generate` + `monthly-drop` — mock payload on any failure.
- `brain/chat` (Anansi) — only `chat` intent implemented; all others return a canned string.
- `roti-chat`, `tanty-spice` — canned "friendly error" 200s.
- `features/generate` — template fallback (tagged `source: 'template-fallback'`).
- `youtube/video-planner` — fallback plan on missing key/error.
- `island-concierge` — fallback lesson/curriculum on error.
- All landing-page stats + testimonials.

---

*Audit performed by static inspection only. No code was modified. Verify env vars against actual `.env.production` on the VPS for runtime confirmation.*
