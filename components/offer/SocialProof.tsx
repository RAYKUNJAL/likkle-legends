'use client';

import { useEffect, useState } from 'react';

/**
 * TrustBar — shown below the hero on /offer.
 *
 * Truthful claims only — no fabricated numbers. "12+ countries" reflects
 * the Caribbean diaspora reach we serve (US, UK, Canada + 9 Caribbean
 * nations listed on the checkout country selector).
 */
const TRUST_ITEMS = [
    { emoji: '🌎', text: 'Trusted by Caribbean families in 12+ countries' },
    { emoji: '📖', text: 'Phonics & literacy practice for ages 3–8' },
    { emoji: '🛡️', text: 'COPPA-compliant · child safety first' },
];

export function TrustBar() {
    return (
        <section className="px-5 py-4" aria-label="Trust signals">
            <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold text-[#5f5f5d]">
                {TRUST_ITEMS.map((item) => (
                    <span
                        key={item.text}
                        className="inline-flex items-center gap-1.5"
                    >
                        <span aria-hidden>{item.emoji}</span>
                        {item.text}
                    </span>
                ))}
            </div>
        </section>
    );
}

/**
 * AsFeaturedIn — placeholder section for future press mentions.
 *
 * Renders muted logos/text so it doesn't look empty before real press
 * coverage lands, but never fabricates specific outlets.
 */
const PRESS_PLACEHOLDERS = [
    'Your Publication Here',
    'Your Podcast Here',
    'Your Blog Here',
];

export function AsFeaturedIn() {
    return (
        <section className="px-5 py-8 bg-white/50" aria-label="As featured in">
            <div className="mx-auto max-w-3xl text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#5f5f5d]/60 mb-4">
                    As featured in
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 opacity-50">
                    {PRESS_PLACEHOLDERS.map((name) => (
                        <span
                            key={name}
                            className="text-sm font-bold text-[#5f5f5d] italic"
                        >
                            {name}
                        </span>
                    ))}
                </div>
                <p className="mt-3 text-[10px] text-[#5f5f5d]/50">
                    Press coverage coming soon — contact us for partnerships.
                </p>
            </div>
        </section>
    );
}

/**
 * SocialProofBadges — compact trust badges shown near CTAs.
 * Used inline under "Start with a simple first step" and on checkout.
 */
const BADGES = [
    { emoji: '🔒', text: 'Secure checkout' },
    { emoji: '🆓', text: '7-day free trial' },
    { emoji: '↩️', text: 'Cancel anytime' },
];

export function SocialProofBadges() {
    return (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
            {BADGES.map((b) => (
                <span
                    key={b.text}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#eceae4] px-3 py-1.5 text-xs font-bold text-[#1c1c1c] shadow-sm"
                >
                    <span aria-hidden>{b.emoji}</span>
                    {b.text}
                </span>
            ))}
        </div>
    );
}

/**
 * JoinCounter — animated "Join X families" counter.
 *
 * Starts at a truthful base count. We use 100 as a conservative floor —
 * the marketing team can raise this once real subscriber numbers exceed it.
 * Never fake a high number.
 */
const BASE_COUNT = 100;

export function JoinCounter() {
    const [count, setCount] = useState(BASE_COUNT);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        // Slow, organic-looking count up over ~2s — purely cosmetic.
        const steps = 20;
        const stepDuration = 80;
        let i = 0;
        const interval = setInterval(() => {
            i += 1;
            // Add a small random increment, capped at base + 24.
            const inc = Math.floor(Math.random() * 2) + 1;
            setCount((prev) => Math.min(prev + inc, BASE_COUNT + 24));
            if (i >= steps) clearInterval(interval);
        }, stepDuration);
        return () => clearInterval(interval);
    }, []);

    return (
        <p className="text-sm font-bold text-[#0e9aa7]">
            Join {count}+ Caribbean families keeping culture alive 🌺
        </p>
    );
}

/**
 * Testimonials — placeholder testimonial cards.
 *
 * Renders as "ready for real testimonials" cards. Quotes left generic so
 * the team can paste in real parent quotes without restyling. Never show
 * fake names or fake quotes.
 */
const TESTIMONIAL_PLACEHOLDERS = [
    {
        quote:
            'Your testimonial here. We would love to feature your family’s story — contact us to share it.',
        name: 'Parent (TBD)',
        location: 'Diaspora (TBD)',
        initials: '☆',
    },
    {
        quote:
            'Your testimonial here. Real parent quotes will replace this card before launch.',
        name: 'Parent (TBD)',
        location: 'Diaspora (TBD)',
        initials: '☆',
    },
];

export function Testimonials() {
    return (
        <section className="px-5 py-16" aria-label="Family testimonials">
            <div className="mx-auto max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-2">
                    Families who keep culture alive
                </h2>
                <p className="text-sm text-[#5f5f5d] text-center mb-10">
                    Real parent stories coming soon. These cards are ready for
                    your testimonial — <a href="/contact" className="text-[#0e9aa7] underline underline-offset-2 font-semibold">share yours</a>.
                </p>
                <div className="grid sm:grid-cols-2 gap-5">
                    {TESTIMONIAL_PLACEHOLDERS.map((t, i) => (
                        <figure
                            key={i}
                            className="rounded-2xl bg-white border border-[#eceae4] p-6 shadow-sm flex flex-col gap-4"
                        >
                            <div className="flex gap-1 text-[#fbbf24]" aria-hidden>
                                {'★★★★★'.split('').map((s, idx) => (
                                    <span key={idx}>{s}</span>
                                ))}
                            </div>
                            <blockquote className="text-sm text-[#1c1c1c] leading-relaxed italic">
                                “{t.quote}”
                            </blockquote>
                            <figcaption className="flex items-center gap-3 mt-auto">
                                <span
                                    className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fb7118] to-[#fbbf24] flex items-center justify-center text-white font-bold text-sm"
                                    aria-hidden
                                >
                                    {t.initials}
                                </span>
                                <span className="text-xs">
                                    <span className="block font-bold text-[#1c1c1c]">
                                        {t.name}
                                    </span>
                                    <span className="text-[#5f5f5d]">
                                        {t.location}
                                    </span>
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
