"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Mail, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

const promises = [
    {
        icon: Zap,
        title: "Instant Portal Access",
        desc: "Get full access to all digital content immediately after purchase—no waiting for the mail.",
    },
    {
        icon: Mail,
        title: "Lost Mail? We Reissue",
        desc: "If your US Legend Envelope is delayed or lost, we reissue your Legend Key Code. No questions.",
    },
    {
        icon: RefreshCw,
        title: "30-Day Money Back",
        desc: "If you don't love it within 30 days, we refund your $10. One per household. Zero hassle.",
    },
];

export const GuaranteeBand = () => {
    return (
        <section className="py-16 sm:py-24 lg:py-32 bg-[#FFFDF7] relative overflow-hidden" id="guarantee">
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto bg-white rounded-2xl sm:rounded-[3rem] shadow-premium border border-zinc-100 overflow-hidden"
                >
                    {/* Top Banner */}
                    <div className="bg-secondary py-4 px-8 flex items-center justify-center gap-3">
                        <ShieldCheck size={20} className="text-white" />
                        <span className="text-sm sm:text-base font-black uppercase tracking-[0.3em] text-white text-center">The Triple Promise Guarantee — 30 Days</span>
                    </div>

                    {/* Promises Grid */}
                    <div className="p-6 sm:p-8 lg:p-12">
                        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                            {promises.map((p, i) => (
                                <motion.div
                                    key={p.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto">
                                        <p.icon size={28} className="text-secondary" />
                                    </div>
                                    <h3 className="text-xl font-black text-deep tracking-tight">{p.title}</h3>
                                    <p className="text-base text-deep/40 leading-relaxed font-medium">{p.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col items-center gap-4 mt-10 pt-8 border-t border-zinc-100">
                            <Link
                                href="/checkout"
                                className="group inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Get the $10 Pass — Risk Free
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/guarantee"
                                className="text-sm font-bold uppercase tracking-widest text-deep/25 hover:text-primary transition-colors underline underline-offset-4"
                            >
                                Read Full Guarantee Policy
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
