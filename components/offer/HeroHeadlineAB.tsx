'use client';

import { useEffect, useState } from 'react';

/**
 * HeroHeadlineAB
 *
 * Client component that reads the `ll_ab_variant` cookie (set by /api/ab-test)
 * and renders the matching hero headline variant for the /offer page.
 * Fires a `view` event to /api/ab-track on first render so we can measure
 * which variant converts.
 *
 * Variant A: 'Caribbean learning that feels like home for kids 3–8' (control)
 * Variant B: 'Help your child read, learn, and love their Caribbean roots'
 */
type Variant = 'A' | 'B';

const HEADLINES: Record<Variant, { eyebrow: string; render: () => JSX.Element; sub: string }> = {
    A: {
        eyebrow: 'For Caribbean Families Abroad',
        render: () => (
            <>
                Caribbean learning that feels like{' '}
                <span className="bg-gradient-to-r from-[#fb7118] to-[#fbbf24] bg-clip-text text-transparent">home</span>
                {' '}for kids 3–8
            </>
        ),
        sub: 'Stories, phonics practice, and school-style activities designed to help children grow in reading, confidence, and connection to their Caribbean roots.',
    },
    B: {
        eyebrow: 'Caribbean Roots, Real Reading Skills',
        render: () => <>Help your child read, learn, and love their Caribbean roots</>,
        sub: 'Phonics-based learning woven into Caribbean stories and characters your child will love coming back to — built for diaspora families raising proud, confident readers ages 3–8.',
    },
};

export default function HeroHeadlineAB() {
    const [variant, setVariant] = useState<Variant>('A');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Read the cookie set by /api/ab-test. If absent, call /api/ab-test to
        // assign one (the endpoint sets the cookie via Set-Cookie on the response).
        const cookie = document.cookie
            .split('; ')
            .find((c) => c.startsWith('ll_ab_variant='));
        const v = cookie ? (cookie.split('=')[1] as Variant) : null;

        if (v === 'A' || v === 'B') {
            setVariant(v);
            setMounted(true);
            // Fire a view event.
            void trackEvent('view');
        } else {
            // No cookie yet — fetch assignment (sets cookie + returns variant).
            fetch('/api/ab-test', { credentials: 'same-origin' })
                .then((r) => r.json())
                .then((data) => {
                    const assigned = data.variant === 'B' ? 'B' : 'A';
                    setVariant(assigned);
                    setMounted(true);
                    void trackEvent('view');
                })
                .catch(() => {
                    setVariant('A');
                    setMounted(true);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const h = HEADLINES[variant];

    return (
        <div className="mx-auto max-w-3xl text-center">
            {/* Variant badge (only visible in dev / when mounted, hidden from end users via sr-only) */}
            <span className="sr-only">Variant {variant}</span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e9aa7] mb-3">
                {h.eyebrow}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-[#1c1c1c] mb-4">
                {h.render()}
            </h1>
            <p className="text-lg text-[#5f5f5d] leading-relaxed max-w-xl mx-auto mb-6">
                {h.sub}
            </p>
        </div>
    );
}

/** Fire an A/B tracking event to /api/ab-track. */
async function trackEvent(eventType: 'view' | 'click' | 'checkout' | 'purchase') {
    try {
        const cookie = document.cookie
            .split('; ')
            .find((c) => c.startsWith('ll_ab_variant='));
        const variant = cookie ? cookie.split('=')[1] : null;
        await fetch('/api/ab-track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_type: eventType, variant, test_id: 'offer_hero_2026' }),
        });
    } catch {
        // Silently fail — tracking must never break the page.
    }
}

/** Exported helper so the checkout button can fire a 'click' event. */
export function trackABClick() {
    void trackEvent('click');
}
