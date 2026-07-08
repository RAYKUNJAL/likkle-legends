# Google Cutover Runbook

Use this runbook when moving Likkle Legends from the current Vercel/Supabase runtime to the Google runtime.

## 1. Prepare Google

```powershell
.\scripts\google\bootstrap-project.ps1 -ProjectId likkle-legends-staging
.\scripts\google\bootstrap-project.ps1 -ProjectId likkle-legends-prod
```

Set App Hosting secrets:

```powershell
npx firebase-tools login
npx firebase-tools apphosting:secrets:set GEMINI_API_KEY
npx firebase-tools apphosting:secrets:set PAYPAL_CLIENT_ID
npx firebase-tools apphosting:secrets:set PAYPAL_CLIENT_SECRET
npx firebase-tools apphosting:secrets:set PAYPAL_WEBHOOK_ID
npx firebase-tools apphosting:secrets:set PAPERCLIP_GOVERNANCE_TOKEN
```

## 2. Deploy Rules

```powershell
.\scripts\google\deploy-rules.ps1 -ProjectAlias staging
```

## 3. Deploy Staging App

Create the App Hosting backend in Firebase console or CLI, connected to this GitHub repo.
Then deploy:

```powershell
.\scripts\google\deploy-app-hosting.ps1 -ProjectAlias staging
```

## 4. Smoke Test Staging

```powershell
.\scripts\google\smoke-google-staging.ps1 -BaseUrl https://STAGING_URL
```

Manual smoke gates:

- Parent signup with island picker.
- Child onboarding.
- Portal entry.
- Checkout create order.
- PayPal capture or sandbox webhook replay.
- Digital Activity Super-Pack entitlement.
- Heritage Story entitlement.
- Admin approval queue.
- Gemini generation under cost guard.
- Remotion render worker writes to Cloud Storage.

## 5. Switch Production

Only after staging passes:

1. Lower DNS TTL.
2. Add production domain in Firebase/App Hosting.
3. Switch PayPal webhook URL to the Google endpoint.
4. Switch DNS.
5. Keep Vercel/Supabase write path available for rollback for 48 to 72 hours.
6. Export and import the final Supabase delta.
7. Disable old writes.

## Rollback

If signup, checkout, or portal entry fails after cutover:

1. Point DNS back to the old runtime.
2. Restore the old PayPal webhook URL.
3. Pause Cloud Scheduler jobs.
4. Keep Firestore shadow writes for forensic comparison.
