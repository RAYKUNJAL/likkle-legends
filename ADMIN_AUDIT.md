# Admin Control Center Audit & Rebuild Plan

## Verified Functional Modules (Green Status 🟢)
These modules have clean code, correct server actions, and active routes.
1.  **Overview Dashboard** (`/admin`) - Loads analytics, orders, customers.
2.  **Customers** (`/admin/customers`) - Full CRM view, filtering, and detail modals.
3.  **Orders & Fulfillment** (`/admin/orders`) - Stannp integration ready, status tracking.
4.  **Legend AI Studio** (`/admin/studio`) - Recently hardened Agent generation.
5.  **AI Verification Queue** (`/admin/ai-review`) - **NEW** - Review raw AI output before processing.
6.  **Standard Approval Queue** (`/admin/approval`) - Review processed/manual content (Stories, Songs).
7.  **Launch Verification** (`/admin/verify`) - QA Hub for testing environment variables and simulations.

## Modules Requiring Audit & Fixes (Yellow/Red Status 🟡🔴)
These modules likely have placeholder code, outdated actions, or broken UI.

### Priority 1: Content & Growth
- [ ] **Content Library** (`/admin/content`): Logic exists in `admin.ts`, verify UI.
- [ ] **Fresh Content Agent** (`/admin/auto-content`): Likely needs connection to `IslandBrainOrchestrator`.
- [ ] **Characters** (`/admin/characters`): Needs to sync with `characters` table for dynamic portal handling.
- [ ] **Blog Manager** (`/admin/blog`): Verify `posts` table and editor.
- [ ] **Site CMS** (`/admin/cms`): Verify if this controls the Landing Page (Sanity/Supabase?).

### Priority 2: Marketing & Communication
- [ ] **Leads & CRM** (`/admin/leads`): Verify lead capture from `story-studio` magnet.
- [ ] **Messages** (`/admin/messages`): Verify connection to `contact_submissions`.
- [ ] **Announcements** (`/admin/announcements`): Verify broadcast capability (email/in-app).
- [ ] **Growth Agent** (`/admin/email-engine`): Check if `resend` integration is active.

### Priority 3: Technical & Assets
- [ ] **Media Library** (`/admin/media`): Check Supabase Storage bucket listing.
- [ ] **Launch Pixels** (`/admin/pixels`): Audit Meta/TikTok pixel configuration interface.
- [ ] **Analytics** (`/admin/analytics`): Check strict numbers vs dashboard summary.
- [ ] **AI Diagnostics** (`/admin/debug-ai`): Verify Model health checks.

## Immediate Next Steps
1.  **AI Verification Queue Fix**: Confirmed formatting fixes for AI generation. (Done)
2.  **Navigation**: Added "AI Verification Queue" to sidebar. (Done)
3.  **Execute Audit**: Systematically visit and repair "Priority 1" modules.

## Action Item: `RESET_REVIEW_QUEUE.sql`
If you experience RLS errors in the Review Queue, run the provided SQL script in Supabase.
