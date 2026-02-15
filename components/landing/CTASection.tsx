'use client';

import { useGeo } from '../GeoContext';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

export default function CTASection() {
    const { variant } = useGeo();

    const isUSA = variant === 'USA_MAIL_FIRST';

    const ctaAction = (id: string, label: string) => {
        trackEvent('ll_cta_click', { cta_id: id, label, variant });
        if (id.includes('FREE')) window.location.href = '/signup?flow=FREE_ONBOARDING';
        else if (id.includes('INTRO')) window.location.href = '#offer';
        else window.location.href = '#plans';
    };

    return (
        <section id="start" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto p-12 lg:p-24 bg-deep rounded-[4rem] text-center text-white relative overflow-hidden"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-8">
                            Build Pride. Build Confidence. Build Roots.
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                            Join the Likkle Legends universe—made for Caribbean families everywhere.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => ctaAction('FINAL_FREE', 'Start Free Forever')}
                                className="w-full sm:w-auto px-10 py-5 bg-white text-deep font-black rounded-2xl shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all text-xl"
                            >
                                Start Free Forever
                            </button>
                            {isUSA ? (
                                <button
                                    onClick={() => ctaAction('FINAL_INTRO', 'Get $10 Intro')}
                                    className="w-full sm:w-auto px-10 py-5 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all text-xl"
                                >
                                    Get the $10 Intro Envelope
                                </button>
                            ) : (
                                <button
                                    onClick={() => ctaAction('FINAL_DIGITAL', 'Unlock Digital')}
                                    className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all text-xl"
                                >
                                    Unlock Full Digital Access
                                </button>
                            )}
                        </div>

                        <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
                            {["No Credit Card Required", "Cancel Anytime", "Kid-Safe Environment"].map((badge, i) => (
                                <div key={i} className="text-xs font-black uppercase tracking-[0.2em]">{badge}</div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
