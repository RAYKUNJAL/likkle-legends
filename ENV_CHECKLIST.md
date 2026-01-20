# Environment Variables Checklist for Production

## ✅ Already Configured (in .env.local)
- [x] `GEMINI_API_KEY` - AI content generation
- [x] `ELEVENLABS_API_KEY` - Voice generation
- [x] `ELEVENLABS_VOICE_ID` - Tanty Spice voice

## 🚨 Required for Production (Add to Vercel)

### Supabase (Database & Auth) - CRITICAL
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

### PayPal (Payments) - CRITICAL
- [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` - PayPal client ID
- [ ] `PAYPAL_CLIENT_SECRET` - PayPal secret
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_STARTER` - Starter plan ID
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS` - Legends Plus plan ID
- [ ] `NEXT_PUBLIC_PAYPAL_PLAN_FAMILY` - Family Legacy plan ID

### Resend (Email) - RECOMMENDED
- [ ] `RESEND_API_KEY` - For transactional emails

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
