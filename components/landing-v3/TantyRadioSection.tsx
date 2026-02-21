'use client';

import TantyRadio from '@/components/TantyRadio';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TantyRadioSection() {
    return (
        <section id="radio" className="py-24 relative overflow-hidden bg-slate-900">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 via-[var(--deep)] to-slate-900 opacity-80" />

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--caribbean-ocean)]/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--caribbean-sun)]/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[var(--caribbean-sun)] font-bold text-sm mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="uppercase tracking-widest">Live from the Island</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white"
                    >
                        Tune into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--caribbean-sun)] to-[var(--caribbean-mango)]">Tanty Spice Radio</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        A safe, ad-free listening space for kids. Nursery rhymes, island sounds, and learning songs curated by Tanty Spice herself.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <a
                            href="/portal/music"
                            className="px-8 py-4 bg-[var(--caribbean-sun)] text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-[var(--caribbean-sun)]/20 flex items-center gap-2"
                        >
                            Buy Tracks $0.99
                        </a>
                        <a
                            href="/portal/music?tab=custom"
                            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                            Order Custom Song
                        </a>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <TantyRadio />
                </motion.div>
            </div>
        </section>
    );
}
