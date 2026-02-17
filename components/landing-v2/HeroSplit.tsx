"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

interface HeroSplitProps {
    content: {
        headline: string;
        subheadline: string;
        cta_main: string;
        cta_sub: string;
    };
}

export const HeroSplit = ({ content }: HeroSplitProps) => {
    return (
        <section className="relative min-h-[95vh] flex items-center bg-[#FFFDF7] pt-32 pb-20 overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left side: Content */}
                    <div className="flex-1 space-y-10 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 shadow-sm"
                        >
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-sm font-black text-primary uppercase tracking-[0.2em]">
                                Likkle Legends V2 • High Conversion
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-6xl lg:text-[5.5rem] font-black text-deep leading-[0.95] tracking-tighter"
                        >
                            {content.headline.split('.').map((part, i) => (
                                <span key={i} className="block">
                                    {part}{i === 0 ? '.' : ''}
                                </span>
                            ))}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-2xl text-deep/60 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
                        >
                            {content.subheadline}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-6"
                        >
                            <Link
                                href="#pricing"
                                className="group relative inline-flex items-center justify-center px-12 py-7 bg-primary text-white rounded-[2rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30 animate-neural-halo"
                            >
                                <span className="relative z-10">{content.cta_main}</span>
                                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="/free-signup"
                                className="group inline-flex items-center justify-center px-12 py-7 bg-white text-deep border-4 border-white rounded-[2rem] font-black text-xl transition-all hover:border-secondary shadow-xl shadow-deep/5"
                            >
                                {content.cta_sub}
                            </Link>
                        </motion.div>

                        {/* Social Proof Mini */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex items-center gap-4 justify-center lg:justify-start"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-zinc-100 overflow-hidden relative shadow-lg">
                                        <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="User avatar" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="flex gap-0.5 text-yellow-500 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Sparkles key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-deep/40">Trusted by 512+ Families</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side: Visual */}
                    <div className="flex-1 w-full max-w-3xl lg:max-w-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative aspect-[4/5] lg:aspect-square bg-zinc-100 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(2,48,71,0.2)] border-[16px] border-white group"
                        >
                            {/* In a real scenario, this would be the photo described in visual_note */}
                            <img
                                src="https://images.unsplash.com/photo-1544333346-601e3b5e9333?q=80&w=2670&auto=format&fit=crop"
                                alt="Child holding Legend Envelope"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent"></div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                                    <Play className="w-10 h-10 fill-white ml-2" />
                                </button>
                            </div>

                            {/* Floating Product Badge */}
                            <div className="absolute bottom-12 left-12 right-12 p-8 glass-card border-white/40 rounded-[2.5rem] animate-float">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-deep leading-tight">The $10 Intro Kit</p>
                                        <p className="text-sm font-bold text-deep/40 uppercase tracking-widest mt-1">Stickers + Story + Digital Access</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Icons */}
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 -right-8 w-40 h-40 bg-yellow-400 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-6xl border-8 border-white"
                        >
                            💌
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary rounded-full shadow-2xl flex items-center justify-center text-5xl border-8 border-white"
                        >
                            🤖
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
