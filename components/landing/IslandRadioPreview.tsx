'use client';

import Link from 'next/link';
import { Radio, Shield, Volume2, Car } from 'lucide-react';

export default function IslandRadioPreview({ content }: { content: any }) {
    const { island_radio } = content;
    if (!island_radio) return null;

    const iconMap: Record<string, any> = {
        shield: Shield,
        volume: Volume2,
        car: Car
    };

    return (
        <section className="py-20 bg-deep text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.png')]" />
            </div>

            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] opacity-20 -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-[150px] opacity-20 -ml-48 -mb-48" />

            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                                <Radio className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                                    {island_radio.tagline}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black leading-tight">
                                {island_radio.title}
                            </h2>

                            <p className="text-xl text-white/70 leading-relaxed">
                                {island_radio.subtitle}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {(island_radio.benefits || []).map((benefit: any) => {
                                    const Icon = iconMap[benefit.icon] || Shield;
                                    return (
                                        <div
                                            key={benefit.label}
                                            className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                                        >
                                            <Icon className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="font-bold text-sm">{benefit.label}</p>
                                                <p className="text-xs text-white/50">{benefit.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Link
                                href={island_radio.cta.href}
                                className="inline-flex items-center gap-2 btn bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all"
                            >
                                {island_radio.cta.label}
                            </Link>
                        </div>

                        {/* Visual */}
                        <div className="relative">
                            <div className="aspect-square max-w-xs mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-amber-500/30 rounded-full blur-[60px]" />
                                <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Radio className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{island_radio.title}</h3>
                                        <p className="text-white/60 text-sm mb-6">Caribbean kids' music</p>

                                        {/* Fake audio bars */}
                                        <div className="flex items-end justify-center gap-1 h-16">
                                            {[3, 5, 8, 6, 9, 4, 7, 5, 8, 6, 4, 7].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-2 bg-white/40 rounded-full animate-pulse"
                                                    style={{
                                                        height: `${h * 6}px`,
                                                        animationDelay: `${i * 0.1}s`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
