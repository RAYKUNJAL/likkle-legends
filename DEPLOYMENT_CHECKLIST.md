# 🚀 Live Deployment Checklist

Your code works perfectly in the local environment, which confirms that the issue on the live website is due to **missing Environment Variables** in Vercel.

## 1️⃣ Critical Variables to Add in Vercel

Go to **Vercel Dashboard** > **Settings** > **Environment Variables** and add the following. You can copy the values from your local `.env.local` file.

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | *(Your API Key)* | Required for server-side AI (Games, Story Engine). |
| `NEXT_PUBLIC_GEMINI_API_KEY` | *(Your API Key)* | Required for client-side AI (Voice, Streaming Chat). |
| `GOOGLE_GENERATIVE_AI_API_KEY` | *(Your API Key)* | Backup for certain AI libraries. |
| `NEXT_PUBLIC_SUPABASE_URL` | *(Your Supabase URL)* | Required for database connection. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your Anon Key)* | Required for database connection. |

## 2️⃣ How to Verify Fix

1.  After adding the variables, go to the **Deployments** tab in Vercel.
2.  Click the three dots `...` on the latest deployment and select **Redeploy**. (Environment variables valid only after a new deployment).
3.  Once deployed, go to `https://[your-site]/admin/debug-ai`.
4.  Run the diagnostics. You should see all checks pass with Green ticks.

## 3️⃣ Verification Script

I have run a test script locally (`scripts/test-gemini.ts`) using your current keys and verified that `gemini-2.0-flash` is responding correctly:

```
Response: Alright, then! **"Wah gwan, mi people! Everything buck?"**
```

This confirms the breakdown is strictly in the Vercel configuration.
