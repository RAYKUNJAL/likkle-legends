"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck, Heart, UserCheck, ShieldAlert } from "lucide-react";

interface SocialProofBarProps {
    data: {
        text: string;
        badges: string[];
    };
}

export const SocialProofBar = ({ data }: SocialProofBarProps) => {
    return (
        <section className="bg-deep py-12 relative overflow-hidden">
            {/* Grid background effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FF6B00 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Main Stats */}
                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <div className="flex gap-1 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 fill-current" />
                            ))}
                        </div>
                        <p className="text-white text-xl lg:text-2xl font-black tracking-tight text-center lg:text-left">
                            {data.text}
                        </p>
                    </div>

                    <div className="h-px w-full lg:w-px lg:h-16 bg-white/10"></div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-10">
                        {data.badges.map((badge, i) => (
                            <motion.div
                                key={badge}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-4 group"
                            >
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    {i === 0 ? <Heart size={28} /> : i === 1 ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                                </div>
                                <div>
                                    <span className="block text-white font-black text-sm uppercase tracking-widest">{badge}</span>
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Verified Secure</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Cert Logos */}
                    <div className="hidden xl:flex items-center gap-10 opacity-30 grayscale Contrast-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-deep font-black text-xs">G</div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-deep font-black text-xs">A</div>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-deep font-black text-xs">LL</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
