"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, ArrowRight, Mail, Sparkles } from "lucide-react";

interface InteractiveHeroProps {
    content: {
        eyebrow: string;
        headline: string;
        subheadline: string;
        primary_cta: {
            text: string;
            link: string;
            impact: string;
        };
        secondary_cta: {
            text: string;
            link: string;
        };
        visual: {
            type: string;
            src: string;
            caption: string;
        };
    };
}

export const InteractiveHero = ({ content }: InteractiveHeroProps) => {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FFFDF7] pt-20">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-32 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-2xl -ml-32 -mb-16"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-primary uppercase tracking-widest">
                                {content.eyebrow}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-black text-deep leading-[1.1] tracking-tighter"
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
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-deep/60 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                        >
                            {content.subheadline}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4"
                        >
                            <Link
                                href={content.primary_cta.link}
                                className={`group relative inline-flex items-center justify-center px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 ${content.primary_cta.impact === 'pulse_animation' ? 'animate-neural-halo' : ''}`}
                            >
                                <span className="relative z-10">{content.primary_cta.text}</span>
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href={content.secondary_cta.link}
                                className="group inline-flex items-center justify-center px-10 py-5 bg-white text-deep border-4 border-white rounded-2xl font-black text-lg transition-all hover:border-secondary shadow-lg shadow-deep/5"
                            >
                                {content.secondary_cta.text}
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="flex items-center gap-4 justify-center lg:justify-start text-xs font-bold text-deep/40 uppercase tracking-widest"
                        >
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <span>Joined by 512+ Caribbean Families</span>
                        </motion.div>
                    </div>

                    {/* Visual Content */}
                    <div className="flex-1 w-full max-w-2xl lg:max-w-none relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative aspect-video lg:aspect-square bg-zinc-100 rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white"
                        >
                            {/* In a real app, this would be content.visual.src */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1512413919939-d4000b9c5f82?q=80&w=2670&auto=format&fit=crop"
                                        alt="Child Opening Mail"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-deep/20 backdrop-blur-[2px]"></div>
                                </div>
                                <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                                    <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 p-6 glass-card rounded-2xl animate-float">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                            <Mail className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-black text-deep text-sm">{content.visual.caption}</p>
                                            <p className="text-[10px] uppercase font-bold text-deep/40 tracking-widest">The Legend Envelope Experience</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative floating stickers */}
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-3xl rotate-12 flex items-center justify-center text-4xl shadow-xl border-4 border-white"
                        >
                            🏝️
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400 rounded-full -rotate-12 flex items-center justify-center text-4xl shadow-xl border-4 border-white"
                        >
                            🦜
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
