'use client';

import { motion } from 'framer-motion';
import { Star, Quote, BadgeCheck } from 'lucide-react';

const stats = [
    { value: '500+', label: 'Families enrolled' },
    { value: '4.9★', label: 'Parent rating' },
    { value: '15+', label: 'Countries reached' },
    { value: '98%', label: 'Would recommend' },
];

const testimonials = [
    {
        quote: "My daughter literally runs to the mailbox on the 15th. She's never been this excited about learning.",
        name: 'Kezia T.',
        initials: 'KT',
        color: 'bg-orange-400',
        meta: 'Mom of Amara, 6 · Toronto, Canada',
        flag: '🇨🇦',
        stars: 5,
    },
    {
        quote: "We moved from Trinidad when she was 2. Likkle Legends is keeping our culture alive in our home in a way nothing else has.",
        name: 'Marcus J.',
        initials: 'MJ',
        color: 'bg-blue-500',
        meta: 'Dad of Zara, 7 · London, UK',
        flag: '🇬🇧',
        stars: 5,
    },
    {
        quote: "The AI reading buddy is unbelievable. My son reads to Tanty Spice every night and his confidence has jumped.",
        name: 'Nadine R.',
        initials: 'NR',
        color: 'bg-emerald-500',
        meta: 'Mom of Devon, 5 · Brooklyn, USA',
        flag: '🇺🇸',
        stars: 5,
    },
];

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <Star key={i} size={14} className="text-orange-400 fill-orange-400" />
            ))}
        </div>
    );
}

export default function SocialProofStrip() {
    return (
        <section className="py-20 bg-white border-b border-zinc-100 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <p className="text-4xl md:text-5xl font-black text-deep">{s.value}</p>
                            <p className="text-sm font-bold text-deep/40 uppercase tracking-widest mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ── Testimonials ── */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black text-deep">
                        Parents and kids <span className="text-orange-500">love it</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12 }}
                            className="bg-orange-50 rounded-[2rem] p-8 border border-orange-100 relative flex flex-col gap-5"
                        >
                            <Quote size={28} className="text-orange-200 absolute top-6 right-6" />
                            <StarRating count={t.stars} />
                            <p className="text-deep font-semibold leading-relaxed text-[15px] flex-1">
                                "{t.quote}"
                            </p>
                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-orange-100">
                                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                                    {t.initials}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-black text-deep text-sm">{t.name}</p>
                                        <BadgeCheck size={14} className="text-blue-500" />
                                    </div>
                                    <p className="text-deep/40 text-xs font-bold">{t.meta}</p>
                                </div>
                                <span className="text-xl">{t.flag}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── As Seen In / Trust Logos Placeholder ── */}
                <div className="mt-16 text-center">
                    <p className="text-xs font-black text-deep/30 uppercase tracking-widest mb-6">
                        Trusted by Caribbean families in
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-base font-bold text-deep/40">
                        {['🇺🇸 United States', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇯🇲 Jamaica', '🇹🇹 Trinidad', '🇧🇧 Barbados', '🇬🇾 Guyana', '🇳🇱 Netherlands'].map((loc, i) => (
                            <span key={i} className="px-4 py-2 rounded-full bg-zinc-50 border border-zinc-100">
                                {loc}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
