# Likkle Legends 2.0 - Deployment & Setup Guide

## 1. Environment Setup

Ensure your `.env.local` file has the following variables:

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayPal (Payments)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# ElevenLabs (AI Voice)
ELEVENLABS_API_KEY=your_elevenlabs_key

# Google Analytics
NEXT_PUBLIC_GA_LOG_ID=your_ga_id
```

## 2. Database Setup

Run the following SQL scripts in your Supabase SQL Editor to create the necessary tables:

1.  **Core Schema**: Run `supabase_schema.sql` (Creates users, children, subscriptions, etc.)
2.  **Messaging System**: Run `supabase_messaging.sql` (Creates messages, notifications tables)
3.  **Gamification**: Ensure `xp_events`, `child_badges`, and `children` tables are created (included in schemas above).

## 3. Storage Setup

Create the following public buckets in Supabase Storage:
- `avatars` (for user and child profiles)
- `stories` (for storybook covers and assets)
- `songs` (for audio files and thumbnails)
- `content` (for miscellaneous content)

## 4. Build & Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## 5. Admin Usage
Access the admin panel at `/admin`.
*   **Media**: Upload songs and videos.
*   **Characters**: Manage AR characters/voices.
*   **Orders**: Track physical mailer fulfillment.

## 6. Parent & Child Flow
*   **Sign Up**: Create a parent account and child profile.
*   **Subscription**: Checkout via PayPal for physical/digital access.
*   **Portal**: Children access `/portal` for stories, games, and missions.
*   **Dashboard**: Parents track progress at `/analytics` and `/dashboard`.

## 7. Messaging
*   Parents can invite grandparents/family.
*   Messages appear in `/messages`.
