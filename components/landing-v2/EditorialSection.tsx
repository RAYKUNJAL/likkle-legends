"use client";

import { motion } from "framer-motion";
import { Leaf, UserCircle2, MailSearch, CheckCircle2 } from "lucide-react";

interface CopyBlock {
    header: string;
    body: string;
}

interface EditorialSectionProps {
    title: string;
    copy_blocks: CopyBlock[];
    visual: string;
}

export const EditorialSection = ({ title, copy_blocks }: EditorialSectionProps) => {
    return (
        <section className="py-32 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Visual side */}
                    <div className="flex-1 w-full order-2 lg:order-1">
                        <div className="relative">
                            {/* Decorative elements */}
                            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>

                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative rounded-[4rem] overflow-hidden shadow-premium aspect-[4/5]"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2574&auto=format&fit=crop"
                                    alt="Legend Envelope Flatlay"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent to-transparent"></div>

                                <div className="absolute bottom-10 left-10 p-8 glass-card border-white/20 rounded-3xl max-w-[300px] animate-float">
                                    <p className="text-white font-black text-xl leading-tight mb-2">Sustainable. Scalable. Surprise.</p>
                                    <p className="text-white/70 text-sm">Fits in any standard mailbox. No bulky box stress.</p>
                                </div>
                            </motion.div>

                            {/* Floating UI stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -right-8 top-1/4 p-6 bg-white rounded-3xl shadow-2xl border border-zinc-100 hidden md:block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Leaf size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-deep text-lg">-90%</p>
                                        <p className="text-xs font-bold text-deep/40 uppercase tracking-widest">Carbon Footprint</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Content side */}
                    <div className="flex-1 space-y-12 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="text-4xl md:text-6xl font-black text-deep leading-[1.1] tracking-tighter mb-16">
                                {title}
                            </h2>
                        </motion.div>

                        <div className="space-y-12">
                            {copy_blocks.map((block, i) => (
                                <motion.div
                                    key={block.header}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    className="flex gap-8 group"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        {i === 0 ? <MailSearch size={32} /> : <UserCircle2 size={32} />}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl lg:text-3xl font-black text-deep tracking-tight">{block.header}</h3>
                                        <p className="text-lg text-deep/60 leading-relaxed max-w-xl">
                                            {block.body}
                                        </p>
                                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest pt-2">
                                            <CheckCircle2 size={16} />
                                            {i === 0 ? "Zero porch pirate risk" : "100% Unique to your child"}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
