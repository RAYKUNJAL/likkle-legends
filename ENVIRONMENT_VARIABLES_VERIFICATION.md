# 🔐 LIKKLE LEGENDS - ENVIRONMENT VARIABLES VERIFICATION REPORT

**Generated:** 2026-04-01  
**Status:** ✅ CRITICAL VARIABLES IDENTIFIED  
**Branch:** claude/fix-audit-blockers-j2ExB

---

## 📋 EXECUTIVE SUMMARY

This report identifies ALL environment variables required for the Likkle Legends platform. Variables are categorized by criticality and grouped by function.

**Total Required Variables:** 21 critical  
**Total Optional Variables:** 8 optional  

---

## 🔴 CRITICAL VARIABLES (REQUIRED FOR PRODUCTION)

### 1. SUPABASE (Database & Auth) - REQUIRED
```
NEXT_PUBLIC_SUPABASE_URL          ← Public, used by client
NEXT_PUBLIC_SUPABASE_ANON_KEY     ← Public, used by client
SUPABASE_SERVICE_ROLE_KEY         ← SECRET, server-only
```
**Status:** ✅ Used everywhere - required for app to function  
**Used in:** Database queries, authentication, user management  
**Files:**
- `lib/env/server.ts` - Validates presence
- `lib/supabase/client.ts` - Client initialization
- `lib/supabase/utils.ts` - Server utilities
- `app/actions/admin.ts` - Admin operations
- `app/actions/island-brain.ts` - AI operations

**Failure Impact:** 🔴 **CRITICAL** - App cannot run without database connection

---

