"use client";

import { motion } from "framer-motion";
import { Mic, Heart, Brain, Zap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface Character {
    name: string;
    title: string;
    image: string;
    hook: string;
    benefit_copy: string;
    focus: string;
}

interface DualCharacterGridProps {
    title: string;
    characters: Character[];
}

export const DualCharacterGrid = ({ title, characters }: DualCharacterGridProps) => {
    return (
        <section className="py-32 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-xs font-black uppercase tracking-[0.3em]"
                    >
                        Meet The Guides
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-deep tracking-tighter leading-tight"
                    >
                        {title}
                    </motion.h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    {characters.map((char, i) => (
                        <motion.div
                            key={char.name}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            className="bg-[#F8F9FA] rounded-[5rem] overflow-hidden flex flex-col group border border-transparent hover:border-zinc-200 transition-all duration-700"
                        >
                            {/* Visual Layer */}
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <img
                                    src={char.name === "Tanty Spice" ? "/images/tanty_spice.png" : "/images/roti-new.jpg"}
                                    alt={char.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent"></div>

                                <div className="absolute top-10 right-10 flex gap-3">
                                    <div className="px-6 py-3 bg-white rounded-2xl shadow-xl font-black text-sm text-deep uppercase tracking-widest flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-orange-500 animate-pulse' : 'bg-secondary animate-pulse'}`}></div> Live In-Portal
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-10 p-8">
                                    <h4 className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-2">{char.title}</h4>
                                    <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{char.name}</h3>
                                </div>
                            </div>

                            {/* Content Layer */}
                            <div className="p-12 lg:p-16 space-y-8">
                                <div className="space-y-4">
                                    <p className="text-2xl font-black text-deep italic leading-tight">
                                        "{char.hook}"
                                    </p>
                                    <p className="text-lg text-deep/60 leading-relaxed font-medium">
                                        {char.benefit_copy}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-zinc-200">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-deep/30">Primary Focus</p>
                                        <div className="flex items-center gap-2 font-black text-deep">
                                            {i === 0 ? <Heart className="text-primary w-5 h-5" /> : <Brain className="text-secondary w-5 h-5" />}
                                            {char.focus}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-deep/30">Technology</p>
                                        <div className="flex items-center justify-end gap-2 font-black text-deep">
                                            {i === 0 ? <Mic className="text-primary w-5 h-5" /> : <Zap className="text-secondary w-5 h-5" />}
                                            {i === 0 ? "Dialect AI" : "Voice-to-Learn"}
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-6 flex items-center justify-center gap-4 bg-deep text-white rounded-[2rem] font-black text-lg transition-all hover:bg-primary group/btn">
                                    Interact with {char.name} <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust mini bar */}
                <div className="mt-24 p-8 bg-zinc-50 rounded-[3rem] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 border border-zinc-100">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-deep/40">100% Ad-Free Arena</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-deep/40">Powered by Caribbean Lore</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
