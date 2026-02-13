'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Sparkles, Heart } from 'lucide-react';

export default function LandingHero({ content }: { content: any }) {
    const { hero } = content;

    return (
        <section className="relative pt-24 pb-32 overflow-hidden bg-[#FFFDF7]">
            {/* Premium v3 Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                {/* Content Side */}
                <div className="space-y-10 order-2 lg:order-1 relative z-10">
                    <div className="space-y-8">
                        {/* Original Trust indicators & Micro-copy merged with v3 style */}
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                <Shield className="w-3 h-3" /> Kid Safe
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/50 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" /> Ad-free
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                                <Heart className="w-3 h-3" /> Diaspora First
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
                                🌴 Join 500+ Caribbean Families
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-deep leading-[1.05] tracking-tight">
                                Don't Let the <span className="text-emerald-600">Culture Fade.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-deep/70 leading-relaxed max-w-xl font-medium">
                                Build their identity through personalized mail adventures and interactive island folklore.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5">
                        <Link
                            href="/get-started"
                            className="btn btn-primary btn-lg px-10 py-6 text-xl shadow-premium hover:shadow-2xl hover:scale-[1.02] transition-all group flex items-center justify-center font-black"
                            style={{ borderRadius: '2rem' }}
                        >
                            {hero.primary_cta?.label || "Try the $10 Intro Experience"}
                            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link
                            href="/get-started"
                            className="bg-white border-2 border-slate-100 text-deep hover:bg-slate-50 px-10 py-6 text-xl font-black flex items-center justify-center transition-all shadow-sm"
                            style={{ borderRadius: '2rem' }}
                        >
                            Explore Free Trial
                        </Link>
                    </div>

                    <p className="text-sm text-deep/40 font-bold uppercase tracking-widest">
                        Cancel anytime • No spam • Child-safe Content
                    </p>
                </div>

                {/* Visual Side */}
                <div className="relative order-1 lg:order-2 flex justify-center">
                    <div className="relative w-full max-w-lg">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/40 via-emerald-300/30 to-blue-300/40 rounded-[4rem] blur-[80px] scale-110" />

                        {/* Main image container */}
                        <div className="relative rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-premium aspect-[4/5] bg-slate-50 group">
                            <Image
                                src={hero.hero_media?.src || "/images/hero_landing.png"}
                                alt={hero.hero_media?.alt || "Caribbean children enjoying learning activities"}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                priority
                            />
                            {/* Island Glass Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Floating v3 Badges */}
                        <div className="absolute -bottom-8 -left-8 glass-card p-6 shadow-premium translate-y-4 animate-float">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-amber-100 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner">
                                    📬
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Physical Mail</p>
                                    <p className="text-lg font-black text-deep">+ Digital Unlock</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-6 -right-6 bg-emerald-500 text-white rounded-[1.5rem] px-6 py-3 shadow-premium hidden sm:block rotate-6">
                            <p className="text-xs font-black uppercase tracking-widest">New Monthly Drop</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
