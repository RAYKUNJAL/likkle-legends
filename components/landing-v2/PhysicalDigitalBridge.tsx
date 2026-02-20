"use client";

import { motion } from "framer-motion";
import { Mail, Key, Sparkles, ArrowRight, Package, Globe, Bell, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const PhysicalDigitalBridge = () => {
    return (
        <section className="py-20 sm:py-32 lg:py-48 bg-[#FFFDF7] relative overflow-hidden" id="envelope">
            <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-primary/[0.03] rounded-full blur-[200px] -ml-[500px] -mt-[400px]"></div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-16 lg:gap-28">

                    {/* Left: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 w-full relative"
                    >
                        <div className="relative">
                            <div className="absolute -inset-8 bg-primary/5 rounded-[5rem] blur-3xl"></div>

                            <div className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-premium-xl border-[8px] sm:border-[12px] border-white bg-zinc-50 aspect-[4/3]">
                                <Image
                                    src="https://images.unsplash.com/photo-1566367576585-051277d529da?q=80&w=1000&auto=format&fit=crop"
                                    alt="Child receiving Legend Envelope"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/5 via-transparent to-transparent pointer-events-none"></div>
                            </div>

                            {/* Key Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-6 -right-4 lg:-right-8 bg-white p-5 rounded-2xl shadow-premium border border-zinc-100 flex items-center gap-3 z-20"
                            >
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <Key size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-deep text-sm leading-none">Legend Key Code</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-primary mt-1">Inside Every Envelope</p>
                                </div>
                            </motion.div>

                            {/* US Only Badge */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -top-4 -left-4 lg:-left-8 bg-white p-4 rounded-2xl shadow-premium border border-zinc-100 flex items-center gap-2.5 z-20"
                            >
                                <Globe size={18} className="text-secondary" />
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-deep/40">US Mail Live</p>
                                    <p className="text-[7px] font-bold uppercase tracking-widest text-deep/20">CA/UK Coming Soon</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 space-y-8"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/5 rounded-full">
                            <Mail size={14} className="text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Physical + Digital</span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-black text-deep tracking-tighter leading-tight py-2">
                            The Legend Envelope—<br />
                            <span className="text-gradient italic">Play Now, Then Feel</span><br />
                            It in the Mail.
                        </h2>

                        <p className="text-base lg:text-lg text-deep/50 leading-relaxed font-medium max-w-lg">
                            We use lightweight, high-quality Legend Envelopes to keep shipping simple. Every $10 Intro includes a personalized physical letter addressed to your child—mailed in the <strong className="text-deep font-black">United States</strong>.
                        </p>

                        {/* Bullets */}
                        <div className="space-y-3">
                            {[
                                "Personalized to your child's name + island identity",
                                "Legend Key Code unlocks a bonus Island Pack",
                                "Mini challenge inside (Math or Reading)",
                            ].map(b => (
                                <div key={b} className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                                    <span className="text-sm font-medium text-deep/60">{b}</span>
                                </div>
                            ))}
                        </div>

                        {/* Delivery + Loss Policy */}
                        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 space-y-3">
                            <div className="flex items-center gap-3">
                                <Package size={16} className="text-primary" />
                                <span className="text-sm font-bold text-deep/60">US delivery: 3–7 business days</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-deep/20 bg-zinc-100 px-2 py-0.5 rounded-full">CA/UK Soon</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={14} className="text-yellow-500" />
                                <span className="text-xs font-medium text-deep/40">If the US letter is delayed or lost, we reissue your Key Code.</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-3">
                            <Link href="/checkout" className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Get the $10 Pass
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/waitlist"
                                className="flex items-center gap-2 px-6 py-4 bg-white text-deep border border-zinc-200 rounded-xl font-bold text-sm hover:border-primary/30 transition-all"
                            >
                                <Bell size={14} />
                                Join Canada/UK Waitlist
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
