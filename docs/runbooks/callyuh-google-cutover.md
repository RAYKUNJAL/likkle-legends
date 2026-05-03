# Callyuh Google Cutover Runbook

Callyuh is already Firebase/Firestore-centered in code, so treat this as a runtime migration.

## Move First

- Static Vite build to Firebase Hosting.
- Vercel API handlers to Cloud Run or Cloud Functions.
- Vercel cron to Cloud Scheduler.
- Vercel env vars to Secret Manager.

## Preserve

- Existing Firestore collections.
- Existing Firebase Auth path.
- Existing PayPal Firestore persistence model.
- Existing Google voice baseline and premium voice provider routing.

## Staging Gates

- Login and admin bootstrap pass.
- Business onboarding creates expected Firestore records.
- PayPal sandbox order and webhook replay pass.
- WhatsApp webhook health endpoint responds.
- AI speech endpoint responds with Google voice fallback.
- Daily SEO/blog scheduled job runs once by manual trigger.
- Autonomy heartbeat writes a log.

## Cutover

1. Deploy Firebase Hosting preview/staging.
2. Deploy API runtime to Cloud Run.
3. Move secrets from Vercel to Secret Manager.
4. Replace Vercel cron with Cloud Scheduler.
5. Run staging smoke checks.
6. Lower DNS TTL and switch production domain.
7. Keep Vercel available for rollback for 48 to 72 hours.
