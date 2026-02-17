"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";

interface Tier {
    name: string;
    price: string;
    billing: string;
    features: string[];
    cta: string;
    highlight: boolean;
    ribbon?: string;
}

interface ComparisonTableProps {
    tiers: Tier[];
}

export const ComparisonTable = ({ tiers }: ComparisonTableProps) => {
    return (
        <section id="pricing" className="py-32 bg-[#F8F9FA] relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FF6B00 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-deep tracking-tighter leading-tight"
                    >
                        Pick Your Path <br /> to the <span className="text-primary tracking-normal italic">Islands</span>.
                    </motion.h2>
                    <p className="text-xl text-deep/50 font-medium">Whether digital or physical, your legend starts here.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative flex flex-col p-10 lg:p-12 rounded-[3.5rem] transition-all duration-500 overflow-hidden ${tier.highlight
                                    ? 'bg-deep text-white shadow-3xl scale-105 z-20 border-4 border-primary'
                                    : 'bg-white text-deep shadow-xl border border-zinc-100 hover:shadow-2xl z-10'
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-8 right-[-50px] rotate-[35deg] bg-primary text-white py-2 px-16 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg animate-pulse">
                                    {tier.ribbon}
                                </div>
                            )}

                            <div className="mb-10">
                                <h3 className={`text-xl font-black uppercase tracking-[0.2em] mb-4 ${tier.highlight ? 'text-primary' : 'text-primary/60'}`}>
                                    {tier.name}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                                    <span className={`text-sm font-bold uppercase tracking-widest ${tier.highlight ? 'text-white/40' : 'text-deep/30'}`}>
                                        {tier.billing}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 mb-12">
                                <p className={`text-xs font-black uppercase tracking-[0.2em] pt-4 border-t ${tier.highlight ? 'border-white/10 text-white/40' : 'border-zinc-100 text-deep/30'}`}>
                                    What's Included
                                </p>
                                {tier.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${tier.highlight ? 'bg-primary/20 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        <span className={`font-bold transition-all ${tier.highlight ? 'text-white/80' : 'text-deep/70'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="#"
                                className={`group flex items-center justify-center gap-3 py-6 px-8 rounded-2xl font-black text-lg transition-all active:scale-95 ${tier.highlight
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105'
                                        : 'bg-zinc-900 text-white hover:bg-deep'
                                    }`}
                            >
                                {tier.cta}
                                {tier.highlight ? <Star size={20} className="fill-white" /> : <Zap size={20} className="fill-white" />}
                            </Link>

                            {tier.highlight && (
                                <p className="mt-4 text-center text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                                    One-time payment • Instant Access
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Money Back Guarantee */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-deep flex items-center justify-center font-black">30</div>
                        <p className="text-xs font-black uppercase tracking-widest leading-tight">Day Mailbox <br /> Satisfaction</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Star className="w-8 h-8 text-primary fill-primary" />
                        <p className="text-xs font-black uppercase tracking-widest leading-tight">Trustpilot <br /> Excellent</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Zap className="w-8 h-8 text-secondary fill-secondary" />
                        <p className="text-xs font-black uppercase tracking-widest leading-tight">Secure <br /> Checkout</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
