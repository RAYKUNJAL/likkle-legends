'use client';

import { useGeo } from '../GeoContext';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const PLANS = [
    {
        sku: 'FREE_FOREVER_GLOBAL',
        title: "Forever Free",
        price: "$0",
        billing: "free_forever",
        description: "Starter access to the Likkle Legends universe.",
        bullets: ["Limited Story Studio", "Island Radio sampler", "Starter printables"],
        ctaLabel: "Start Free Forever",
        action: 'start_free_signup',
        showWhen: ['USA_MAIL_FIRST', 'GLOBAL_DIGITAL_FIRST']
    },
    {
        sku: 'INTRO_ENVELOPE_USA',
        title: "$10 Intro Envelope (USA)",
        price: "$10",
        billing: "one_time",
        description: "Mail pack + unlock code to bigger digital assets.",
        bullets: ["USA only", "Ships cheap via letter/flat", "Unlock card included"],
        ctaLabel: "Get the $10 Intro Envelope",
        action: 'go_to_checkout',
        showWhen: ['USA_MAIL_FIRST'],
        recommend: true
    },
    {
        sku: 'DIGITAL_STARTER_GLOBAL',
        title: "Full Digital Access",
        price: "TBD",
        billing: "monthly",
        description: "Unlock full Story Studio, Island Radio, and monthly drops.",
        bullets: ["Worldwide access", "Full library", "Monthly Island Drops"],
        ctaLabel: "Unlock Full Digital Access",
        action: 'go_to_checkout',
        showWhen: ['USA_MAIL_FIRST', 'GLOBAL_DIGITAL_FIRST']
    },
    {
        sku: 'MAIL_PLUS_DIGITAL_USA',
        title: "Mail + Digital (USA)",
        price: "TBD",
        billing: "monthly",
        description: "Monthly mail packs + full digital access.",
        bullets: ["USA shipping", "New pack monthly", "Best for routines"],
        ctaLabel: "Upgrade to Mail + Digital",
        action: 'go_to_checkout',
        showWhen: ['USA_MAIL_FIRST']
    },
    {
        sku: 'ANNUAL_GLOBAL',
        title: "Annual (Best Value)",
        price: "TBD",
        billing: "annual",
        description: "Save big and lock in island learning for the year.",
        bullets: ["Best value", "Monthly Drops included", "Early access"],
        ctaLabel: "Choose Annual",
        action: 'go_to_checkout',
        showWhen: ['USA_MAIL_FIRST', 'GLOBAL_DIGITAL_FIRST']
    }
];

export default function PricingCards() {
    const { variant } = useGeo();

    const visiblePlans = PLANS.filter(plan => plan.showWhen.includes(variant));

    const handleCTA = (sku: string, action: string) => {
        trackEvent('ll_cta_click', { cta_id: `PRICING_${sku}`, sku, variant });
        if (action === 'start_free_signup') window.location.href = '/signup?flow=FREE_ONBOARDING';
        else window.location.href = `/checkout?sku=${sku}`;
    };

    return (
        <section id="plans" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-16 px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-deep"
                    >
                        Plans & Upgrades
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-lg text-deep/60 max-w-2xl mx-auto"
                    >
                        Start Free Forever worldwide. Upgrade to unlock the full island universe.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {visiblePlans.map((plan, idx) => (
                        <motion.div
                            key={plan.sku}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex flex-col p-10 rounded-[2.5rem] border-2 transition-all relative ${plan.recommend
                                    ? 'border-emerald-500 bg-emerald-50/30 shadow-2xl shadow-emerald-500/10'
                                    : 'border-zinc-100 bg-white hover:border-zinc-200'
                                }`}
                        >
                            {plan.recommend && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5">
                                    <Star className="w-3 h-3 fill-white" /> Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-black text-deep mb-2">{plan.title}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-deep">{plan.price}</span>
                                    {plan.billing !== 'free_forever' && plan.billing !== 'one_time' && (
                                        <span className="text-deep/40 font-bold uppercase tracking-widest text-xs">/ {plan.billing}</span>
                                    )}
                                </div>
                                <p className="mt-4 text-sm font-medium text-deep/60 leading-relaxed">{plan.description}</p>
                            </div>

                            <ul className="flex-1 space-y-4 mb-10">
                                {plan.bullets.map((bullet, i) => (
                                    <li key={i} className="flex gap-3 text-deep font-bold text-sm">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCTA(plan.sku, plan.action)}
                                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 group transition-all ${plan.recommend
                                        ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-zinc-100 text-deep hover:bg-zinc-200'
                                    }`}
                            >
                                {plan.ctaLabel}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 max-w-4xl mx-auto p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                    <h4 className="text-lg font-black text-deep mb-6">Important Notes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            "Mail packs ship in the USA only (for now).",
                            "Forever Free is limited access—upgrade anytime.",
                            "No public chat and no strangers."
                        ].map((note, i) => (
                            <div key={i} className="flex gap-3 text-sm font-bold text-deep/40 italic">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                {note}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
