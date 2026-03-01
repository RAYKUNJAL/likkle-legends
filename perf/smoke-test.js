/**
 * Likkle Legends — Smoke Test
 * Checks all key pages return 200 and aren't broken.
 *
 * Run: node perf/smoke-test.js
 * Run against staging: node perf/smoke-test.js https://staging.likklelegends.com
 */

const BASE = process.argv[2] || 'https://www.likklelegends.com';

const PAGES = [
    // Public / landing
    ['GET', '/'],
    ['GET', '/signup'],
    ['GET', '/login'],
    ['GET', '/checkout'],
    ['GET', '/about'],
    ['GET', '/blog'],

    // Portal (will redirect to login — 308/302/307 is fine)
    ['GET', '/portal'],
    ['GET', '/portal/music'],
    ['GET', '/portal/store'],
    ['GET', '/parent'],

    // API — public endpoints (should return JSON, not crash)
    ['GET', '/api/library/stories'],
];

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m~\x1b[0m';

async function check(method, path) {
    const url = BASE + path;
    const start = Date.now();
    try {
        const res = await fetch(url, {
            method,
            redirect: 'manual', // don't follow redirects — we want to see the raw status
            headers: { 'User-Agent': 'LikkleLegends-SmokeTest/1.0' },
            signal: AbortSignal.timeout(10000),
        });
        const ms = Date.now() - start;
        const ok = res.status < 400;
        const redirect = res.status >= 300 && res.status < 400;
        const icon = ok ? (redirect ? WARN : PASS) : FAIL;
        const label = redirect ? `${res.status} → ${res.headers.get('location') || '?'}` : res.status;
        console.log(`  ${icon} ${method} ${path.padEnd(30)} ${String(label).padEnd(45)} ${ms}ms`);
        return ok;
    } catch (err) {
        const ms = Date.now() - start;
        console.log(`  ${FAIL} ${method} ${path.padEnd(30)} ${'ERROR: ' + err.message.slice(0, 40).padEnd(45)} ${ms}ms`);
        return false;
    }
}

async function main() {
    console.log(`\n🏝️  Likkle Legends Smoke Test`);
    console.log(`   Target: ${BASE}\n`);

    let passed = 0, failed = 0;
    for (const [method, path] of PAGES) {
        const ok = await check(method, path);
        ok ? passed++ : failed++;
    }

    console.log(`\n${'─'.repeat(70)}`);
    if (failed === 0) {
        console.log(`\x1b[32m  ✓ All ${passed} checks passed\x1b[0m`);
    } else {
        console.log(`\x1b[31m  ✗ ${failed} failed\x1b[0m, \x1b[32m${passed} passed\x1b[0m`);
        console.log(`\n  ~ (yellow) = redirect, expected for auth-protected pages`);
    }
    console.log();
}

main().catch(console.error);
