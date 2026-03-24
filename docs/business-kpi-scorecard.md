# Business KPI Scorecard (30-Day)

Use this scorecard to measure business impact from the live portal fixes.

## Goal
Quantify how reliability + parent controls improve:
- conversion
- retention
- support load
- incident cost

## Tracking Window
- Start date: `today`
- Review cadence: `weekly`
- Initial period: `30 days`

## North Star Metrics

1. `Paid Conversion Rate`
- Formula: `new paid subscriptions / unique trial or free parent accounts`
- Target (30-day): `+10% to +20%` lift from baseline

2. `Week-4 Subscriber Retention`
- Formula: `active paid users at day 28 / paid users at day 0 cohort`
- Target: `+5%` lift

3. `Child Session Completion Rate`
- Formula: `sessions with >=1 completed activity / total child sessions`
- Target: `>= 75%`

4. `Incident MTTR (minutes)`
- Formula: average minutes from alert fired to verified recovery
- Target: `< 30 min` for P1, `< 15 min` for P0

## Reliability Metrics (Leading Indicators)

1. `Portal Interactive Success Rate`
- Source: on-call dashboard panel
- Target: `>= 98%`

2. `Stories Failure Rate`
- Source events: `portal_stories_load_failed`
- Target: `< 2%`

3. `Lessons Failure Rate`
- Source events: `portal_lessons_load_failed`
- Target: `< 2%`

4. `Auth Retry Spike`
- Source event: `portal_auth_retry_clicked`
- Target: `< 25 / 10m` normal traffic

## Parent Trust & Safety Metrics

1. `Parent Controls Save Success`
- Formula: successful saves / attempted saves
- Target: `>= 99%`

2. `Blocked Channel Enforcement Integrity`
- Formula: `valid blocked attempts / total blocked attempts`
- Target: `100%` (no bypass)

3. `Screen-Time Limit Trigger Accuracy`
- Formula: lockouts at/after configured limit only
- Target: `>= 99%` correct

## Engagement Metrics

1. `Craft Completion Rate`
- Formula: craft completions / craft starts
- Target: `+10%` lift

2. `Games Repeat Play Rate`
- Formula: sessions with repeat game launch in 7 days / game sessions
- Target: `+8%` lift

3. `Buddy Chat Return Rate`
- Formula: users with >=2 buddy sessions in 7 days / buddy users
- Target: `+10%` lift

4. `Radio Start Rate`
- Formula: sessions with radio play start / portal sessions
- Target: no decline after radio changes

## Support & Cost Metrics

1. `Support Tickets per 1,000 Sessions`
- Target: `-20%` vs baseline

2. `Parent-Control Complaints`
- Target: downward trend week-over-week

3. `Incident Count (P0/P1)`
- Target: `0 P0`, decreasing P1 trend

4. `Engineering Firefighting Hours`
- Target: reduce by `25%` in 30 days

## Baseline Capture (Do Once, Today)
1. Pull last 14 days for every KPI above.
2. Record baseline value + date in the scorecard.
3. Freeze target ranges for 30 days.

## Weekly Ops Cadence (45 Minutes)
1. Reliability review (10m)
- Check failure rates, retries, auth spikes, MTTR.
2. Revenue/retention review (15m)
- Conversion, week cohort trend, drop-off points.
3. Parent trust review (10m)
- Controls save success, lock integrity, screen-time accuracy.
4. Actions/owners (10m)
- Top 3 changes for next week with owner and due date.

## Decision Rules
1. If Stories/Lessons failure rate > 5% for 2 consecutive hours:
- halt feature launches
- prioritize reliability patch

2. If parent-control save success < 98% in any day:
- treat as P1
- hotfix before new growth work

3. If conversion flat but reliability improved:
- optimize onboarding and upgrade prompts (funnel issue, not system health)

## Dashboard-to-KPI Mapping
- `docs/on-call-dashboard-spec.md` maps directly to reliability KPIs.
- Add business dashboard panels for:
  - conversion funnel
  - 7/28 day retention cohorts
  - support ticket taxonomy

## Scorecard Owner Model
- Product Owner: conversion + retention
- Eng Owner: reliability + MTTR
- CX Owner: support + trust signals
- Review owner rotates weekly (single accountable person)

## Output Format
Use `docs/kpi-scorecard-template.csv` each week and paste into your BI or spreadsheet.

## Automation Command
Run every Monday:

```bash
npm run kpi:pull
```

Optional:

```bash
npm run kpi:pull -- --week-start=2026-03-23 --output=docs/kpi-scorecard-weekly-2026-03-23.csv
```
