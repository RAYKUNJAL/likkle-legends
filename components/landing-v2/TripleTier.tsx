"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight, Sparkles, ShieldCheck, Star, Crown, Zap, Bell } from "lucide-react";
import Link from "next/link";

const tiers = [
    {
        name: "Digital Explorer",
        price: "$0",
        billing: "Free forever",
        highlight: false,
        cta: { label: "Sample the Vibe", href: "/checkout" },
        icon: Star,
        features: [
            { text: "Limited portal preview", included: true },
            { text: "Tanty Radio sample", included: true },
            { text: "1 free printable", included: true },
            { text: "Physical mail", included: false },
            { text: "Legend Key Code", included: false },
            { text: "Full portal access", included: false },
        ],
    },
    {
        name: "Legend Intro Pass",
        price: "$10",
        billing: "One-time payment",
        highlight: true,
        ribbon: "BEST FOR NEW FAMILIES",
        cta: { label: "Get the $10 Pass", href: "/checkout" },
        icon: Zap,
        trustNotes: ["US mail only (CA/UK coming soon)", "30-Day Triple Promise"],
        features: [
            { text: "US Personalized Letter", included: true },
            { text: "Instant Full Portal Access", included: true },
            { text: "Legend Key Code", included: true },
            { text: "Bonus Island Pack", included: true },
            { text: "Tanty Radio (Full)", included: true },
            { text: "Priority R.O.T.I. Access", included: true },
        ],
    },
    {
        name: "Legends Member",
        price: "$19.99",
        billing: "per month",
        highlight: false,
        cta: { label: "Join the Family", href: "/checkout" },
        icon: Crown,
        mailNote: "Monthly mail is US-only to start",
        waitlistCta: { label: "Join Canada/UK Waitlist", href: "/waitlist" },
        features: [
            { text: "Weekly content drops", included: true },
            { text: "Parent progress dashboard", included: true },
            { text: "Monthly US mail activities", included: true },
            { text: "Exclusive character badges", included: true },
            { text: "Early access content", included: true },
            { text: "Everything in $10 Pass", included: true },
        ],
    },
];

export const TripleTier = () => {
    return (
        <section className="py-20 sm:py-32 lg:py-48 bg-white relative overflow-hidden" id="pricing">
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[200px] -ml-[400px] -mt-[400px]"></div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 lg:mb-28 space-y-4 sm:space-y-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-deep/5 rounded-full"
                    >
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-deep/40">Simple Pricing</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl lg:text-7xl font-black text-deep tracking-tighter leading-[0.9]"
                    >
                        Start Free.<br /><span className="text-gradient italic">Go Legend.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-lg text-deep/40 font-medium max-w-xl mx-auto"
                    >
                        No surprises. No hidden fees. Cancel anytime.
                    </motion.p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 ${tier.highlight
                                ? 'bg-deep text-white shadow-premium-xl scale-[1.02] md:scale-105 z-10 border-2 border-primary/30'
                                : 'bg-white border border-zinc-100 shadow-sm hover:shadow-premium'
                                }`}
                        >
                            {tier.ribbon && (
                                <div className="bg-primary py-2 text-center">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">{tier.ribbon}</span>
                                </div>
                            )}

                            <div className="p-5 sm:p-8 lg:p-9">
                                {/* Icon + Name */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.highlight ? 'bg-primary' : 'bg-zinc-100'}`}>
                                        <tier.icon size={20} className={tier.highlight ? 'text-white' : 'text-deep/40'} />
                                    </div>
                                    <div>
                                        <h3 className={`font-black text-lg tracking-tight ${tier.highlight ? 'text-white' : 'text-deep'}`}>{tier.name}</h3>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${tier.highlight ? 'text-white/30' : 'text-deep/20'}`}>{tier.billing}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter ${tier.highlight ? 'text-white' : 'text-deep'}`}>
                                        {tier.price}
                                    </span>
                                </div>

                                {/* Trust Notes */}
                                {tier.trustNotes && (
                                    <div className="space-y-1.5 mb-6 pb-6 border-b border-white/10">
                                        {tier.trustNotes.map(note => (
                                            <div key={note} className="flex items-center gap-2">
                                                <ShieldCheck size={12} className="text-success flex-shrink-0" />
                                                <span className="text-[10px] font-bold text-white/40">{note}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Features */}
                                <div className="space-y-2.5 mb-8">
                                    {tier.features.map(feat => (
                                        <div key={feat.text} className="flex items-center gap-2.5">
                                            {feat.included ? (
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${tier.highlight ? 'bg-primary' : 'bg-secondary/10'}`}>
                                                    <Check size={11} className={tier.highlight ? 'text-white' : 'text-secondary'} />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <X size={10} className="text-zinc-300" />
                                                </div>
                                            )}
                                            <span className={`text-sm font-medium ${feat.included
                                                ? (tier.highlight ? 'text-white/80' : 'text-deep/60')
                                                : 'text-deep/20 line-through'
                                                }`}>
                                                {feat.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Mail Note */}
                                {tier.mailNote && (
                                    <p className="text-[9px] font-bold text-deep/20 mb-4 uppercase tracking-wider">{tier.mailNote} (CA/UK coming soon)</p>
                                )}

                                {/* CTA */}
                                <Link
                                    href={tier.cta.href}
                                    className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${tier.highlight
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-zinc-50 text-deep border border-zinc-100 hover:border-primary/30 hover:text-primary'
                                        }`}
                                >
                                    {tier.cta.label}
                                    <ArrowRight size={16} />
                                </Link>

                                {/* Waitlist CTA */}
                                {tier.waitlistCta && (
                                    <Link
                                        href={tier.waitlistCta.href}
                                        className="flex items-center justify-center gap-2 mt-3 py-3 text-[10px] font-bold uppercase tracking-widest text-deep/25 hover:text-primary transition-colors"
                                    >
                                        <Bell size={12} /> {tier.waitlistCta.label}
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-16 border-t border-zinc-100"
                >
                    {[
                        { icon: ShieldCheck, label: "Secure Checkout" },
                        { icon: Star, label: "4.98/5.0 Rating" },
                        { icon: Check, label: "Cancel Anytime" },
                    ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2">
                            <Icon size={16} className="text-success" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-deep/30">{label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
