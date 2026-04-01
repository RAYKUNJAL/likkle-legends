'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const pains = [
    {
        emoji: '😔',
        pain: '"My child doesn\'t know where we\'re from."',
        fix: 'Monthly letters featuring real Caribbean places, foods & stories — right in their hands.',
    },
    {
        emoji: '📱',
        pain: '"They\'re glued to YouTube. I hate it."',
        fix: 'A kid-safe digital portal with island adventures, songs, and badges — zero ads, zero YouTube.',
    },
    {
        emoji: '🌍',
        pain: '"We live abroad. They\'re losing the culture."',
        fix: 'Wherever you are — New York, London, Toronto — your child grows up knowing their roots.',
    },
];

export default function ParentEmotionalHook() {
    return (
        <section className="py-24 bg-[#FFFDF7] border-b border-orange-100 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-5">
                        For Caribbean Families Everywhere
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-deep leading-tight">
                        Sound familiar?
                    </h2>
                    <p className="mt-4 text-xl text-deep/50 font-medium max-w-xl mx-auto">
                        You're not alone. Thousands of Caribbean parents feel this exact tension — and we built Likkle Legends to solve it.
                    </p>
                </div>

                {/* Pain → Fix Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {pains.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.5 }}
                            className="bg-white rounded-[2rem] p-8 shadow-lg border border-orange-50 hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <div className="text-5xl mb-5">{item.emoji}</div>
                            {/* The pain */}
                            <p className="text-deep font-black text-lg italic mb-4 leading-snug">
                                {item.pain}
                            </p>
                            {/* The divider */}
                            <div className="w-8 h-1 bg-orange-400 rounded-full mb-4" />
                            {/* The fix */}
                            <p className="text-deep/60 font-medium leading-relaxed text-sm">
                                {item.fix}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Mid-page CTA — catches parents who are already convinced */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-orange-500 rounded-[2.5rem] p-10 md:p-14 text-center text-white shadow-2xl shadow-orange-500/30"
                >
                    <p className="text-white/70 font-black uppercase tracking-widest text-sm mb-3">Start Today</p>
                    <h3 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                        Your child's Caribbean adventure<br className="hidden md:block" /> is one click away.
                    </h3>
                    <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                        First month just <strong>$10</strong>. Cancel anytime. USA shipping only.
                    </p>
                    <Link
                        href="/signup?plan=starter_mailer"
                        className="inline-flex items-center gap-3 bg-white text-orange-600 font-black text-xl px-10 py-5 rounded-[2rem] hover:scale-105 hover:shadow-xl transition-all active:scale-95"
                    >
                        Claim My $10 Intro Pack
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="mt-5 text-white/50 text-sm font-bold">
                        🔒 Secure checkout · Cancel anytime · Ad-free, kid-safe
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
