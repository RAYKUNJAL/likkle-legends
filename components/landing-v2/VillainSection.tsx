"use client";

import { motion } from "framer-motion";
import { Flame, Shield, Star, Zap, Swords, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const VillainSection = () => {
    return (
        <section className="py-20 sm:py-32 lg:py-48 relative overflow-hidden" id="gamification">
            {/* Background: Deep warm gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#0d0500]"></div>
            {/* Fiery glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[200px]"></div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-16 lg:gap-24">

                    {/* Left: Villain Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 w-full max-w-md relative"
                    >
                        {/* Fiery ring */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-[4rem] blur-2xl"></div>

                        <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-[2.5rem] sm:rounded-[3.5rem] border border-red-500/10 overflow-hidden">
                            {/* Villain Image */}
                            <div className="relative aspect-[3/4] overflow-hidden group">
                                <Image
                                    src="/images/scorcha_pepper.jpg"
                                    alt="Scorcha Pepper — the mischievous villain"
                                    fill
                                    className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                />
                                {/* Fiery gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-red-900/20 pointer-events-none"></div>
                                {/* Floating flame particle */}
                                <motion.div
                                    animate={{ y: [-5, -20], opacity: [0.8, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute top-4 right-6 text-3xl sm:text-4xl pointer-events-none"
                                >
                                    🔥
                                </motion.div>
                            </div>

                            {/* Info */}
                            <div className="p-6 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-red-500/20 rounded-lg border border-red-500/20">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Villain</span>
                                    </div>
                                    <div className="px-3 py-1 bg-yellow-500/20 rounded-lg border border-yellow-500/20">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Boss Battle</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter">Scorcha Pepper</h3>
                                <p className="text-lg sm:text-base text-white/90 font-medium leading-relaxed">
                                    The mischievous pepper villain who turns up the heat across the islands. Only your child&apos;s knowledge can cool him down!
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Gamification Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-6 sm:space-y-10"
                    >


                        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight">
                            Defeat<br /><span className="text-red-400 italic">Scorcha Pepper!</span>
                        </h2>

                        <p className="text-lg sm:text-xl text-white/80 leading-relaxed font-medium max-w-lg">
                            Scorcha is turning up the heat! Your child uses their reading and math skills to &apos;cool him down&apos; and win digital badges, unlocking new islands and adventures.
                        </p>

                        {/* How It Works */}
                        <div className="space-y-4">
                            {[
                                { icon: Star, label: "Complete Learning Quests", desc: "Finish stories, math games & activities" },
                                { icon: Shield, label: "Earn Hero Badges", desc: "Collect digital badges for each island conquered" },
                                { icon: Zap, label: "Cool Down Scorcha", desc: "Use knowledge points to defeat the villain" },
                                { icon: Flame, label: "Unlock New Adventures", desc: "Each victory opens a new island chapter" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 bg-white/[0.03] rounded-xl sm:rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] transition-all"
                                >
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                        <item.icon size={22} className="text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-base sm:text-sm tracking-tight">{item.label}</p>
                                        <p className="text-sm text-white/70 font-medium">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <Link href="/checkout" className="group flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-red-500 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            Start the Adventure
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
