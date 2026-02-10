'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Sparkles, Heart } from 'lucide-react';

export default function LandingHero({ content }: { content: any }) {
    const { hero } = content;

    return (
        <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-amber-50/80 via-emerald-50/40 to-white">
            {/* Subtle background decorations */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-100/30 to-transparent pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Content Side */}
                <div className="space-y-8 order-2 lg:order-1">
                    {/* Trust indicators */}
                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <Shield className="w-3 h-3" /> Safe
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            <Sparkles className="w-3 h-3" /> Ad-free
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            <Heart className="w-3 h-3" /> For diaspora families
                        </span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
                            🌴 Join 500+ Caribbean Families
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-deep leading-[1.05] tracking-tight">
                            Don't Let the <span className="text-emerald-600">Culture Fade.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-deep/70 leading-relaxed max-w-xl">
                            Build their identity through personalized mail adventures and interactive island folklore.
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/get-started"
                            className="btn btn-primary btn-lg px-8 py-5 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] transition-all group text-center"
                        >
                            {hero.primary_cta?.label || "Try the $10 Intro Experience"}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/get-started"
                            className="btn bg-white border-2 border-zinc-200 text-deep hover:bg-zinc-50 px-8 py-5 text-lg transition-all text-center"
                        >
                            Explore Free Trial
                        </Link>
                    </div>

                    {/* Micro-copy */}
                    <p className="text-sm text-deep/50 font-medium">
                        Cancel anytime • No spam • Kid-safe content
                    </p>
                </div>

                {/* Visual Side */}
                <div className="relative order-1 lg:order-2 flex justify-center">
                    <div className="relative w-full max-w-md">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/30 via-emerald-300/20 to-blue-300/30 rounded-[3rem] blur-[60px] scale-110" />

                        {/* Main image container */}
                        <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl aspect-[4/5] bg-gradient-to-br from-emerald-100 to-amber-50">
                            <Image
                                src={hero.hero_media?.src || "/images/hero_landing.png"}
                                alt={hero.hero_media?.alt || "Caribbean children enjoying learning activities"}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Floating badge - mail */}
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-zinc-100 animate-float">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                                    📬
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-deep/60 uppercase tracking-wide">Physical Mail</p>
                                    <p className="text-sm font-bold text-deep">+ Digital Unlock</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge - monthly */}
                        <div className="absolute -top-4 -right-4 bg-emerald-500 text-white rounded-2xl px-4 py-2 shadow-xl hidden sm:block">
                            <p className="text-xs font-bold uppercase tracking-wide">New Monthly</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
