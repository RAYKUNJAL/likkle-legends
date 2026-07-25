#!/usr/bin/env node
/**
 * Readonly live stress test for Likkle Legends.
 * NEVER mutates production data — GET only.
 *
 * Usage:
 *   STRESS_ALLOW_LIVE=readonly-traffic-ok node scripts/stress-likkle-readonly.mjs
 */
const BASE = process.env.STRESS_BASE_URL || 'https://www.likklelegends.com';
const TOTAL = Number(process.env.STRESS_TOTAL || 400);
const CONCURRENCY = Number(process.env.STRESS_CONCURRENCY || 25);
const ALLOW = process.env.STRESS_ALLOW_LIVE === 'readonly-traffic-ok';

if (!ALLOW) {
  console.error('Refusing: set STRESS_ALLOW_LIVE=readonly-traffic-ok');
  process.exit(2);
}

const PATHS = [
  '/',
  '/pricing',
  '/blog',
  '/login',
  '/signup',
  '/characters',
  '/checkout',
  '/shop/birthday-letter',
  '/faq',
  '/about',
  '/contact',
  '/api/health',
  '/api/health-check',
  '/api/subscriptions/get-plans',
  '/sitemap.xml',
  '/robots.txt',
  '/heritage',
  '/mail-club',
  '/shop',
];

function pick() {
  return PATHS[Math.floor(Math.random() * PATHS.length)];
}

async function one(i) {
  const path = pick();
  const url = BASE.replace(/\/$/, '') + path;
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: { 'User-Agent': 'likkle-stress-readonly/1.0' },
    });
    const ms = performance.now() - t0;
    // Consume small body to avoid socket stall
    await res.arrayBuffer().catch(() => null);
    return { i, path, status: res.status, ms, ok: res.status < 500 };
  } catch (e) {
    return { i, path, status: 0, ms: performance.now() - t0, ok: false, err: String(e.message || e) };
  }
}

async function pool(n, total) {
  const results = [];
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= total) return;
      results.push(await one(i));
      if ((i + 1) % 50 === 0) process.stdout.write(`  … ${i + 1}/${total}\n`);
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

(async () => {
  console.log(`Likkle readonly stress  base=${BASE} total=${TOTAL} concurrency=${CONCURRENCY}`);
  const t0 = performance.now();
  const results = await pool(CONCURRENCY, TOTAL);
  const elapsed = performance.now() - t0;
  const statuses = {};
  const byPath = {};
  const times = [];
  let fails = 0;
  for (const r of results) {
    statuses[r.status] = (statuses[r.status] || 0) + 1;
    byPath[r.path] = byPath[r.path] || { n: 0, fail: 0, times: [] };
    byPath[r.path].n++;
    byPath[r.path].times.push(r.ms);
    if (!r.ok) {
      fails++;
      byPath[r.path].fail++;
    }
    times.push(r.ms);
  }
  times.sort((a, b) => a - b);
  const pct = (p) => times[Math.min(times.length - 1, Math.floor((p / 100) * times.length))] || 0;
  const avg = times.reduce((a, b) => a + b, 0) / (times.length || 1);

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({
    total: TOTAL,
    fails,
    fail_rate: +(fails / TOTAL * 100).toFixed(2) + '%',
    elapsed_ms: Math.round(elapsed),
    rps: +(TOTAL / (elapsed / 1000)).toFixed(1),
    p50_ms: Math.round(pct(50)),
    p95_ms: Math.round(pct(95)),
    p99_ms: Math.round(pct(99)),
    avg_ms: Math.round(avg),
    statuses,
  }, null, 2));

  console.log('\n=== BY PATH ===');
  for (const [path, s] of Object.entries(byPath)) {
    s.times.sort((a, b) => a - b);
    const p95 = s.times[Math.min(s.times.length - 1, Math.floor(0.95 * s.times.length))] || 0;
    console.log(`${path.padEnd(32)} n=${String(s.n).padStart(3)} fail=${s.fail} p95=${Math.round(p95)}ms`);
  }

  const hardFail = fails > 0 || pct(95) > 5000;
  console.log(hardFail ? '\nRESULT: FAIL' : '\nRESULT: PASS');
  process.exit(hardFail ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
