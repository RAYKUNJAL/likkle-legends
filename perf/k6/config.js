// ─────────────────────────────────────────────
// Likkle Legends — k6 Load Test Configuration
// ─────────────────────────────────────────────
// Usage:
//   k6 run --env TARGET=https://www.likklelegends.com perf/k6/load-test.js
//   k6 run --env TARGET=https://staging.likklelegends.com perf/k6/load-test.js
//
// Install k6:  https://k6.io/docs/get-started/installation/
//   Windows:   winget install k6 --source winget
//   Mac:       brew install k6
// ─────────────────────────────────────────────

export const BASE_URL = __ENV.TARGET || 'https://www.likklelegends.com';

// Supabase anon key and URL for auth flows (safe to use in tests — public key)
export const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://placeholder.supabase.co';
export const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'placeholder';

// Test account credentials — seed these in Supabase before running
// NEVER use a real customer account
export const TEST_EMAIL = __ENV.TEST_EMAIL || 'loadtest@likklelegends-test.com';
export const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'LoadTest123!';

// Thresholds: what "passing" looks like at launch
export const THRESHOLDS = {
    // 95% of all requests must complete in under 2 seconds
    http_req_duration: ['p(95)<2000'],
    // 99% under 5 seconds (nothing should ever hang)
    'http_req_duration{scenario:browse}': ['p(95)<1000'],
    'http_req_duration{scenario:portal}': ['p(95)<2000'],
    // Error rate must stay below 1%
    http_req_failed: ['rate<0.01'],
};
