# 🚀 Likkle Legends Commercial Launch Checklist

This checklist covers all critical actions required to transform the codebase into a production-ready commercial product.

## 1. 🎨 Design & User Experience (UX)
- [ ] **Favicon & App Icons**: Ensure `favicon.ico`, `icon.png`, and `apple-icon.png` are custom (not Vercel/Next.js defaults).
- [ ] **Open Graph (Social) Images**: Add `opengraph-image.png` and `twitter-image.png` to `app/`. Ensuring links shared on WhatsApp/Slack/Twitter look professional.
- [ ] **404 Page**: Verify `app/not-found.tsx` exists and guides users back to safety.
- [ ] **Loading States**: Check `loading.tsx` implementations for smooth transitions.
- [ ] **Mobile Responsiveness**: Test critical flows (Signup, Checkout, Dashboard) on an actual phone.
- [ ] **Accessibility Audit**: Final check for `aria-labels` on all buttons (Done ✅).

## 2. 🔍 SEO & Discovery
- [ ] **Metadata Scan**: Ensure every page (especially marketing pages) has a unique `title` and `description` export.
- [ ] **Sitemap**: Create `app/sitemap.ts` to generate `sitemap.xml` for Google.
- [ ] **Robots.txt**: Create `app/robots.ts` to control crawler access.
- [ ] **Structured Data**: Add JSON-LD schemas for "Organization" and "Product".
- [ ] **Canonical URLs**: Ensure `metadataBase` is set in `app/layout.tsx`.

## 3. 🛡️ Security & Performance
- [ ] **Environment Variables**: Verify no test keys (PayPal Sandbox) are in Production environment variables.
- [ ] **Database Policies (RLS)**: Double-check Supabase RLS policies. User data must be private.
- [ ] **Console Logs**: Remove `console.log` debuggers from client-side code.
- [ ] **Image Optimization**: Ensure all `<img>` tags are using `next/image` with proper sizing to avoid CLS (Cumulative Layout Shift).
- [ ] **CSP Headers**: Configure Content Security Policy in `middleware.ts` or `next.config.js`.

## 4. ⚖️ Legal & Compliance (Crucial for Kids' App)
- [ ] **Privacy Policy**: Must be accessible from the footer and signup forms.
- [ ] **Terms of Service**: Clearly defined usage rights.
- [ ] **COPPA/GDPR-K Compliance**: Ensure you are NOT collecting unnecessary data from children without parental consent flow.
- [ ] **Cookie Banner**: If using analytics/tracking, a consent banner is mandatory.

## 5. 💳 Commerce & Operations
- [ ] **PayPal Setup**: Configure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` with Live Client ID.
- [ ] **PayPal Plans**: Create recurring plans in PayPal Dashboard (Starter, Legends Plus, Family) and add their IDs to `NEXT_PUBLIC_PAYPAL_PLAN_*` env vars.
- [ ] **Email Delivery**: Verify Resend/Supabase SMTP is authenticated (DKIM/SPF) to prevent spam folders.
- [ ] **Webhook Handlers**: Test that successful payments *actually* provision access in production.

## 6. 📈 Analytics & Monitoring
- [ ] **Analytics**: Integrate Google Analytics 4 (GA4) or PostHog.
- [ ] **Error Tracking**: Set up Sentry to catch crashes users experience.
- [ ] **Uptime Monitoring**: Use a service like UptimeRobot to ping the site every 5 mins.

## 7. 🚀 Final Pre-Flight Scans
- [ ] **Broken Link Check**: Run a crawler to find dead links.
- [ ] **Lighthouse Score**: Run Chrome DevTools Lighthouse audit; aim for >90 in Performance/SEO/Accessibility.
- [ ] **Browser Testing**: Check Safari (iOS/Mac) and Chrome.

---

### Recommended Immediate Next Steps:
1. Generate `app/sitemap.ts` and `app/robots.ts`.
2. Configure `metadataBase` in `app/layout.tsx`.
3. Switch PayPal keys to Live mode.
