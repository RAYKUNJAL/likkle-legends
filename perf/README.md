# Likkle Legends — Load Tests

## Quick Start

### 1. Install k6

```bash
# Windows
winget install k6 --source winget

# Mac
brew install k6
```

### 2. Create a test account in Supabase

In your Supabase dashboard → Authentication → Users → "Invite user":
- Email: `loadtest@likklelegends-test.com`
- Password: `LoadTest123!`

**Never use a real customer account for load tests.**

### 3. Run tests

**Baseline (safe — simulates ~70 concurrent browsers, 20 portal users, 5 checkout):**
```bash
k6 run \
  --env TARGET=https://www.likklelegends.com \
  --env SUPABASE_URL=https://your-project.supabase.co \
  --env SUPABASE_ANON_KEY=eyJ... \
  --env TEST_EMAIL=loadtest@likklelegends-test.com \
  --env TEST_PASSWORD=LoadTest123! \
  perf/k6/load-test.js
```

**Against staging (recommended first):**
```bash
k6 run --env TARGET=https://staging.likklelegends.com ... perf/k6/load-test.js
```

**Stress test (find your breaking point):**
```bash
k6 run --env MODE=stress --env TARGET=https://staging.likklelegends.com ... perf/k6/load-test.js
```

---

## What's being tested

| Scenario | VUs (baseline) | What it simulates |
|----------|---------------|-------------------|
| `browse` | 70 peak | Anonymous parents reading landing page and signup |
| `portal` | 20 peak | Authenticated parents using the portal and music library |
| `checkout`| 5 constant | Parents viewing the checkout/pricing page |

## Pass/Fail Thresholds

| Metric | Threshold |
|--------|-----------|
| 95th percentile latency (all) | < 2 seconds |
| 95th percentile latency (browse) | < 1 second |
| Error rate | < 1% |

## What to watch while tests run

- **Vercel dashboard**: Function invocations, errors, duration
- **Supabase dashboard**: Database connections, slow queries
- **k6 terminal output**: `http_req_duration`, `http_req_failed`, custom metrics

## Notes

- PayPal API calls are **not** load-tested — PayPal has its own sandbox rate limits and you risk getting your account flagged
- Auth via Supabase's `POST /auth/v1/token` endpoint — uses your project's anon key (safe and public)
- The `messages` API will return 403 for the test account since `user_id=test` won't match — this is expected and counted as a valid response (not an error)