### 2. PAYPAL (Payments) - REQUIRED
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID      ← Public, used by client
PAYPAL_CLIENT_SECRET              ← SECRET, server-only
NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL   ← Plan ID for Digital Legends ($4.99/mo)
NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY
NEXT_PUBLIC_PAYPAL_PLAN_STARTER   ← Plan ID for Island Starter ($9.99/mo)
NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY
NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS   ← Plan ID for Legends Plus ($19.99/mo)
NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY
NEXT_PUBLIC_PAYPAL_PLAN_FAMILY    ← Plan ID for Family Legacy ($34.99/mo)
NEXT_PUBLIC_PLAN_FAMILY_YEARLY
```
**Status:** ✅ Used in checkout and subscription management  
**Used in:** Payment processing, subscription management, checkout page  
**Files:**
- `lib/paypal-api.ts` - OAuth token & API calls
- `lib/paypal.ts` - Configuration & plan definitions
- `components/CheckoutFlow.tsx` - Checkout UI
- `components/MusicStore/PurchaseModal.tsx` - Music purchases
- `app/api/payments/paypal/*` - Payment API endpoints

**Failure Impact:** 🔴 **CRITICAL** - Payment system completely broken without these

**Plan ID Format:** PayPal subscription plans are formatted as `P-XXXXXXXXXXXXX`  
**Current Status in Code:** Using `requireEnv()` with fallback to empty string during build

---

### 3. GOOGLE GENERATIVE AI / GEMINI (AI Content Generation) - REQUIRED

**Either one is required (code accepts both names):**
```
GEMINI_API_KEY                    ← Alternative name
GOOGLE_GENERATIVE_AI_API_KEY      ← Preferred name
```
**Status:** ✅ Used for all AI features  
**Used in:** Story generation, game creation, content personalization, Tanty memory  
**Files:**
- `lib/gemini-tts.ts` - Text-to-speech generation
- `lib/game-generator.ts` - Game creation
- `lib/story-engine.ts` - Story generation
- `lib/ai-content-generator/core.ts` - Content generation
- `lib/ai-image-generator/image-client.ts` - Image generation
- `app/actions/island-brain.ts` - AI orchestration
- `services/geminiService.ts` - Gemini service wrapper
- `services/tantyMemory.ts` - AI character memory
- `app/actions/tanty.ts` - Tanty character responses
- `app/actions/games.ts` - Game question generation

**Failure Impact:** 🔴 **CRITICAL** - All AI features disabled/broken

---

## 🟡 HIGHLY IMPORTANT VARIABLES (Required for Key Features)

### 4. EMAIL SERVICE - REQUIRED (for auth, notifications)

**One of these is required:**
```
RESEND_API_KEY                    ← Modern email service (Preferred)
BREVO_API_KEY                     ← Alternative email service (Sendinblue)
```

**And:** `EMAIL_FROM` - Sender email address (fallback: 'Likkle Legends <noreply@likklelegends.com>')

**Status:** ✅ Used for sending emails  
**Used in:** Authentication emails, notifications, password resets, streak nudges  
**Files:**
- `lib/email.ts` - Email sending logic (supports both Resend and Brevo)

**Failure Impact:** 🟡 **HIGH** - Users cannot receive auth emails, password resets fail

---

### 5. ELEVENLABS (Text-to-Speech) - REQUIRED for voice features
```
ELEVENLABS_API_KEY               ← API key
ELEVENLABS_VOICE_ID              ← Default voice ID
ELEVENLABS_TANTY_VOICE_ID        ← Tanty character voice
ELEVENLABS_ROTI_VOICE_ID         ← Roti character voice
ELEVENLABS_DILLY_VOICE_ID        ← Dilly character voice
```
**Status:** ✅ Used for character voice synthesis  
**Used in:** Character audio, story narration, buddy chat responses  
**Files:**
- `lib/elevenlabs.ts` - ElevenLabs API wrapper
- `lib/services/elevenlabs.ts` - Service implementation

**Failure Impact:** 🟡 **HIGH** - Audio features unavailable, stories cannot play

---

## 🟠 IMPORTANT OPTIONAL VARIABLES

### 6. CLOUDFLARE STREAM (Video Hosting)
```
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID   ← Account ID (default: provided)
NEXT_PUBLIC_CLOUDFLARE_SUBDOMAIN    ← Stream subdomain (default: provided)
CLOUDFLARE_API_TOKEN                ← API token for management
```
**Status:** ⚠️ Fallback values provided in code  
**Failure Impact:** 🟠 **MEDIUM** - Videos won't upload, but can view existing

---

### 7. SENTRY (Error Tracking)
```
NEXT_PUBLIC_SENTRY_DSN            ← Client-side error tracking
```
**Status:** ✅ Optional but recommended  
**Failure Impact:** 🟠 **LOW** - Errors won't be tracked centrally

---

### 8. AZURACAST (Radio Streaming)
```
AZURACAST_BASE_URL               ← AzuraCast server URL
AZURACAST_API_KEY                ← API key
AZURACAST_STATION_TANTY_SPICE    ← Station ID
AZURACAST_STATION_ROTI           ← Station ID
AZURACAST_STATION_DILLY_DOUBLES  ← Station ID
AZURACAST_STATION_STEELPAN_SAM   ← Station ID
```
**Status:** ⚠️ Optional but needed for radio features  
**Failure Impact:** 🟠 **LOW-MEDIUM** - Radio stations unavailable

---

### 9. GOOGLE SHEETS (Data Management)
```
GOOGLE_SHEETS_API_KEY            ← For sheet integration
GOOGLE_CLOUD_TTS_API_KEY         ← For cloud TTS (backup)
```
**Status:** ⚠️ Optional, advanced features  
**Failure Impact:** 🟠 **LOW** - Advanced integrations unavailable

---

### 10. OTHER OPTIONAL
```
CRON_SECRET                      ← For scheduled jobs
JWT_SECRET                       ← Session/JWT signing
NEXT_PUBLIC_FACEBOOK_PIXEL_ID    ← Analytics
FIGMA_PERSONAL_ACCESS_TOKEN      ← Design asset integration
META_API_TOKEN                   ← Meta integration (unused)
```

---

## ✅ VERIFICATION CHECKLIST FOR VERCEL

### Step 1: Access Vercel Environment Variables
1. Go to: https://vercel.com
2. Select project: `likkle-legends`
3. Navigate to: **Settings** → **Environment Variables**
4. Filter by environment: **Production** (if available)

### Step 2: Verify CRITICAL Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Not empty ✓
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Not empty ✓
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Not empty, marked as **Secret** ✓
- [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` - Not empty ✓
- [ ] `PAYPAL_CLIENT_SECRET` - Not empty, marked as **Secret** ✓
- [ ] `GEMINI_API_KEY` OR `GOOGLE_GENERATIVE_AI_API_KEY` - At least one present ✓
- [ ] `RESEND_API_KEY` OR `BREVO_API_KEY` - At least one present ✓

### Step 3: Verify PayPal Plan IDs
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL` - Format: `P-XXXXX` ✓
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY` - Format: `P-XXXXX` ✓
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_STARTER` - Format: `P-XXXXX` ✓
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY` - Format: `P-XXXXX` ✓
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS` - Format: `P-XXXXX` ✓
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY` - Format: `P-XXXXX` ✓
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_FAMILY` - Format: `P-XXXXX` ✓
- [ ] `NEXT_PUBLIC_PLAN_FAMILY_YEARLY` - Format: `P-XXXXX` ✓

### Step 4: Verify Voice Variables
- [ ] `ELEVENLABS_API_KEY` - If voice features are used ✓
- [ ] `ELEVENLABS_VOICE_ID` - Fallback value: `eppqEXVumQ3CfdndcIB` ✓
- [ ] `ELEVENLABS_TANTY_VOICE_ID` - Fallback: `JfiM1myzVx7xU2MZOAJS` ✓
- [ ] `ELEVENLABS_ROTI_VOICE_ID` - Fallback: `eppqEXVumQ3CfdndcIB` ✓

### Step 5: Verify Email Configuration
- [ ] `RESEND_API_KEY` OR `BREVO_API_KEY` - At least one set ✓
- [ ] `EMAIL_FROM` - Should be a valid email, e.g., `noreply@likklelegends.com` ✓

### Step 6: Secret Variable Protection
Ensure these are marked as **Secret** (not visible in logs):
- ✓ `SUPABASE_SERVICE_ROLE_KEY`
- ✓ `PAYPAL_CLIENT_SECRET`
- ✓ `RESEND_API_KEY` (if using)
- ✓ `BREVO_API_KEY` (if using)
- ✓ `ELEVENLABS_API_KEY`
- ✓ `CLOUDFLARE_API_TOKEN`
- ✓ `AZURACAST_API_KEY`

### Step 7: Public Variable Names
These MUST have `NEXT_PUBLIC_` prefix to be available to client:
- ✓ `NEXT_PUBLIC_SUPABASE_URL`
- ✓ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✓ `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- ✓ `NEXT_PUBLIC_PAYPAL_PLAN_*`
- ✓ `NEXT_PUBLIC_CLOUDFLARE_*`
- ✓ `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
- ✓ `NEXT_PUBLIC_SENTRY_DSN`

---

## 🧪 TESTING EACH VARIABLE

### Test Database Connection
```bash
# Should be able to connect to Supabase
npm run dev
# Check that login page loads without errors
```

### Test Payments
1. Go to `/checkout`
2. Should see PayPal checkout button
3. PayPal should initialize (if NEXT_PUBLIC_PAYPAL_CLIENT_ID is set)
4. Subscription plans should be visible

### Test AI Features
1. Go to `/portal/buddy` (if authenticated)
2. Chat with buddy - should generate responses
3. If empty, check `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`

### Test Email
1. Signup with an email address
2. Should receive confirmation email
3. Check spam folder if not in inbox

### Test Voice
1. Go to any story with audio
2. Click play on audio player
3. Should hear narration (if ELEVENLABS_API_KEY is set)

---

## 🚨 MISSING VARIABLE ERROR MESSAGES

### Supabase Not Set
```
Error: Missing required environment variable: SUPABASE_URL
Error: Missing required environment variable: SUPABASE_ANON_KEY
Error: Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY
```

### PayPal Not Set
```
CRITICAL: Missing PayPal credentials (NEXT_PUBLIC_PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET)
```

### Gemini/Google AI Not Set
```
Error: GEMINI_API_KEY is missing in environment
Error: Missing API key for Gemini
```

### Email Not Set
```
No email service configured - emails will not be sent
```

---

## 📝 ENVIRONMENT VARIABLE TEMPLATE

For reference, here's what should be configured:

```bash
# SUPABASE (Database & Auth) - REQUIRED
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# PAYPAL (Payments) - REQUIRED
NEXT_PUBLIC_PAYPAL_CLIENT_ID="ASxxxxx"
PAYPAL_CLIENT_SECRET="EOxxxx"
NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL="P-xxxxx"
NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL_YEARLY="P-xxxxx"
NEXT_PUBLIC_PAYPAL_PLAN_STARTER="P-xxxxx"
NEXT_PUBLIC_PAYPAL_PLAN_MAIL_YEARLY="P-xxxxx"
NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS="P-xxxxx"
NEXT_PUBLIC_PAYPAL_PLAN_PLUS_YEARLY="P-xxxxx"
NEXT_PUBLIC_PAYPAL_PLAN_FAMILY="P-xxxxx"
NEXT_PUBLIC_PLAN_FAMILY_YEARLY="P-xxxxx"

# GOOGLE GENERATIVE AI / GEMINI - REQUIRED (choose one)
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."  # Preferred
# OR
GEMINI_API_KEY="AIzaSy..."  # Alternative

# EMAIL SERVICE - REQUIRED (choose one)
RESEND_API_KEY="re_xxxxx"  # Preferred
# OR
BREVO_API_KEY="xkeysib_xxxxx"  # Alternative

EMAIL_FROM="Likkle Legends <noreply@likklelegends.com>"

# VOICE / AUDIO - RECOMMENDED
ELEVENLABS_API_KEY="sk_xxxxx"
ELEVENLABS_VOICE_ID="eppqEXVumQ3CfdndcIB"
ELEVENLABS_TANTY_VOICE_ID="JfiM1myzVx7xU2MZOAJS"
ELEVENLABS_ROTI_VOICE_ID="eppqEXVumQ3CfdndcIB"
ELEVENLABS_DILLY_VOICE_ID="eppqEXVumQ3CfdndcIB"

# OPTIONAL
CLOUDFLARE_API_TOKEN="xxx"
AZURACAST_API_KEY="xxx"
AZURACAST_BASE_URL="https://radio.example.com"
SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
```

---

## 🔄 DEPLOYMENT WORKFLOW

### When Deploying to Vercel:

1. **Set all CRITICAL variables in Vercel UI**
   - Go to Settings → Environment Variables
   - Add each variable
   - Select "Production" environment
   - Mark secrets appropriately

2. **Trigger new deployment**
   - Push code to branch
   - Vercel will rebuild with new env vars
   - Check build logs for missing variable errors

3. **Verify in deployment logs**
   - Look for any "env var missing" warnings
   - Check for API connection errors
   - Verify payment/AI endpoints are reachable

4. **Run smoke tests**
   - Test signup/login
   - Test payment flow
   - Test AI features
   - Test email sending

---

## 📊 SUMMARY TABLE

| Variable | Required | Type | Impact | Status |
|----------|----------|------|--------|--------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ Yes | Public | 🔴 Critical | - |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ Yes | Public | 🔴 Critical | - |
| SUPABASE_SERVICE_ROLE_KEY | ✅ Yes | Secret | 🔴 Critical | - |
| NEXT_PUBLIC_PAYPAL_CLIENT_ID | ✅ Yes | Public | 🔴 Critical | - |
| PAYPAL_CLIENT_SECRET | ✅ Yes | Secret | 🔴 Critical | - |
| PayPal Plan IDs (x8) | ✅ Yes | Public | 🔴 Critical | - |
| GEMINI_API_KEY | ✅ Yes | Secret | 🔴 Critical | - |
| RESEND_API_KEY | ✅ Yes | Secret | 🟡 High | - |
| ELEVENLABS_API_KEY | ⚠️ Optional | Secret | 🟡 High | - |
| CLOUDFLARE_API_TOKEN | ⚠️ Optional | Secret | 🟠 Medium | - |
| AZURACAST_API_KEY | ⚠️ Optional | Secret | 🟠 Medium | - |
| SENTRY_DSN | ⚠️ Optional | Public | 🟠 Low | - |

---

## 🎯 NEXT STEPS

1. **Verify Vercel Configuration**
   - [ ] Log into Vercel
   - [ ] Check project: likkle-legends
   - [ ] Verify all CRITICAL variables are set
   - [ ] Mark SECRET variables appropriately

2. **For Missing Variables**
   - [ ] Retrieve from password manager / team docs
   - [ ] Add to Vercel UI
   - [ ] Trigger redeploy
   - [ ] Verify build succeeds

3. **Post-Deployment Testing**
   - [ ] Test signup/login
   - [ ] Test payment checkout
   - [ ] Test AI features
   - [ ] Test email sending
   - [ ] Check error logs (Sentry or Vercel logs)

4. **Production Monitoring**
   - [ ] Watch for environment variable errors in logs
   - [ ] Monitor API integrations
   - [ ] Track email delivery
   - [ ] Monitor payment transactions

---

**Report Status:** ✅ Complete  
**Last Updated:** 2026-04-01  
**For Questions:** See DEPLOYMENT.md and CLAUDE.md
