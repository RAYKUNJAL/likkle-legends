"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck, Heart, UserCheck } from "lucide-react";

interface SocialProofStripProps {
    data: {
        label: string;
        stars: number;
        badges: string[];
    };
}

export const SocialProofStrip = ({ data }: SocialProofStripProps) => {
    return (
        <div className="bg-deep py-8 overflow-hidden relative">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    {/* Rated 5.0 Section */}
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-white font-black text-lg tracking-tight">
                                {data.stars.toFixed(1)} / 5.0 Rating
                            </p>
                        </div>
                        <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                        <p className="text-white/60 font-medium text-sm max-w-[200px] leading-tight">
                            {data.label}
                        </p>
                    </div>

                    {/* Scrolling Badges for Mobile / Static for Desktop */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {data.badges.map((badge, i) => (
                            <motion.div
                                key={badge}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 text-white/80 group"
                            >
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                    {i === 0 ? <Heart className="w-5 h-5" /> : i === 1 ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest">{badge}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Trust Logos Placeholder */}
                    <div className="hidden lg:flex items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <span className="font-black text-xl italic text-white tracking-widest">BBC</span>
                        <span className="font-black text-xl text-white tracking-tighter uppercase">Caribbean</span>
                        <span className="font-black text-xl text-white tracking-tight">Parents</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
