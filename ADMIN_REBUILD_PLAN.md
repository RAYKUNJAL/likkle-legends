# Admin Control Center Rebuild Plan

## Objective
Deep audit and rebuild of the Admin Control Center to ensure all features are working commercial grade.

## Feature Checklist & Status

### 1. Core Dashboard
- [ ] **Overview** (`app/admin/page.tsx`)
    - Current: Static/Broken.
    - Goal: Real-time stats (Revenue, Signups, Active Users).

### 2. CRM & Sales
- [ ] **Leads & CRM** (`app/admin/leads/page.tsx`)
- [ ] **Customers** (`app/admin/customers/page.tsx`)
- [ ] **Orders & Fulfillment** (`app/admin/orders/page.tsx`)

### 3. Content Management
- [ ] **Content Library** (`app/admin/content/page.tsx`)
- [ ] **Approval Queue** (`app/admin/ai-review/page.tsx`) - *Partially Fixed*
- [ ] **Media Library** (`app/admin/media/page.tsx`)
- [ ] **Blog Manager** (`app/admin/blog/page.tsx`)
- [ ] **Site CMS** (`app/admin/cms/page.tsx`)

### 4. AI & Studios
- [ ] **Legend AI Studio** (`app/admin/studio/page.tsx`?)
- [ ] **Characters** (`app/admin/characters/page.tsx`)
- [ ] **AI Brain & Personality** (`app/admin/brain/page.tsx`?)
- [ ] **Game Builder** (`app/admin/games/page.tsx`)
- [ ] **Voice AI Demo** (`app/admin/voice/page.tsx`?)
- [ ] **Fresh Content Agent** (`app/admin/auto-content/page.tsx`?)
- [ ] **Growth Agent** (`app/admin/growth/page.tsx`?)
- [ ] **AI Diagnostics** (`app/admin/debug-ai/page.tsx`?)

### 5. Marketing & Analytics
- [ ] **Announcements** (`app/admin/announcements/page.tsx`)
- [ ] **Analytics** (`app/admin/analytics/page.tsx`)
- [ ] **Launch Pixels** (`?`)
- [ ] **Launch Verification** (`?`)
- [ ] **Messages** (`app/admin/messages/page.tsx`)

## Implementation Phases

### Phase 1: Dashboard & Infrastructure
- Fix `app/admin/page.tsx` to fetch real data.
- Ensure `AdminLayout` works correctly.
- Verify reliable Admin Authentication (RLS/Middleware).

### Phase 2: CRM & Orders
- Connect `Customers` and `Orders` to Supabase `profiles` and `orders` tables.
- Implement correct RLS for admin viewing.

### Phase 3: Content & Media
- Ensure `Content Library` can edit/delete content.
- Fix `Media Library` uploads.

### Phase 4: AI Tools
- Connect AI studios to their respective agents/backends.

---
**Current Focus**: Phase 1 - Dashboard Overview
