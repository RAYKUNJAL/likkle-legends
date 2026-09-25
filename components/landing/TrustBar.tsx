'use client';

import { Shield, Lock, Sparkles, Calendar } from 'lucide-react';

const BADGES = [
    { icon: Shield, label: "Ad-free" },
    { icon: Lock, label: "Parent-controlled" },
    { icon: Sparkles, label: "Kid-safe" },
    { icon: Calendar, label: "New content monthly" }
];

const PAYMENT_BADGES = [
    "Visa", "Mastercard", "AmEx", "ApplePay", "GooglePay", "PayPal"
];

export default function TrustBar() {
    return (
        <section className="bg-white py-12 border-y border-zinc-100 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-wrap justify-center gap-8">
                        {BADGES.map((b, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <b.icon className="w-5 h-5 text-emerald-600" />
                                <span className="font-bold text-deep/70">{b.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 grayscale opacity-40">
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
