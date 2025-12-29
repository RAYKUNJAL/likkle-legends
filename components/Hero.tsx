"use client";

import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-[85vh] flex items-center pt-12 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero.png"
                    alt="Caribbean Sunrise"
                    fill
                    className="object-cover opacity-20 brightness-110"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background"></div>
            </div>

            <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 max-w-2xl">
                    <div className="flex gap-4">
                        <span className="px-4 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-bold uppercase tracking-wider">Mini Legends (4-5)</span>
                        <span className="px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wider">Big Legends (6-8)</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                        Your Child Just Got a <span className="text-primary">Magical Letter</span> from a Likkle Legend!
                    </h1>
                    <p className="text-xl lg:text-2xl text-deep opacity-80 leading-relaxed">
                        A Monthly Adventure in Culture, Confidence & Caribbean Fun — Delivered to Your Door for just <span className="font-bold text-primary">$10/month</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="#pricing" className="btn btn-primary btn-lg px-8 py-5 text-lg group">
                            Start Your Child's Adventure <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={() => {
                                const widget = document.querySelector('button[class*="bg-accent"]');
                                if (widget instanceof HTMLElement) widget.click();
                            }}
                            className="btn bg-white border-2 border-border text-deep hover:bg-zinc-50 py-5"
                        >
                            Ask Tanty Spice ✨
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm font-semibold opacity-70">
                        <div className="flex items-center gap-2"><Check className="text-secondary w-5 h-5" /> 500+ Happy Families</div>
                        <div className="flex items-center gap-2"><Check className="text-secondary w-5 h-5" /> Cancel Anytime</div>
                        <div className="flex items-center gap-2"><Check className="text-secondary w-5 h-5" /> Ships Worldwide</div>
                    </div>
                </div>

                <div className="relative aspect-square lg:aspect-auto h-full min-h-[400px] animate-float">
                    <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl rotate-2 border-8 border-white/50 bg-white/5 backdrop-blur-sm">
                        <Image
                            src="/images/child_reading.png"
                            alt="Child reading Likkle Legends letter"
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Floating Element: $10 Badge */}
                    <div className="absolute -top-6 -right-6 bg-secondary text-white p-8 rounded-full shadow-2xl animate-bounce flex flex-col items-center justify-center transform scale-110 border-4 border-white/30 backdrop-blur-sm">
                        <span className="text-xs font-bold uppercase tracking-tighter">Only</span>
                        <span className="text-5xl font-black">$10</span>
                        <span className="text-xs font-bold">/MO</span>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden lg:block">
                <div className="w-6 h-10 border-2 border-deep rounded-full flex justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-deep rounded-full"></div>
                </div>
            </div>
        </section>
    );
}
