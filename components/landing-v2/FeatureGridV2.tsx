"use client";

import { motion } from "framer-motion";
import { MessageSquareText, BookOpenCheck, Mic, BrainCircuit } from "lucide-react";

interface FeatureItem {
    character: string;
    title: string;
    description: string;
    icon: string;
}

interface FeatureGridProps {
    title: string;
    items: FeatureItem[];
    settings: {
        background: string;
        priority: string;
    };
}

export const FeatureGridV2 = ({ title, items, settings }: FeatureGridProps) => {
    return (
        <section className={`py-32 relative ${settings.background === 'light_green_gradient' ? 'bg-gradient-to-br from-[#F0F9F0] to-[#FFFDF7]' : 'bg-white'}`}>
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-xs font-black uppercase tracking-[0.3em]"
                    >
                        The Digital Universe
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-deep tracking-tighter leading-tight"
                    >
                        {title}
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            className="bg-white p-12 rounded-[4rem] shadow-2xl border border-zinc-100 flex flex-col items-center lg:items-start text-center lg:text-left group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>

                            <div className="w-24 h-24 bg-secondary text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-secondary/20 relative z-10 group-hover:rotate-12 transition-transform">
                                {i === 0 ? <BrainCircuit size={48} /> : <BookOpenCheck size={48} />}
                            </div>

                            <div className="relative z-10 space-y-4">
                                <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em]">{item.character}</h4>
                                <h3 className="text-3xl font-black text-deep tracking-tight">{item.title}</h3>
                                <p className="text-deep/60 leading-relaxed font-medium">
                                    {item.description}
                                </p>
                            </div>

                            <div className="mt-10 pt-10 border-t border-zinc-100 w-full flex items-center justify-center lg:justify-start gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-deep/40">Powered by</span>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-deep/30 bg-zinc-50 px-3 py-1 rounded-full">
                                        <MessageSquareText size={12} /> Natural Dialect AI
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-deep/30 bg-zinc-50 px-3 py-1 rounded-full">
                                        <Mic size={12} /> Voice Feedback
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
