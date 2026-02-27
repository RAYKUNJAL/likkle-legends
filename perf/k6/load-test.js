/**
 * Likkle Legends — k6 Load Test
 *
 * Simulates a realistic launch-day peak: parents browsing, logging in, and using the portal.
 *
 * Run (baseline):
 *   k6 run perf/k6/load-test.js
 *
 * Run against staging:
 *   k6 run --env TARGET=https://staging.likklelegends.com \
 *          --env SUPABASE_URL=https://xyz.supabase.co \
 *          --env SUPABASE_ANON_KEY=eyJ... \
 *          --env TEST_EMAIL=loadtest@example.com \
 *          --env TEST_PASSWORD=Test123! \
 *          perf/k6/load-test.js
 *
 * Run stress test (ramp to failure):
 *   k6 run --env MODE=stress perf/k6/load-test.js
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD, THRESHOLDS } from './config.js';

// ── Custom metrics ──────────────────────────────────────────────────
const signupDuration = new Trend('signup_duration');
const portalLoadDuration = new Trend('portal_load_duration');
const authErrors = new Counter('auth_errors');

// ── Scenario configs ────────────────────────────────────────────────
const MODE = __ENV.MODE || 'baseline';

// Scenarios: realistic mix of parent traffic at launch
// ~70% browsing, ~20% using portal, ~10% checking out
const SCENARIOS = {
    // Anonymous visitors browsing the landing page
    browse: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: MODE === 'stress'
            ? [
                { duration: '2m', target: 50 },
                { duration: '5m', target: 200 },
                { duration: '3m', target: 400 },
                { duration: '2m', target: 0 },
            ]
            : [
                { duration: '1m', target: 30 },   // ramp up
                { duration: '5m', target: 70 },   // hold at peak
                { duration: '1m', target: 0 },    // ramp down
            ],
        exec: 'browseScenario',
        tags: { scenario: 'browse' },
    },

    // Authenticated parents loading the portal
    portal: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: MODE === 'stress'
            ? [
                { duration: '2m', target: 20 },
                { duration: '5m', target: 80 },
                { duration: '3m', target: 150 },
                { duration: '2m', target: 0 },
            ]
            : [
                { duration: '1m', target: 10 },
                { duration: '5m', target: 20 },
                { duration: '1m', target: 0 },
            ],
        exec: 'portalScenario',
        tags: { scenario: 'portal' },
    },

    // New parents going through checkout (light — real PayPal, not load-tested)
    checkout: {
        executor: 'constant-vus',
        vus: MODE === 'stress' ? 20 : 5,
        duration: MODE === 'stress' ? '10m' : '5m',
        exec: 'checkoutScenario',
        tags: { scenario: 'checkout' },
    },
};

export const options = {
    scenarios: SCENARIOS,
    thresholds: THRESHOLDS,
    // Don't exit on error — keep collecting data
    noConnectionReuse: false,
    userAgent: 'k6-loadtest/likkle-legends',
};

// ── Helpers ─────────────────────────────────────────────────────────

/** Sign in via Supabase and return an access token */
function supabaseSignIn() {
    const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const payload = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        tags: { name: 'auth_signin' },
    };

    const start = Date.now();
    const res = http.post(url, payload, params);
    signupDuration.add(Date.now() - start);

    const ok = check(res, {
        'sign in: status 200': (r) => r.status === 200,
        'sign in: has access_token': (r) => {
            try { return !!JSON.parse(r.body).access_token; } catch { return false; }
        },
    });

    if (!ok) {
        authErrors.add(1);
        return null;
    }

    return JSON.parse(res.body).access_token;
}

/** Standard headers for API requests */
function apiHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

// ── Scenario: Anonymous browsing ─────────────────────────────────────
export function browseScenario() {
    group('landing page', () => {
        const res = http.get(BASE_URL, { tags: { name: 'landing' } });
        check(res, {
            'landing: status 200': (r) => r.status === 200,
            'landing: has html': (r) => r.body && r.body.includes('Likkle Legends'),
        });
    });

    sleep(2 + Math.random() * 3); // user reads page (2–5s)

    group('signup page', () => {
        const res = http.get(`${BASE_URL}/signup`, { tags: { name: 'signup_page' } });
        check(res, { 'signup page: status 200 or 308': (r) => r.status === 200 || r.status === 308 });
    });

    sleep(1 + Math.random() * 2);
}

// ── Scenario: Authenticated portal ───────────────────────────────────
export function portalScenario() {
    // Sign in once per VU iteration
    const token = supabaseSignIn();
    if (!token) {
        sleep(2);
        return;
    }

    const headers = apiHeaders(token);

    group('portal load', () => {
        const start = Date.now();

        // These are the API calls the portal makes on load
        const responses = http.batch([
            ['GET', `${BASE_URL}/api/library/stories`, null, { headers, tags: { name: 'stories' } }],
            ['GET', `${BASE_URL}/api/messages?user_id=test`, null, { headers, tags: { name: 'messages' } }],
        ]);

        portalLoadDuration.add(Date.now() - start);

        check(responses[0], { 'stories API: status 200 or 401': (r) => [200, 401, 403].includes(r.status) });
        check(responses[1], { 'messages API: status 200 or 401': (r) => [200, 401, 403].includes(r.status) });
    });

    sleep(3 + Math.random() * 5); // parent uses app (3–8s per action)

    group('music library browse', () => {
        const res = http.get(`${BASE_URL}/music-store`, { tags: { name: 'music_store' } });
        check(res, { 'music store: loads': (r) => [200, 308].includes(r.status) });
    });

    sleep(2 + Math.random() * 3);
}

// ── Scenario: Checkout flow ───────────────────────────────────────────
// NOTE: This only tests the page load, NOT PayPal API calls.
// PayPal has its own rate limits — do not load-test PayPal itself.
export function checkoutScenario() {
    group('checkout page', () => {
        const res = http.get(`${BASE_URL}/checkout`, { tags: { name: 'checkout_page' } });
        check(res, {
            'checkout page: loads': (r) => [200, 308].includes(r.status),
        });
    });

    sleep(5 + Math.random() * 10); // user reads pricing (5–15s)
}
