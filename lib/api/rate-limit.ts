import { NextResponse } from 'next/server';

type RateBucket = {
  count: number;
  expiresAt: number;
};

const buckets = new Map<string, RateBucket>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 12;

export function checkRateLimit(key: string, limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS): NextResponse | null {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.expiresAt <= now) {
    buckets.delete(key);
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return null;
  }

  if (existing.count >= limit) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  existing.count += 1;
  return null;
}
