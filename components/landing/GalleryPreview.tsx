'use client';

import Image from 'next/image';
import { useGeo } from '../GeoContext';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

const SAMPLES = [
    { title: "Personalized Letter", image: "/images/letter-preview.png" },
    { title: "Cultural Flashcard & Activity", image: "/images/flashcard-coloring.png" }
];

export default function GalleryPreview() {
    const { variant } = useGeo();

    const isUSA = variant === 'USA_MAIL_FIRST';

    const ctaAction = (id: string, label: string) => {
        trackEvent('ll_cta_click', { cta_id: id, label, variant });
        if (id.includes('FREE')) window.location.href = '/signup?flow=FREE_ONBOARDING';
        else if (id.includes('INTRO')) window.location.href = '#offer';
        else window.location.href = '#plans';
    };

    return (
        <section id="sample-pack" className="py-24 bg-zinc-50 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-16 max-w-3xl mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-deep"
                    >
                        See a Sample Pack
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-lg text-deep/60"
                    >
                        A quick peek at what your child will explore and what the {isUSA ? 'mail pack unlocks (USA)' : 'digital world offers'}.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16 px-4">
                    {SAMPLES.map((sample, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="aspect-[4/3] rounded-[3rem] bg-white border-8 border-white shadow-xl overflow-hidden relative group"
                        >
                            <Image
                                src={sample.image}
                                alt={sample.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-black text-xl">{sample.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
                >
                    <button
                        onClick={() => ctaAction('SAMPLE_FREE', 'Start Free Forever')}
                        className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Start Free Forever
                    </button>
                    {isUSA ? (
                        <button
                            onClick={() => ctaAction('SAMPLE_INTRO', 'Get $10 Intro')}
                            className="w-full sm:w-auto px-10 py-5 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Get the $10 Intro Envelope
                        </button>
                    ) : (
                        <button
                            onClick={() => ctaAction('SAMPLE_DIGITAL', 'Unlock Digital')}
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
