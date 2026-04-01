"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, ShieldCheck, Mail } from "lucide-react";

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
        <section className="relative min-h-screen flex items-center bg-[#FFFDF7] pt-40 pb-32 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px] -mr-96 -mt-96 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px] -ml-96 -mb-96 opacity-40"></div>

            {/* Organic Mesh Gradient Background */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #FF6B00 0%, transparent 40%), radial-gradient(circle at 80% 70%, #2D5A27 0%, transparent 40%)' }}>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
                    {/* Left: Content Block */}
                    <div className="flex-1 space-y-12 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-4 px-6 py-3 bg-white shadow-premium rounded-full border border-zinc-100"
                        >
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-100 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt={`Parent user avatar ${i}`} />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-deep/40">
                                Trusted by 2k+ Diaspora Parents
                            </span>
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                        >
                            <h1 className="text-6xl md:text-7xl lg:text-[7.5rem] font-black text-deep leading-[0.85] tracking-tighter">
                                {content.headline.split('.').map((p, i) => (
                                    <span key={i} className={`block ${i === 1 ? 'text-gradient' : ''}`}>
                                        {p}{i === 0 ? '.' : ''}
                                    </span>
                                ))}
                            </h1>

                            {/* Decorative Star */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-12 -right-12 text-primary/20 hidden xl:block"
                            >
                                <Sparkles size={80} />
                            </motion.div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-2xl lg:text-3xl text-deep/60 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
                        >
                            {content.subheadline}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-8"
                        >
                            <Link
                                href="/checkout"
                                className="group relative inline-flex items-center justify-center px-16 py-8 bg-primary text-white rounded-[2.5rem] font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-premium shadow-primary/40 animate-neural-halo overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative z-10">{content.cta_main}</span>
                                <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform relative z-10" />
                            </Link>

                            <Link
                                href="/checkout"
                                className="group inline-flex items-center justify-center px-14 py-8 bg-white text-deep border-4 border-zinc-100 rounded-[2.5rem] font-black text-xl transition-all hover:border-primary hover:text-primary shadow-xl"
                            >
                                {content.cta_sub}
                            </Link>
                        </motion.div>

                        {/* Trust Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-wrap items-center gap-8 justify-center lg:justify-start pt-12"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-deep/30">Kid-Safe Certified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                    <Mail size={20} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-deep/30">Landed in 15 Countries</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Visual Experience */}
                    <div className="flex-1 w-full max-w-4xl lg:max-w-none relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            {/* The Main Product Shot */}
                            <div className="relative aspect-[4/5] lg:aspect-square rounded-[5rem] overflow-hidden shadow-premium-xl border-[20px] border-white bg-zinc-100 group">
                                <img
                                    src="/images/child_reading.png"
                                    alt="Likkle Legends Experience"
                                    className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/30 via-transparent to-transparent"></div>

                                {/* Inner Play Label */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-28 h-28 bg-white/20 backdrop-blur-3xl text-white rounded-full flex items-center justify-center border-2 border-white/40 shadow-2xl group-hover:bg-primary transition-all duration-500"
                                    >
                                        <Play className="w-10 h-10 fill-white ml-2" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Overlapping Digital Portal Preview */}
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 40, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="absolute -bottom-16 -right-12 w-80 h-80 rounded-[4rem] overflow-hidden shadow-premium-xl border-[12px] border-white hidden xl:block"
                            >
                                <img src="/images/digital-portal.png" alt="Digital Portal" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-secondary/10"></div>
                            </motion.div>

                            {/* Floating "Next Delivery" Tag */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-12 -left-12 p-8 glass-morphism rounded-[3rem] shadow-premium flex items-center gap-6 border-white/40"
                            >
                                <div className="w-16 h-16 bg-primary-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <Mail size={32} />
                                </div>
                                <div className="pr-8">
                                    <p className="text-xl font-black text-deep leading-none">Shipping Soon</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Limited Intake</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Background Floating Assets */}
                        <div className="absolute -z-10 top-0 left-0 w-full h-full pointer-events-none">
                            <motion.div
                                animate={{ y: [0, 50, 0], x: [0, 20, 0], rotate: [0, 15, 0] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 right-0 text-[120px] opacity-20 filter blur-sm"
                            >
                                🌴
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -40, 0], x: [0, -30, 0], rotate: [0, -10, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute bottom-0 -left-20 text-[100px] opacity-20 filter blur-md"
                            >
                                ☀️
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
