"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, ShieldCheck, Zap, Sparkles, CreditCard } from "lucide-react";

interface Tier {
    name: string;
    price: string;
    billing?: string;
    features: string[];
    cta: string;
    highlight?: boolean;
    ribbon?: string;
}

interface ComparisonTableProps {
    tiers: Tier[];
}

export const ComparisonTable = ({ tiers }: ComparisonTableProps) => {
    return (
        <section id="pricing" className="py-64 bg-zinc-50 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#023047 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-32 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-4 px-6 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.4em]"
                    >
                        <CreditCard size={16} /> Heritage Pricing
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-[6.5rem] font-black text-deep tracking-tighter leading-[0.9]"
                    >
                        Start Your Child's <br /><span className="text-gradient italic">Adventure</span> today.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-2xl text-deep/40 font-medium"
                    >
                        Choose the path that fits your family's pace.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto items-center">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            className={`relative group ${tier.highlight ? 'z-20 scale-105 lg:scale-110' : 'z-10 bg-white shadow-premium'}`}
                        >
                            {/* Featured Ribbon / Highlight Effects */}
                            {tier.highlight && (
                                <>
                                    <div className="absolute -inset-1 bg-primary-gradient rounded-[4.2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-neural-halo"></div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-xl shadow-primary/30 flex items-center gap-2 border-4 border-white">
                                        <Sparkles size={14} /> {tier.ribbon || "Most Popular Choice"}
                                    </div>
                                </>
                            )}

                            <div className={`p-16 rounded-[4.1rem] border h-full transition-all duration-700 flex flex-col ${tier.highlight
                                    ? 'bg-white border-primary shadow-premium-xl'
                                    : 'bg-white border-zinc-100 hover:border-primary/20'
                                }`}>
                                <div className="mb-12">
                                    <h3 className="text-2xl font-black text-deep uppercase tracking-[0.2em] mb-4 opacity-40">{tier.name}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-7xl font-black text-deep tracking-tighter">{tier.price}</span>
                                        <span className="text-lg font-bold text-deep/30">{tier.billing}</span>
                                    </div>
                                </div>

                                <ul className="space-y-6 mb-16 flex-grow">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-4 group/item">
                                            <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${tier.highlight ? 'bg-primary text-white' : 'bg-zinc-100 text-deep/30 group-hover/item:bg-primary/10 group-hover/item:text-primary'
                                                }`}>
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                            <span className="text-lg font-bold text-deep/70">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-8 rounded-[2.5rem] font-black text-xl uppercase tracking-widest transition-all overflow-hidden relative group/btn ${tier.highlight
                                        ? 'bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95'
                                        : 'bg-zinc-100 text-deep/40 hover:bg-deep hover:text-white'
                                    }`}>
                                    <span className="relative z-10">{tier.cta}</span>
                                    {tier.highlight && (
                                        <div className="absolute inset-0 bg-primary-gradient opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                    )}
                                </button>

                                <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-deep/20">Secure Checkout Guarantee</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Signals Footer */}
                <div className="mt-40 flex flex-col md:flex-row items-center justify-center gap-16 border-t border-zinc-200 pt-32">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white shadow-premium rounded-[2rem] flex items-center justify-center text-primary border border-zinc-50">
                            <ShieldCheck size={40} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-deep italic leading-none">Safe Storage</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-deep/30 mt-2">Closed-loop AI Systems</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white shadow-premium rounded-[2rem] flex items-center justify-center text-success border border-zinc-50">
                            <Zap size={40} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-deep italic leading-none">Instant Access</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-deep/30 mt-2">Unlocks Portal upon Purchase</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
