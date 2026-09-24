'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

/**
 * A parent can be signed in through the browser GoTrue session or through the
 * httpOnly cookie that middleware can see and getSession() cannot.
 * Treating only getSession() as signed-in renders a login link, and middleware
 * redirects that link back to this page.
 */
export function useParentSession() {
    const [token, setToken] = useState<string | null>(null);
    const [signedIn, setSignedIn] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [accessToken, me] = await Promise.all([
                supabase.auth.getSession()
                    .then(({ data }) => data.session?.access_token || null)
                    .catch(() => null),
                fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
                    .then((response) => response.json())
                    .catch(() => null),
            ]);
            if (cancelled) return;
            const cookieSession = me?.authenticated === true && !!me?.profile;
            setToken(accessToken);
            setSignedIn(Boolean(accessToken) || cookieSession);
            setReady(true);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return { token, signedIn, ready };
}
