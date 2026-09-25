/**
 * QStash wake-up for Journey Stories pictures.
 * Publish only when all three env vars are set. Never embed secret values.
 * One callback draws one page. Signature failure does not generate art.
 */
import crypto from 'crypto';

export const QSTASH_ENV_NAMES = [
  'QSTASH_TOKEN',
  'QSTASH_CURRENT_SIGNING_KEY',
  'QSTASH_NEXT_SIGNING_KEY',
] as const;

export type QStashEnvName = (typeof QSTASH_ENV_NAMES)[number];

export function missingQStashEnv(env: NodeJS.ProcessEnv = process.env): QStashEnvName[] {
  return QSTASH_ENV_NAMES.filter((name) => !(env[name] || '').trim());
}

export function hasQStashConfig(env: NodeJS.ProcessEnv = process.env): boolean {
  return missingQStashEnv(env).length === 0;
}

/** Public URL QStash calls. Uses the site URL already set for the app. */
export function journeyWorkerCallbackUrl(env: NodeJS.ProcessEnv = process.env): string {
  const base = (env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.likklelegends.com')
    .trim()
    .replace(/\/$/, '');
  return `${base}/api/island-helpers/journey-stories/jobs/worker`;
}

function base64urlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function signQStashBody(input: {
  body: string;
  url: string;
  key: string;
  nowSec?: number;
}): string {
  const now = input.nowSec ?? Math.floor(Date.now() / 1000);
  const header = base64urlJson({ alg: 'HS256', typ: 'JWT' });
  const payload = base64urlJson({
    iss: 'Upstash',
    sub: input.url,
    body: crypto.createHash('sha256').update(input.body).digest('base64url'),
    iat: now,
    nbf: now,
    exp: now + 300,
  });
  const data = `${header}.${payload}`;
  const sig = crypto.createHmac('sha256', input.key).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function readJwt(token: string, key: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const data = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac('sha256', key).update(data).digest('base64url');
  const actual = Buffer.from(parts[2]);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !crypto.timingSafeEqual(actual, wanted)) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function verifyQStashRequest(input: {
  signature: string | null;
  body: string;
  url: string;
  env?: NodeJS.ProcessEnv;
  nowSec?: number;
}): { ok: true } | { ok: false; reason: 'qstash_env_missing' | 'unsigned' | 'bad_signature' | 'body_mismatch' } {
  const env = input.env || process.env;
  if (!hasQStashConfig(env)) return { ok: false, reason: 'qstash_env_missing' };
  if (!input.signature) return { ok: false, reason: 'unsigned' };

  const bodyHash = crypto.createHash('sha256').update(input.body).digest('base64url');
  const now = input.nowSec ?? Math.floor(Date.now() / 1000);
  const keys = [env.QSTASH_CURRENT_SIGNING_KEY, env.QSTASH_NEXT_SIGNING_KEY].map((value) =>
    (value || '').trim(),
  );

  let sawBodyMismatch = false;
  for (const key of keys) {
    const payload = readJwt(input.signature, key);
    if (!payload) continue;
    if (payload.iss !== 'Upstash') continue;
    if (payload.sub !== input.url) continue;
    if (typeof payload.exp === 'number' && payload.exp < now - 30) continue;
    if (typeof payload.nbf === 'number' && payload.nbf > now + 30) continue;
    if (payload.body !== bodyHash) {
      sawBodyMismatch = true;
      continue;
    }
    return { ok: true };
  }

  return { ok: false, reason: sawBodyMismatch ? 'body_mismatch' : 'bad_signature' };
}

export async function publishJourneyJob(
  input: {
    storyId: string;
    jobId: string;
    pageIndex: number | null;
    /** generate = write the five pages first. page = one picture. */
    step?: 'generate' | 'page';
  },
  deps?: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch },
): Promise<{ published: boolean; reason: 'published' | 'qstash_env_missing' | 'qstash_publish_failed' }> {
  const env = deps?.env || process.env;
  if (!hasQStashConfig(env)) return { published: false, reason: 'qstash_env_missing' };

  const destination = journeyWorkerCallbackUrl(env);
  const fetchImpl = deps?.fetchImpl || fetch;
  try {
    const response = await fetchImpl(`https://qstash.upstash.io/v2/publish/${destination}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${(env.QSTASH_TOKEN || '').trim()}`,
        'Content-Type': 'application/json',
        'Upstash-Retries': '3',
        'Upstash-Deduplication-Id': input.jobId,
      },
      body: JSON.stringify({
        storyId: input.storyId,
        jobId: input.jobId,
        pageIndex: input.pageIndex,
        step: input.step || (typeof input.pageIndex === 'number' ? 'page' : 'generate'),
      }),
    });
    if (!response.ok) return { published: false, reason: 'qstash_publish_failed' };
    return { published: true, reason: 'published' };
  } catch {
    return { published: false, reason: 'qstash_publish_failed' };
  }
}
