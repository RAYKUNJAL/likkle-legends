# Likkle Legends - App Deployment Guide 🚀

This guide covers the steps to deploy the Likkle Legends gamified reading application.

## 1. Prerequisites

- **Node.js**: v18 or higher (LTS recommended).
- **Supabase Account**: For authentication and database.
- **Vercel Account**: For hosting (recommended).

## 2. Environment Variables

Create a `.env.local` file in the root directory if it doesn't exist. You need the following keys:

```bash
# Public URL (for metadata)
NEXT_PUBLIC_APP_URL=https://your-app-url.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# CMS / Content (Optional if using local content)
# GOOGLE_GENERATIVE_AI_API_KEY=...
```

## 3. Database Setup (Supabase)

The application requires specific tables for gamification (XP, Levels, Badges).

1.  Go to your **Supabase Dashboard** -> **SQL Editor**.
2.  Open the file `supabase/migrations/20240210_gamification.sql` from this repository.
3.  Copy the entire content and paste it into the SQL Editor.
4.  Click **Run**.
    - This will create the `activities`, `badge_definitions`, and `badge_earnings` tables.
    - It sets up Row Level Security (RLS) policies.
    - It seeds initial badges.

## 4. Local Development

To run the app locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## 5. Building for Production

To verify the build before deploying:

```bash
npm run build
```

The output will be in the `.next` folder.

## 6. Vercel Deployment

1.  Push your code to a Git repository (GitHub/GitLab).
2.  Log in to **Vercel** and click **"Add New..."** -> **"Project"**.
3.  Import your repository.
4.  In **Environment Variables**, add the keys from Step 2 (`NEXT_PUBLIC_SUPABASE_URL`, etc.).
5.  Click **Deploy**.

## Troubleshooting

-   **Lint Errors**: The build is configured to ignore TypeScript errors (`ignoreBuildErrors: true`) to ensure deployment succeeds even with minor type mismatches.
-   **Missing Images**: Ensure `next.config.mjs` allows the domain of your image provider (default allows `*.supabase.co`).
-   **Audio/Video**: If media doesn't play, check the Content Security Policy (CSP) in `next.config.mjs`.

## Features Checklist

- [x] **Interactive Reader**: "Read to Me" with sync.
- [x] **Gamification**: XP, Levels, and Badges.
- [x] **Profile Page**: Real-time stats dashboard.
- [x] **Audio**: Background music and sound effects.

Happy Reading! 📚✨
