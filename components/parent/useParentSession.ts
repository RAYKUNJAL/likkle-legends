'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import {
    PARENT_SESSION_CHECK_MS,
    parentSessionView,
    type ParentSessionSnapshot,
} from '@/lib/login-bounce';

/**
 * A parent can be signed in through the browser GoTrue session or through the
 * httpOnly cookie that middleware can see and getSession() cannot.
 * Treating only getSession() as signed-in renders a login link, and middleware
 * redirects that link back to this page.
 *
 * getSession() is not allowed to block the cookie probe. If both stall, the
 * store fails open to the signed-out sign-in link. Checkout stays closed
 * until a probe actually confirms a parent session.
 */
function emptySnapshot(): ParentSessionSnapshot {
    return {
        meSettled: false,
        sessionSettled: false,
        timedOut: false,
        accessToken: null,
        cookieAuthenticated: false,
    };
}

export function useParentSession() {
    const [view, setView] = useState(() => parentSessionView(emptySnapshot()));

    useEffect(() => {
        let cancelled = false;
        const snapshot = emptySnapshot();
        const publish = () => {
            if (!cancelled) setView(parentSessionView(snapshot));
        };

        const timer = window.setTimeout(() => {
            snapshot.timedOut = true;
            publish();
        }, PARENT_SESSION_CHECK_MS);

        const controller = new AbortController();

        supabase.auth.getSession()
            .then(({ data }) => data.session?.access_token || null)
            .catch(() => null)
            .then((accessToken) => {
                snapshot.sessionSettled = true;
                snapshot.accessToken = accessToken;
                publish();
            });

        fetch('/api/auth/me', {
            credentials: 'same-origin',
            cache: 'no-store',
            signal: controller.signal,
        })
            .then((response) => response.json())
            .catch(() => null)
            .then((me) => {
                snapshot.meSettled = true;
                snapshot.cookieAuthenticated = me?.authenticated === true && !!me?.profile;
                publish();
            });

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            controller.abort();
        };
    }, []);

    return { token: view.token, signedIn: view.signedIn, ready: view.ready };
}
