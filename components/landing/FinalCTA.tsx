'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinalCTA() {
    return (
        <section className="py-24 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-400/20 rounded-full blur-[80px]" />
            </div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur text-white/80 text-sm font-black uppercase tracking-widest border border-white/10">
                        <Sparkles size={14} />
                        Join 500+ Families
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                        Your child's Caribbean<br className="hidden md:block" />
                        adventure starts today.
                    </h2>

                    <p className="text-xl text-white/70 font-medium max-w-xl mx-auto">
                        Monthly letters, island stories & a kid-safe learning portal —
                        everything they need to grow up proud of their roots.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/signup?plan=starter_mailer"
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-orange-600 font-black text-xl px-12 py-6 rounded-[2rem] hover:scale-105 hover:shadow-2xl transition-all active:scale-95 group"
                        >
                            <span>
                                <s className="text-orange-300 text-base mr-1">$19.99</s> Try for $10
                            </span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/signup?plan=free"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white font-black text-lg px-8 py-5 rounded-[2rem] hover:bg-white/20 transition-all"
                        >
                            Or start free →
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-white/50 text-sm font-bold">
                        <span className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-white/40" />
                            30-day money-back guarantee
                        </span>
                        <span>•</span>
                        <span>Cancel anytime</span>
                        <span>•</span>
                        <span>USA shipping only</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
