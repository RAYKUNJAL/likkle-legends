"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, RefreshCw, Mail, Zap, Lock } from "lucide-react";
import Link from "next/link";
import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";

export default function GuaranteePage() {
    return (
        <main className="min-h-screen bg-white">
            <NavbarV2 />

            <section className="pt-32 pb-20 sm:pt-48 sm:pb-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -mr-64 -mt-64"></div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 rounded-full mb-6"
                        >
                            <ShieldCheck size={14} className="text-secondary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Our Triple Promise</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-6xl font-black text-deep tracking-tighter leading-[1.1] mb-8"
                        >
                            The Likkle Legends <br />
                            <span className="text-secondary italic">Triple Promise.</span>
                        </motion.h1>

                        <div className="space-y-12 sm:space-y-16 mt-16">
                            {/* Promise 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-col sm:flex-row gap-6 sm:gap-8"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/10 rounded-[2rem] flex items-center justify-center shrink-0">
                                    <RefreshCw size={32} className="text-secondary" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl sm:text-3xl font-black text-deep tracking-tight">1. 30-Day Happiness Guarantee</h2>
                                    <p className="text-base sm:text-xl text-deep/60 leading-relaxed font-medium">
                                        We want you and your child to love Likkle Legends. If you don't feel it's adding magic to your home within the first 30 days, we'll refund your $10 immediately. No complicated forms, no "let us talk you out of it." Just send us one message.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Promise 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col sm:flex-row gap-6 sm:gap-8"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shrink-0">
                                    <Mail size={32} className="text-primary" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl sm:text-3xl font-black text-deep tracking-tight">2. The Reissue Security</h2>
                                    <p className="text-base sm:text-xl text-deep/60 leading-relaxed font-medium">
                                        Mail can be tricky. If your Legend Envelope is lost or significantly delayed by the carrier, we will reissue your physical pack or provide an instant digital backup of the exclusive Legend Key Code so your child never misses a moment.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Promise 3 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-6 sm:gap-8"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-deep/5 rounded-[2rem] flex items-center justify-center shrink-0">
                                    <Lock size={32} className="text-deep" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-2xl sm:text-3xl font-black text-deep tracking-tight">3. Heritage Integrity</h2>
                                    <p className="text-base sm:text-xl text-deep/60 leading-relaxed font-medium">
                                        We take culture seriously. Every island pack is vetted for accuracy and cultural respect. If you find a mistake in our heritage content, we won't just apologize—we'll fix it global-wide and credit your account as a thank-you for helping us preserve the culture correctly.
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="mt-20 pt-12 border-t border-zinc-100">
                            <Link href="/#pricing" className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-3 transition-all">
                                <ArrowLeft size={16} />
                                Back to Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <FooterV2 />
        </main>
    );
}
