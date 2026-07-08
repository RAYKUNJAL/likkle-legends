# Likkle Legends Google/Firebase Migration

This repo now has a Google-native target next to the current Vercel/Supabase runtime.
Do not switch DNS or payment webhooks until staging passes the cutover gates below.

## Target Stack

- Firebase App Hosting: Next.js web app and normal API routes.
- Firebase Auth: parent/admin identity.
- Firestore: users, children, entitlements, payments, generated assets, jobs, audit, Paperclip events.
- Cloud Storage: uploads, generated images, printables, thumbnails, Remotion outputs.
- Cloud Run: PayPal webhook service, AI worker, Remotion worker, long-running jobs.
- Cloud Tasks: async jobs triggered by checkout, onboarding, content generation, video creation.
- Cloud Scheduler: recurring content, reports, cleanup, heartbeat jobs.
- Vertex AI/Gemini: default AI brain for lessons, stories, blogs, scripts, and agent work.
- Paperclip: team board, budgets, approvals, audit trail, and governed automation.

## Project IDs

- Production/current Google project: `likkle-legends`
- Staging: create `likkle-legends-staging` later if you want a separate pre-production project.

Update `.firebaserc` if the real Google project IDs differ. As of this migration checkpoint, `gcloud` can see the `likkle-legends` project, but billing must be attached before Cloud Run, Cloud Tasks, Cloud Scheduler, Secret Manager, Cloud Build, Artifact Registry, or App Hosting can be fully enabled.

## Migration Phases

1. Foundation: enable Firebase Auth, Firestore, Storage, App Hosting, Cloud Run, Cloud Tasks, Cloud Scheduler, Secret Manager, Cloud Build, and Vertex AI.
2. Runtime: deploy the current Next.js app to Firebase App Hosting staging.
3. Auth/data shadowing: mirror Supabase profiles, children, entitlements, purchases, and content into Firestore while Supabase remains the live source.
4. Payments: move PayPal webhooks to Cloud Run, verify signatures, store immutable events, and update Firestore entitlements idempotently.
5. AI/content: route Gemini calls through guarded server code with daily hard limits and Paperclip approval events.
6. Video: run Remotion render jobs on Cloud Run, write outputs to Cloud Storage, and queue YouTube approvals.
7. Cutover: run smoke tests, lower DNS TTL, switch domain, keep the old runtime available for 48 to 72 hours, then retire old writes.

## Required Secrets

Use Firebase App Hosting secrets or Google Secret Manager for:

- `GEMINI_API_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAPERCLIP_GOVERNANCE_TOKEN`
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` only when not using workload identity or default credentials.

## Cutover Gates

- `npm run build` passes locally and in Google build.
- Signup, login, island picker, child creation, and portal entry pass in staging.
- PayPal order create, capture, webhook replay, and entitlement unlock pass in staging.
- AI generation refuses jobs above configured cost limits.
- Remotion render worker creates a video, thumbnail, captions, and metadata in Cloud Storage.
- Admin approval queue can approve or reject generated content.
- Paperclip records deployment, payment, AI budget, and YouTube publishing approvals.
