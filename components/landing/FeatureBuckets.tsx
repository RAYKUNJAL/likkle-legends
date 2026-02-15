'use client';

import { useGeo } from '../GeoContext';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const BUCKETS = [
    {
        title: "Learn",
        items: ["ABC + Numbers tracks", "Printable activities library", "Reading-ready story paths"],
        color: 'bg-emerald-500'
    },
    {
        title: "Play",
        items: ["Island Radio (songs + nursery rhymes)", "Mini games + quizzes", "Monthly Island Drops"],
        color: 'bg-amber-500'
    },
    {
        title: "Grow",
        items: [
            "SEL stories (kindness, confidence, courage)",
            "Parent-guided prompts (no strangers)",
            "Routine builder for busy parents"
        ],
        color: 'bg-blue-500'
    }
];

export default function FeatureBuckets() {
    const { variant } = useGeo();

    const isUSA = variant === 'USA_MAIL_FIRST';

    const ctaAction = (id: string) => {
        trackEvent('ll_cta_click', { cta_id: id, variant });
        if (id.includes('FREE')) window.location.href = '/signup?flow=FREE_ONBOARDING';
        else if (id.includes('INTRO')) window.location.href = '#offer';
        else window.location.href = '#plans';
    };

    return (
        <section id="features" className="py-24 bg-zinc-50 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-deep"
                    >
                        Everything Inside the Platform
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-lg text-deep/60 max-w-2xl mx-auto"
                    >
                        Built to grow into a million-dollar Caribbean franchise—starting free, scaling smart.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {BUCKETS.map((bucket, idx) => (
                        <motion.div
                            key={bucket.title}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-3 h-10 ${bucket.color} rounded-full`} />
                                <h3 className="text-2xl font-black text-deep">{bucket.title}</h3>
                            </div>
                            <ul className="space-y-4">
                                {bucket.items.map((item, i) => (
                                    <li key={i} className="flex gap-4 text-deep font-bold text-sm">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => ctaAction('BUCKET_FREE')}
                        className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Start Free Forever
                    </button>
                    {isUSA ? (
                        <button
                            onClick={() => ctaAction('BUCKET_INTRO')}
                            className="w-full sm:w-auto px-10 py-5 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Get the $10 Intro Envelope
                        </button>
                    ) : (
                        <button
                            onClick={() => ctaAction('BUCKET_DIGITAL')}
                            className="w-full sm:w-auto px-10 py-5 bg-white text-deep border-2 border-emerald-100 font-black rounded-2xl hover:bg-emerald-50 transition-all"
                        >
                            Unlock Full Digital Access
                        </button>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
