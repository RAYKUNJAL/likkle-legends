/**
 * Proves /parent/music does not bounce through login for:
 * signed-out, signed-in with no purchase, and signed-in with a download.
 * Entitlement is not granted here. PayPal capture still has to verify.
 */
import fs from 'fs';
import path from 'path';
import { isRouterPrefetch, loginBounceTarget, musicStorePhase } from '../lib/login-bounce';
import { resolvePayerAccount } from '../lib/payer-account';

function assert(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
}

const personas = ['signed-out', 'signed-in-no-purchase', 'signed-in-entitled'] as const;

for (const persona of personas) {
    const signedIn = persona !== 'signed-out';
    assert(
        loginBounceTarget({
            pathname: '/parent/music',
            hasUser: signedIn,
            redirectParam: null,
            prefetch: false,
            nextUrl: null,
        }) === null,
        `${persona} document load of /parent/music is not redirected`
    );
    assert(
        loginBounceTarget({
            pathname: '/login',
            hasUser: signedIn,
            redirectParam: '/parent/music',
            prefetch: true,
            nextUrl: '/parent/music',
        }) === null,
        `${persona} prefetch of the sign-in link does not 307 back to the store`
    );
    assert(
        loginBounceTarget({
            pathname: '/login',
            hasUser: signedIn,
            redirectParam: '/parent/music',
            prefetch: false,
            nextUrl: '/parent/music',
        }) === null,
        `${persona} app-router fetch that started on the store does not reload it`
    );
    const phase = musicStorePhase({ ready: true, signedIn });
    if (persona === 'signed-out') {
        assert(phase === 'signed-out', 'signed-out store shows sign-in, not checkout');
    } else {
        assert(phase === 'checkout', `${persona} store shows checkout`);
        assert(phase !== 'signed-out', `${persona} does not render the login link`);
    }
}

assert(
    loginBounceTarget({
        pathname: '/login',
        hasUser: false,
        redirectParam: '/parent/music',
        prefetch: false,
        nextUrl: null,
    }) === null,
    'signed-out parent can open the login page'
);

assert(
    loginBounceTarget({
        pathname: '/login',
        hasUser: true,
        redirectParam: '/parent/music',
        prefetch: false,
        nextUrl: null,
    }) === '/parent/music',
    'a signed-in visit that started elsewhere still lands on the store once'
);

assert(isRouterPrefetch((name) => (name === 'next-router-prefetch' ? '1' : null)), 'next prefetch header is recognized');
assert(!isRouterPrefetch(() => null), 'a document navigation is not a prefetch');

assert(musicStorePhase({ ready: false, signedIn: true }) === 'checking', 'session check does not flash the login link');
assert(musicStorePhase({ ready: true, signedIn: true }) === 'checkout', 'cookie session shows the PayPal section');

const parentOnProfileOnly = resolvePayerAccount({
    usersRow: null,
    usersError: false,
    profileRow: { role: 'parent', email: 'parent@example.com' },
    profileError: false,
});
assert(parentOnProfileOnly.ok && parentOnProfileOnly.role === 'parent', 'profile parent with no users row can check out');

const legacyUserRole = resolvePayerAccount({
    usersRow: { role: 'user', email: 'parent@example.com' },
    usersError: false,
    profileRow: null,
    profileError: true,
});
assert(legacyUserRole.ok, 'users.role default user is a parent account');

assert(!resolvePayerAccount({
    usersRow: { role: 'teacher', email: 'teacher@example.com' },
    usersError: false,
    profileRow: { role: 'parent', email: 'teacher@example.com' },
    profileError: false,
}).ok, 'an explicit teacher role stays blocked');

assert(!resolvePayerAccount({
    usersRow: null,
    usersError: true,
    profileRow: null,
    profileError: true,
}).ok, 'a missing account fails closed');

const store = fs.readFileSync(path.join(process.cwd(), 'app/parent/music/ParentMusicStore.tsx'), 'utf8');
const page = fs.readFileSync(path.join(process.cwd(), 'app/parent/music/page.tsx'), 'utf8');
assert(!store.includes('href="/login?redirect=/parent/music"') || store.includes('<a href="/login?redirect=/parent/music"'), 'sign-in is a plain link, not an app-router prefetch');
assert(!store.includes('<Link href="/login?redirect=/parent/music"'), 'music store does not client-navigate to login');
assert(store.includes('preload="metadata"'), 'player preloads metadata');
assert(store.includes('useParentSession'), 'store reads the cookie session');
assert(store.includes('data-testid="paypal-bundle"'), 'signed-in checkout renders a PayPal slot');
assert(!store.includes('entitled: true') && !store.includes('entitled:true'), 'the page does not grant entitlement');
assert(page.includes('rel="preload"') && page.includes('as="audio"'), 'stream files are preloaded');
assert(page.includes('<ParentMusicStore'), 'store still mounts');

const middleware = fs.readFileSync(path.join(process.cwd(), 'lib/supabase/middleware.ts'), 'utf8');
const matcher = fs.readFileSync(path.join(process.cwd(), 'middleware.ts'), 'utf8');
assert(middleware.includes('loginBounceTarget'), 'middleware uses the bounce guard');
assert(matcher.includes('assets'), 'song files skip the auth middleware');

console.log('parent music loop checks passed');
console.log(JSON.stringify({
    personas: personas.map((persona) => ({
        persona,
        storeRedirect: null,
        loginPrefetchRedirect: null,
        phase: musicStorePhase({ ready: true, signedIn: persona !== 'signed-out' }),
    })),
}, null, 2));
