/**
 * getBaseUrl — always returns a full absolute URL safe for server-side fetch()
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL   (set this in Vercel env vars → https://www.likklelegends.com)
 *  2. VERCEL_URL             (auto-injected by Vercel on every deployment)
 *  3. localhost:3000         (local dev fallback)
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

