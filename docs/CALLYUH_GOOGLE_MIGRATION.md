# Callyuh Google/Firebase Migration Notes

Callyuh should move to the same Google operating model, but it does not need the same level of data rewrite as Likkle Legends.
The current Callyuh app is already Firebase/Firestore-centered in code; the migration is mostly hosting, APIs, cron, and env management.

## Recommended Target

- Firebase Hosting for the Vite front end.
- Cloud Run or Cloud Functions for the current `api/` handlers and `server.ts` functionality.
- Firestore remains the data source.
- Cloud Scheduler replaces Vercel cron.
- Secret Manager replaces Vercel env vars.
- Paperclip owns launch room, approvals, cost gates, and audit.

## Keep

- Firebase Auth.
- Existing Firestore collections and rules where they are already production-shaped.
- Existing PayPal order, webhook, credit, and invoice Firestore model.
- Existing Gemini and voice provider routing, with Google as default and premium providers as paid-tier options.

## Move

- Vercel static hosting to Firebase Hosting.
- Vercel API handlers to Cloud Run/Functions.
- Vercel cron to Cloud Scheduler.
- Vercel env vars to Secret Manager and Firebase config.
- Background heartbeats and SEO jobs to Cloud Scheduler plus Cloud Tasks.

## First Cutover Gate

Before switching DNS, prove in Google staging:

- Login and admin bootstrap.
- Business onboarding.
- PayPal test order and webhook replay.
- WhatsApp webhook health.
- AI speech endpoint.
- Daily blog/SEO scheduled job.
- Autonomy heartbeat.
- Config status page showing all required Google secrets present.
