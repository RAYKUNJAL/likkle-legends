# Live Traffic Incident Checklist

Use this checklist for production incidents affecting the kids portal and parent controls.

## Scope
- Parent controls persistence/enforcement
- Stories/Lessons loading reliability
- Screen-time daily cap
- Games progress tracking
- Buddy/Radio access gating
- Portal sync ("Connecting to Island")

## Priority Matrix
- `P0`: Children cannot access core portal, widespread auth loops, data corruption, or wrong parental lock behavior at scale.
- `P1`: Major channel degradation (Stories/Lessons/Games/Radio/Buddy) with working fallback.
- `P2`: Partial UX regressions with available workaround.

## Immediate Triage (First 5 Minutes)
1. Confirm incident scope:
- Which routes: `/portal`, `/portal/stories`, `/portal/lessons`, `/portal/games`, `/portal/buddy`, `/portal/settings`.
- Which user segment: free/paid, parent/child, mobile/desktop.
2. Check latest deploy SHA and timestamp.
3. Validate telemetry spike for these events:
- `portal_stories_load_failed`
- `portal_lessons_load_failed`
- `portal_stories_retry_clicked`
- `portal_lessons_retry_clicked`
- `portal_auth_retry_clicked`
4. Set incident severity (`P0/P1/P2`) and assign incident owner.

## Alert Thresholds (Default)
- `P0` if any one condition is true:
  - `portal_auth_retry_clicked` > 100 events in 10 minutes.
  - >20% of portal sessions fail to reach interactive state in 5 minutes.
  - Parent controls incorrectly allow blocked channels or block allowed channels for >5% of checks.
- `P1` if:
  - `portal_stories_load_failed` or `portal_lessons_load_failed` > 5% of page loads for 10 minutes.
  - Retry click rate > 2 retries per affected session median.
- `P2` if:
  - Single-channel UX regression with no data loss and stable workaround.

## Core Diagnostic Checks
1. Auth/session health
- Verify Supabase auth latency/errors.
- Verify profile + auth metadata payload includes `parental_controls`.
2. Parent controls correctness
- Validate effective controls from user metadata:
  - `allow_stories`, `allow_lessons`, `allow_games`, `allow_radio`, `allow_buddy`
  - `daily_screen_time_minutes`
- Reproduce with one test account each:
  - all allowed
  - one channel blocked
  - strict daily limit
3. Data/API health
- Check storybooks/video/game queries:
  - `getStorybooks()`
  - `getVideos()`
  - `getGames()`
- Confirm timeout/retry UI appears and does not spin indefinitely.
4. Client storage/limits
- Verify daily screen-time key increments and resets by date:
  - `ll_screen_time_<childId>_<YYYY-MM-DD>`

## User-Safe Mitigations
1. If channel fetch is degraded:
- Keep fallback content visible (already implemented for Lessons/Games).
- Invalidate cache/CDN for stale assets.
2. If parental controls are wrong:
- Force safe default in hotfix:
  - Block affected channel(s) until metadata read is verified.
3. If auth sync is unstable:
- Keep grace/retry UI and communicate status banner.

## Rollback Plan
1. If `P0` lasts > 15 minutes without clear fix:
- Revert latest commit(s) touching:
  - `app/portal/page.tsx`
  - `app/portal/settings/page.tsx`
  - `components/UserContext.tsx`
  - `app/actions/user-actions.ts`
  - gated route pages under `app/portal/*`
2. Deploy rollback SHA to production.
3. Verify:
- portal home loads
- parent settings saves
- blocked channels behave as expected
4. Keep incident open until telemetry returns below thresholds for 30 minutes.

## Communication Template
- Initial (within 10 minutes):
  - "We are investigating degraded portal behavior affecting [scope]. Parent controls remain [safe/impacted]. Next update in 15 minutes."
- Update:
  - "Cause identified in [component]. Mitigation [applied/pending]. ETA [time]."
- Resolved:
  - "Issue resolved at [time]. Monitoring for 30 minutes. Impact window: [start-end]."

## Post-Incident Checklist
1. Create postmortem with timeline and root cause.
2. Add missing alert if detection lag > 5 minutes.
3. Add regression test for failed path:
- parent control enforcement
- stories/lessons timeout + retry
- auth retry fallback
4. Track action items with owners and due dates.

## Fast Verification Script (Manual)
1. Login as parent, open `/portal/settings`, set:
- `allow_stories=false`
- `daily_screen_time_minutes=15`
2. Login child, verify:
- Stories route blocked with lock message.
- Other allowed channels open.
3. Simulate network slow/offline:
- Stories/Lessons show retry state, not infinite skeleton.
4. Verify telemetry events emitted for failures/retries.

