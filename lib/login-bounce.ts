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

/**
 * Browser getSession() can sit on the GoTrue lock forever. The cookie probe
 * (/api/auth/me) must be allowed to finish on its own, and the UI must leave
 * "checking" even when both probes stall.
 */
export const PARENT_SESSION_CHECK_MS = 4000;

/** Middleware only needs a user on routes that bounce login or gate access. */
export const AUTH_LOOKUP_MS = 8000;

export function middlewareNeedsAuthUser(pathname: string): boolean {
    if (pathname === '/login' || pathname === '/signup') return true;
    if (pathname.startsWith('/portal')) return true;
    if (pathname.startsWith('/admin') && pathname !== '/admin' && pathname !== '/admin/central') return true;
    return false;
}

export type ParentSessionSnapshot = {
    meSettled: boolean;
    sessionSettled: boolean;
    timedOut: boolean;
    accessToken: string | null;
    cookieAuthenticated: boolean;
};

/** Signed-in wins as soon as either probe says so. Otherwise wait for both, then fail open. */
export function parentSessionView(snapshot: ParentSessionSnapshot): {
    ready: boolean;
    signedIn: boolean;
    token: string | null;
} {
    const signedIn = Boolean(snapshot.accessToken) || snapshot.cookieAuthenticated;
    const probesSettled = snapshot.meSettled && snapshot.sessionSettled;
    const ready = signedIn || snapshot.timedOut || probesSettled;
    return {
        ready,
        signedIn: ready && signedIn,
        token: snapshot.accessToken,
    };
}
