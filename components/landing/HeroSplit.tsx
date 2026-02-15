'use client';

import { useGeo } from '../GeoContext';
import GeoTogglePills from './GeoTogglePills';
import { trackEvent } from '@/lib/analytics';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Shield, Lock, Sparkles } from 'lucide-react';

import Image from 'next/image';

export default function HeroSplit() {
    const { variant } = useGeo();

    const isUSA = variant === 'USA_MAIL_FIRST';

    const content = {
        headline: isUSA ? "Mailbox Day = Culture Day." : "Bring the Islands Home—Ad-Free Learning for Kids 4–8.",
        subheadline: isUSA
            ? "Start Free Forever—then grab the $10 Intro Envelope to unlock our bigger ad-free island world: stories, music, games, and confidence lessons for kids 4–8."
            : "Start Free Forever worldwide. Upgrade anytime to unlock the full Story Studio, Island Radio, printables, and monthly Island Drops.",
        primaryCTA: isUSA
            ? { label: "Get the $10 Intro Envelope", action: () => { trackEvent('ll_cta_click', { cta_id: 'CTA_USA_INTRO', variant }); window.location.href = '#offer'; } }
            : { label: "Start Free Forever", action: () => { trackEvent('ll_cta_click', { cta_id: 'CTA_FREE_FOREVER', variant }); window.location.href = '/signup?flow=FREE_ONBOARDING'; } },
        secondaryCTA: isUSA
            ? { label: "Start Free Forever", action: () => { trackEvent('ll_cta_click', { cta_id: 'CTA_FREE_FOREVER', variant }); window.location.href = '/signup?flow=FREE_ONBOARDING'; } }
            : { label: "Unlock Full Digital Access", action: () => { trackEvent('ll_cta_click', { cta_id: 'CTA_GLOBAL_DIGITAL', variant }); window.location.href = '#plans'; } },
        microcopy: isUSA
            ? ["USA mail packs available now. Digital works worldwide.", "Forever Free has limited access—upgrade anytime.", "Intro Envelope ships cheap via letter/flat."]
            : ["Worldwide digital access.", "Ad-free and parent-controlled.", "Mail packs currently ship in the USA only."]
    };

    return (
        <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-emerald-100/30 rounded-full blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left: Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <GeoTogglePills />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mt-8 text-4xl lg:text-5xl xl:text-6xl font-black text-deep leading-tight"
                        >
                            {content.headline}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-6 text-lg lg:text-xl text-deep/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            {content.subheadline}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={content.primaryCTA.action}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {content.primaryCTA.label}
                            </button>
                            <button
                                onClick={content.secondaryCTA.action}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-deep font-black text-lg rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 transition-all"
                            >
                                {content.secondaryCTA.label}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4"
                        >
                            {content.microcopy.map((text, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-deep/40">
                                    <Shield className="w-3 h-3 text-emerald-500" />
                                    {text}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right: Media */}
                    <div className="flex-1 w-full max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-zinc-100 border-[10px] border-white"
                        >
                            <Image
                                src={isUSA ? "/images/mailing-club-lifestyle.jpg" : "/images/digital-portal.png"}
                                alt={isUSA ? "Likkle Legends Mail Club" : "Likkle Legends Digital Portal"}
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Gradient Overlay for texture */}
                            <div className="absolute inset-0 bg-gradient-to-t from-deep/20 to-transparent pointer-events-none" />
                        </motion.div>

                        {/* Featured Trust Banner (Small) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 flex flex-wrap justify-center gap-6 p-4 bg-white/50 rounded-2xl border border-emerald-50"
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold text-deep/80">Ad-Free</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold text-deep/80">Parent-Controlled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold text-deep/80">Kid-Safe</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
