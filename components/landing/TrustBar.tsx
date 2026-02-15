'use client';

import { Shield, Lock, Sparkles, Calendar, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGES = [
    { icon: Shield, label: "Ad-free" },
    { icon: Lock, label: "Parent-controlled" },
    { icon: Sparkles, label: "Kid-safe" },
    { icon: Calendar, label: "New content monthly" }
];

const PAYMENT_BADGES = [
    "Visa", "Mastercard", "AmEx", "ApplePay", "GooglePay", "PayPal"
];

const QUOTES = [
    { quote: "Mailbox Day became our Culture Day. My child asks questions about the islands now.", name: "K.", location: "NY" },
    { quote: "Finally something Caribbean, kid-safe, and not full of ads.", name: "S.", location: "Toronto" }
];

export default function TrustBar() {
    return (
        <section className="bg-white py-12 border-y border-zinc-100 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                {/* 1. Main Stat & Quotes */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mb-12">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                        </div>
                        <h2 className="text-4xl font-black text-deep mb-2">500+</h2>
                        <p className="text-sm font-bold text-deep/40 uppercase tracking-widest">Families Served Globally</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 max-w-4xl">
                        {QUOTES.map((q, i) => (
                            <div key={i} className="flex-1 p-6 bg-emerald-50 rounded-2xl relative">
                                <p className="text-deep font-medium italic relative z-10">"{q.quote}"</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs font-bold text-deep/50">{q.name}, {q.location}</span>
                                    <Check className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Scrolling Badges Area */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-zinc-50">
                    <div className="flex flex-wrap justify-center gap-8">
                        {BADGES.map((b, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <b.icon className="w-5 h-5 text-emerald-600" />
                                <span className="font-bold text-deep/70">{b.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 grayscale opacity-40">
                        {/* Placeholder for payment method icons */}
                        <div className="flex gap-4">
                            {PAYMENT_BADGES.map((b, i) => (
                                <span key={i} className="text-[10px] font-black uppercase tracking-tighter border border-deep px-1.5 py-0.5 rounded">
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
