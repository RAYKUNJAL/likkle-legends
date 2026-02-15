'use client';

import { useGeo } from '../GeoContext';
import { motion } from 'framer-motion';
import { Check, Sparkles, Mail, Shield } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

import Image from 'next/image';

const BLOCKS = {
    USA: [
        {
            sku: 'FREE_FOREVER_GLOBAL',
            label: "Forever Free (Worldwide)",
            price: "$0",
            description: "Start learning today—limited access, ad-free.",
            bullets: ["Starter stories + music", "Starter activities", "Upgrade anytime"],
            cta: { label: "Start Free Forever", action: () => { trackEvent('ll_cta_click', { cta_id: 'OFFER_FREE', sku: 'FREE_FOREVER_GLOBAL' }); window.location.href = '/signup?flow=FREE_ONBOARDING'; } },
            icon: Sparkles,
            accent: 'bg-emerald-500',
            image: '/images/child_reading.png',
            finePrint: ''
        },
        {
            sku: 'INTRO_ENVELOPE_USA',
            label: "The $10 Intro Experience",
            price: "$10",
            description: "Our most popular first step! A personalized physical letter kit delivered to your mailbox.",
            bullets: ["Personalized Letter", "Cultural Flashcards", "Full Digital Access"],
            cta: { label: "Get the $10 Intro Pack", action: () => { trackEvent('ll_cta_click', { cta_id: 'OFFER_USA_MAIL', sku: 'INTRO_ENVELOPE_USA' }); window.location.href = '/intro-checkout'; } },
            icon: Mail,
            accent: 'bg-amber-500',
            image: '/images/mailing-club-lifestyle.jpg',
            badge: 'Most Popular',
            finePrint: "One-time purchase (no auto-renew)."
        }
    ],
    GLOBAL: [
        {
            sku: 'FREE_FOREVER_GLOBAL',
            label: "Forever Free (Worldwide)",
            price: "$0",
            description: "Starter access to stories, music, and activities—ad-free.",
            bullets: ["Instant access", "Parent-controlled", "Upgrade anytime"],
            cta: { label: "Start Free Forever", action: () => { trackEvent('ll_cta_click', { cta_id: 'OFFER_FREE', sku: 'FREE_FOREVER_GLOBAL' }); window.location.href = '/signup?flow=FREE_ONBOARDING'; } },
            icon: Sparkles,
            accent: 'bg-emerald-500',
            image: '/images/child_reading.png',
            finePrint: ''
        },
        {
            sku: 'DIGITAL_STARTER_GLOBAL',
            label: "Legends Plus Digital",
            price: "$24",
            description: "Pure digital magic. Instant access to the Story Studio, Island Radio, and monthly drops.",
            bullets: ["Unlimited AI Stories", "20+ Interactive Songs", "Monthly Library Drops"],
            cta: { label: "Start Legends Plus", action: () => { trackEvent('ll_cta_click', { cta_id: 'OFFER_DIGITAL', sku: 'DIGITAL_STARTER_GLOBAL' }); window.location.href = '#plans'; } },
            icon: Shield,
            accent: 'bg-blue-500',
            image: '/images/digital-portal.png',
            badge: 'Featured',
            finePrint: ''
        }
    ]
};

export default function OfferCards() {
    const { variant } = useGeo();

    const isUSA = variant === 'USA_MAIL_FIRST';

    const title = isUSA ? "Choose Your Start (USA)" : "Choose Your Start (Worldwide)";

    const blocks = isUSA ? BLOCKS.USA : BLOCKS.GLOBAL;

    return (
        <section id="offer" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-black text-deep"
                    >
                        {title}
                    </motion.h2>
                </div>

                <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 max-w-5xl mx-auto">
                    {blocks.map((block, idx) => (
                        <motion.div
                            key={block.sku}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex flex-col flex-1 p-8 rounded-[32px] border-2 ${block.badge ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10' : 'border-zinc-100'} bg-white relative`}
                        >
                            {block.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                                    {block.badge}
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-12 h-12 ${block.accent} rounded-2xl flex items-center justify-center text-white`}>
                                    <block.icon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-deep">{block.price}</div>
                                    <div className="text-[10px] font-bold text-deep/40 uppercase tracking-widest">Pricing</div>
                                </div>
                            </div>

                            <div className="relative w-full aspect-video rounded-2xl border border-zinc-100 overflow-hidden mb-8">
                                <Image
                                    src={block.image}
                                    alt={block.label}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            <h3 className="text-2xl font-black text-deep mb-4">{block.label}</h3>
                            <p className="text-deep/60 font-medium mb-8 leading-relaxed">
                                {block.description}
                            </p>

                            <ul className="flex-1 space-y-4 mb-10">
                                {block.bullets.map((bullet, i) => (
                                    <li key={i} className="flex gap-3 text-deep text-sm font-bold">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={block.cta.action}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${block.badge
                                    ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-zinc-100 text-deep hover:bg-zinc-200'
                                    }`}
                            >
                                {block.cta.label}
                            </button>

                            {block.finePrint && (
                                <p className="mt-4 text-[10px] font-bold text-center text-deep/30 uppercase tracking-widest">
                                    {block.finePrint}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
