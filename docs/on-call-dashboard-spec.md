# On-Call Dashboard Spec (Production)

Use this spec to configure your monitoring dashboard for the live kids portal.

## Dashboard Name
- `Likkle Legends - Portal Live Health`

## Time Windows
- Default: `Last 30 minutes`
- Quick switches: `5m`, `1h`, `24h`

## Global Filters
- `environment=production`
- `app=likkle-legends`
- Optional filters:
  - `route`
  - `device_type`
  - `subscription_tier`
  - `user_role`

## Panel Layout

## Row 1: Executive Health
1. `Portal Interactive Success Rate` (Single Stat)
- Definition: sessions that reach interactive portal / total portal sessions.
- Target: `>= 98%`
- Alert: `< 95% for 10m` => `P0`.

2. `Auth Retry Clicks` (Single Stat + Sparkline)
- Source event: `portal_auth_retry_clicked`
- Alert: `> 100 events / 10m` => `P0`.

3. `Stories Failure Rate` (Single Stat)
- Source event: `portal_stories_load_failed`
- Formula: failures / stories page loads.
- Alert: `> 5% for 10m` => `P1`.

4. `Lessons Failure Rate` (Single Stat)
- Source event: `portal_lessons_load_failed`
- Formula: failures / lessons page loads.
- Alert: `> 5% for 10m` => `P1`.

## Row 2: Reliability & Retries
1. `Stories Failed vs Retry Clicked` (Line Chart)
- Events:
  - `portal_stories_load_failed`
  - `portal_stories_retry_clicked`
- Watch for retry clicks significantly lower than failures (bad UX).

2. `Lessons Failed vs Retry Clicked` (Line Chart)
- Events:
  - `portal_lessons_load_failed`
  - `portal_lessons_retry_clicked`

3. `Error Rate by Route` (Bar/Stacked)
- Routes:
  - `/portal`
  - `/portal/stories`
  - `/portal/lessons`
  - `/portal/games`
  - `/portal/buddy`
  - `/portal/settings`

4. `P95 API Latency` (Line)
- Endpoints:
  - `/api/character-chat`
  - `/api/learning-plan`
  - story/video fetch paths (if instrumented in APM)

## Row 3: Parent Controls & Safety
1. `Parent Controls Save Success` (Single Stat)
- Measure successful saves from `/portal/settings` updates.
- Alert: success rate `< 98% for 15m`.

2. `Channel Lock Denials` (Line, grouped by channel)
- Suggested event names:
  - `parental_control_block_stories`
  - `parental_control_block_lessons`
  - `parental_control_block_games`
  - `parental_control_block_radio`
  - `parental_control_block_buddy`
- Purpose: verify controls are actively enforcing.

3. `Daily Screen-Time Lockouts` (Line)
- Suggested event: `screen_time_limit_reached`
- Spike may indicate too-low default or bug in time accumulation.

4. `Blocked Route Attempts` (Table)
- Columns: `timestamp`, `user_id_hash`, `child_id_hash`, `route`, `control`.

## Row 4: Engagement & Regression Guardrails
1. `Craft Completion Events` (Line)
- Should be stable after XP/progress fixes.

2. `Game Completion Events` (Line)
- Validate no sudden drop after controls or gating updates.

3. `Radio Starts` (Line)
- Validate player changes didn’t reduce starts.

4. `Buddy Chat Sends` (Line)
- Monitor for regressions after buddy gating and quick-switch updates.

## Alert Rules (Production Defaults)
1. `P0 - Auth/Portal Outage`
- Condition:
  - `portal_auth_retry_clicked > 100 / 10m`
  - OR `Portal Interactive Success Rate < 95% for 10m`
- Notify: Pager + Slack `#incident-live`.

2. `P1 - Stories Reliability`
- Condition: stories failure rate `> 5% for 10m`.
- Notify: Slack `#eng-live-alerts`.

3. `P1 - Lessons Reliability`
- Condition: lessons failure rate `> 5% for 10m`.

4. `P1 - Parent Controls Persistence`
- Condition: save success `< 98% for 15m`.

5. `P2 - Retry UX Degraded`
- Condition: retry click rate `< 20%` of failures for 15m.

## Drill-Down Views
1. `Route Drilldown`
- Break down failures by `route`, `device_type`, `country`.

2. `User Segment Drilldown`
- By `subscription_tier`, `is_admin`, `child_age_track`.

3. `Release Correlation`
- Overlay deploy markers (`commit_sha`, deploy time).

## Data Contracts (Event Fields)
Standardize fields on all portal events:
- `event_name`
- `timestamp`
- `environment`
- `route`
- `user_id_hash`
- `child_id_hash` (if available)
- `subscription_tier`
- `device_type`
- `app_version` or `commit_sha`

## Daily On-Call Checks
1. Verify all Row 1 stats are green in first 5 minutes of shift.
2. Review top failing routes in Row 2.
3. Confirm parent controls saves and lockouts look reasonable.
4. Check alert noise: tune thresholds if false positives > 2/day.

## Weekly Reliability Review
1. Top 3 incident causes.
2. MTTA and MTTR trend.
3. Retry UX effectiveness.
4. Parent controls complaint count vs lockout telemetry.

