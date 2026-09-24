/**
 * Login redirects that point back at the page the parent is already on
 * make the App Router reload that page. /parent/music links to
 * /login?redirect=/parent/music, middleware sends authenticated visits
 * back to /parent/music, and Next.js follows that 307 as a hard navigation.
 */

export function sanitizeRedirectPath(value: string | null | undefined): string {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return '/portal';
    if (value === '/login' || value.startsWith('/login?') || value === '/signup' || value.startsWith('/signup?')) {
        return '/portal';
    }
    return value;
}

export function isRouterPrefetch(header: (name: string) => string | null): boolean {
    const prefetch = header('next-router-prefetch') || header('purpose') || header('sec-purpose');
    return prefetch === '1' || prefetch === 'prefetch';
}

/**
 * Where an authenticated visit to /login or /signup should go.
 * Returns null when the response must stay put so the music store cannot
 * bounce: prefetches, and any request that already started on the target.
 */
export function loginBounceTarget(input: {
    pathname: string;
    hasUser: boolean;
    redirectParam: string | null;
    prefetch: boolean;
    nextUrl: string | null;
}): string | null {
    if (!input.hasUser) return null;
    if (input.pathname !== '/login' && input.pathname !== '/signup') return null;
    if (input.prefetch) return null;
    const target = sanitizeRedirectPath(input.redirectParam);
    const from = input.nextUrl;
    if (from && (from === target || from.startsWith(`${target}?`) || from.startsWith(`${target}/`))) {
        return null;
    }
    return target;
}

export type MusicStorePhase = 'checking' | 'signed-out' | 'checkout';

/** PayPal is shown only after we know a parent session exists. Listening is not gated. */
export function musicStorePhase(input: { ready: boolean; signedIn: boolean }): MusicStorePhase {
    if (!input.ready) return 'checking';
    if (!input.signedIn) return 'signed-out';
    return 'checkout';
}
