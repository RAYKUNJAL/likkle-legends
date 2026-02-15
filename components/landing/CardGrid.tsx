'use client';

import { useGeo } from '../GeoContext';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

import Image from 'next/image';
import { siteContent } from '@/lib/content';

const CARDS = [
    {
        ...siteContent.what_you_get.items[0], // Letter
        id: 'mail',
        cta: { label: "Get the $10 Intro Envelope", action: () => { trackEvent('ll_cta_click', { cta_id: 'CARD_USA_MAIL', variant: 'USA' }); window.location.href = '#offer'; } },
        showWhen: ['USA_MAIL_FIRST']
    },
    {
        ...siteContent.what_you_get.items[2], // Digital Universe
        id: 'bundle',
        cta: { label: "See Plans", action: () => { trackEvent('ll_cta_click', { cta_id: 'CARD_PLANS', variant: 'GLOBAL' }); window.location.href = '#plans'; } },
        showWhen: ['USA_MAIL_FIRST', 'GLOBAL_DIGITAL_FIRST']
    },
    {
        ...siteContent.what_you_get.items[3], // Tanty's Porch
        id: 'sel',
        cta: { label: "See Tanty's Porch", action: () => { trackEvent('ll_cta_click', { cta_id: 'CARD_TANTY', variant: 'GLOBAL' }); window.location.href = '#tanty'; } },
        showWhen: ['USA_MAIL_FIRST', 'GLOBAL_DIGITAL_FIRST']
    },
    {
        ...siteContent.what_you_get.items[4], // Reading Buddy
        id: 'buddy',
        cta: { label: "Meet the Buddy", action: () => { trackEvent('ll_cta_click', { cta_id: 'CARD_BUDDY', variant: 'GLOBAL' }); window.location.href = '#story-studio'; } },
        showWhen: ['USA_MAIL_FIRST', 'GLOBAL_DIGITAL_FIRST']
    }
];

export default function CardGrid() {
    const { variant } = useGeo();

    const visibleCards = CARDS.filter(card => card.showWhen.includes(variant));

    return (
        <section id="inside" className="py-24 bg-zinc-50 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16 px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-black text-deep"
                    >
                        What Your Child Gets
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-lg text-deep/60"
                    >
                        A culture-rich learning universe guided by island characters—built for busy parents.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {visibleCards.map((card, idx) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col p-6 bg-white rounded-3xl border border-zinc-100 hover:border-emerald-200 hover:shadow-xl transition-all group"
                        >
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-zinc-50 border border-zinc-100">
                                <Image
                                    src={(card as any).media}
                                    alt={(card as any).title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            <h3 className="text-lg font-black text-deep mb-4 leading-tight">
                                {(card as any).title}
                            </h3>

                            <p className="flex-1 text-deep/60 text-sm font-medium mb-6 leading-relaxed">
                                {(card as any).description}
                            </p>

                            <button
                                onClick={card.cta.action}
                                className="group flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider"
                            >
                                {card.cta.label}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
