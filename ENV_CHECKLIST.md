# Environment Variables Checklist for Production

## ✅ Already Configured (in .env.local)
- [x] `GEMINI_API_KEY` - AI content generation
- [x] `ELEVENLABS_API_KEY` - Voice generation
- [x] `ELEVENLABS_VOICE_ID` - Tanty Spice voice

## 🚨 Required for Production (Add to Vercel)

### Supabase (Database & Auth) - CRITICAL
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Provided in `SECRETS_FOR_VERCEL.txt`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Provided in `SECRETS_FOR_VERCEL.txt`
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Provided in `SECRETS_FOR_VERCEL.txt`

### PayPal (Payments) - CRITICAL
- [x] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` - Provided in `SECRETS_FOR_VERCEL.txt`
- [x] `PAYPAL_CLIENT_SECRET` - Provided in `SECRETS_FOR_VERCEL.txt`
- [x] `NEXT_PUBLIC_PAYPAL_PLAN_STARTER` - Provided in `SECRETS_FOR_VERCEL.txt`
- [x] `NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS` - Provided in `SECRETS_FOR_VERCEL.txt`
- [x] `NEXT_PUBLIC_PAYPAL_PLAN_FAMILY` - Provided in `SECRETS_FOR_VERCEL.txt`

### Resend (Email) - RECOMMENDED
- [x] `RESEND_API_KEY` - Provided in `SECRETS_FOR_VERCEL.txt`

### Analytics - RECOMMENDED
- [ ] `NEXT_PUBLIC_GA_ID` - Google Analytics 4 ID
- [ ] `NEXT_PUBLIC_FB_PIXEL_ID` - Facebook Pixel ID

### Error Tracking - RECOMMENDED
- [ ] `SENTRY_DSN` - Sentry error tracking
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Client-side Sentry

## How to Add to Vercel
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with appropriate scope (Production/Preview/Development)
4. Redeploy after adding variables
