# Admin Commercial Audit (March 5, 2026)

## Executive Summary

Current admin has strong content tooling, but revenue operations are fragmented across multiple pages. Core commercial functions (lifecycle automation orchestration, cross-channel health, and operator recommendations) were not unified in one execution surface.

This update adds a unified command center at `/admin/commercial` and fixes critical reliability gaps in game loading and admin navigation consistency.

## Critical Findings

1. Games hub runtime bug
- `Map` icon import from `lucide-react` shadowed JavaScript `Map`, breaking games hydration logic.

2. Data source mismatch for games
- `getGames()` queried `content_items` only, while game management uses dedicated `games` table.
- Result: game section could appear empty even with active games.

3. Admin workflow fragmentation
- Growth, support, analytics, and tracking were spread across separate pages with no single commercial command view.

4. Navigation consistency issues
- Some admin pages were mapped to wrong `activeSection`, reducing operator clarity in sidebar context.

## What Was Built

1. Reliability fixes
- Patched games page icon collision to restore hydration flow.
- Updated `getGames()` to use `games` table first, then fallback to `content_items`.

2. Commercial Ops Command Center
- New page: `/admin/commercial`
- Live metrics for:
  - Revenue (active subscribers, estimated MRR, pending orders)
  - Growth (lead volume, 7-day leads, email queue pressure)
  - Support (open/replied tickets)
  - Content inventory counts
- Integration health checks for:
  - Email (Resend)
  - SMS/WhatsApp (Twilio)
  - Social tracking (Meta Pixel)
  - Database (Supabase)
- AI-agent workflow cards linking directly to execution pages.
- Operational recommendations generated from queue pressure and config gaps.

3. Admin UX fixes
- Added `Commercial Ops` to Growth nav.
- Corrected section highlighting for:
  - `/admin/pixels` -> `activeSection="pixels"`
  - `/admin/games` -> `activeSection="games"`

## Commercial Stack Status

### Implemented now
- Email queue + campaign controls
- CRM lead capture + lead admin views
- Support inbox and reply workflow
- Pixel/analytics admin configuration
- Central commercial command view and recommendations

### Next build priorities
1. SMS/WhatsApp lifecycle engine
- Add queue table + worker similar to `email_queue`.
- Trigger flows: signup welcome, checkout abandonment, win-back.

2. Social publishing agent
- Add `social_queue` and provider adapters for Meta/X/TikTok.
- Agent cadence: 3 weekly posts auto-generated from content calendar.

3. Revenue agent automations
- Churn-risk scoring from engagement and billing events.
- Auto task generation in admin for save-offers and outreach.

4. Operator-grade KPI warehouse
- Add daily rollup table (`metrics_daily`) for stable dashboards.
- Track CAC proxy, lead-to-paid conversion, churn, LTV trend.

5. AI agent governance
- Add approval logs per agent action.
- Add action replay/history and idempotency keys.

## Success Criteria for “Million-Dollar Ops”

- Daily revenue dashboard with no manual spreadsheet work.
- Automated lifecycle messaging across email + SMS.
- Attribution confidence across major paid channels.
- Queue-driven ops: no hidden backlog in support/email/social.
- Weekly growth experiments tracked and measurable in admin.
