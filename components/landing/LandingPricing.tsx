'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Star } from 'lucide-react';
import { siteContent } from '@/lib/content';

export default function LandingPricing() {
    const { pricing } = siteContent;
    const [activeTab, setActiveTab] = useState<'mail' | 'digital'>('mail');

    const filteredPlans = pricing.plans.filter((p: any) => p.tab === activeTab);

    const planIcons: Record<string, string> = {
        starter_mailer: '📬',
        legends_plus: '🌟',
        family_legacy: '👑',
        digital_explorer: '📱',
        free_forever: '🌱',
    };

    return (
        <section id="pricing" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-5">
                        Start For Just $10
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-deep leading-tight">
                        {pricing.title}
                    </h2>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-zinc-100 p-1.5 rounded-[2rem] flex gap-2">
                        {pricing.tabs.map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-8 py-3 rounded-full text-sm font-black transition-all ${activeTab === tab.id
                                    ? 'bg-deep text-white shadow-lg'
                                    : 'text-deep/40 hover:text-deep'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className={`grid gap-6 mb-12 ${filteredPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'
                    }`}>
                    {filteredPlans.map((plan: any, i: number) => {
                        const isPopular = !!plan.badge;
                        const isFree = plan.id === 'free_forever';

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-[2.5rem] border p-8 transition-all ${isPopular
                                    ? 'bg-deep text-white border-deep shadow-2xl scale-[1.03]'
                                    : isFree
                                        ? 'bg-orange-50 border-orange-100 shadow-md'
                                        : 'bg-white border-zinc-100 shadow-md hover:shadow-xl hover:-translate-y-1'
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-orange-500 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                        <Star size={12} fill="white" />
                                        {plan.badge}
                                    </div>
                                )}

                                <div className="text-4xl mb-4">{planIcons[plan.id] ?? '🌴'}</div>

                                <h3 className={`text-2xl font-black mb-1 ${isPopular ? 'text-white' : 'text-deep'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm font-medium mb-6 ${isPopular ? 'text-white/60' : 'text-deep/50'}`}>
                                    {plan.best_for}
                                </p>

                                <div className="mb-8">
                                    <span className={`text-5xl font-black ${isPopular ? 'text-white' : 'text-deep'}`}>
                                        {plan.price_display.split('/')[0]}
                                    </span>
                                    {plan.price_display.includes('/') && (
                                        <span className={`text-sm font-bold ${isPopular ? 'text-white/50' : 'text-deep/40'}`}>
                                            /{plan.price_display.split('/')[1]}
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-10 flex-1">
                                    {plan.features.map((f: string, j: number) => (
                                        <li key={j} className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPopular ? 'bg-white/20' : isFree ? 'bg-orange-200' : 'bg-emerald-100'
                                                }`}>
                                                <Check size={12} className={isPopular ? 'text-white' : 'text-emerald-600'} strokeWidth={3} />
                                            </div>
                                            <span className={`text-sm font-bold ${isPopular ? 'text-white/80' : 'text-deep/70'}`}>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.cta.href}
                                    className={`w-full py-4 rounded-2xl font-black text-center text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${isPopular
                                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20'
                                        : isFree
                                            ? 'bg-deep text-white hover:bg-slate-800'
                                            : 'bg-zinc-50 text-deep border border-zinc-200 hover:bg-zinc-100'
                                        }`}
                                >
                                    {plan.cta.label}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Guarantee */}
                <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 max-w-4xl mx-auto p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="text-3xl">🛡️</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-black text-deep mb-1">Try it completely risk-free</h4>
                        <p className="text-deep/60 font-medium text-sm">
                            If your child doesn't love it within 30 days, we'll refund every penny. No questions asked. Cancel anytime — no contracts, no hassle.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
