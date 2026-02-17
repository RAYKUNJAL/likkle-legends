"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck, Wifi, Leaf, Award } from "lucide-react";

const badges = [
    { icon: ShieldCheck, label: "COPPA Compliant", color: "text-success" },
    { icon: Wifi, label: "Ad-Free Platform", color: "text-primary" },
    { icon: Leaf, label: "Kid-Safe AI", color: "text-secondary" },
    { icon: Award, label: "Heritage Verified", color: "text-yellow-500" },
];

export const SocialProofBar = () => {
    return (
        <section className="py-8 bg-zinc-50 border-y border-zinc-100 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                            ))}
                        </div>
                        <span className="text-sm font-black text-deep tracking-tight">4.98/5.0</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-deep/30">from 512+ families</span>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-6 bg-zinc-200"></div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-5">
                        {badges.map(b => (
                            <div key={b.label} className="flex items-center gap-1.5">
                                <b.icon size={14} className={b.color} />
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-deep/30">{b.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
