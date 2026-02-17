"use client";

import { motion } from "framer-motion";
import { Mail, CheckCircle2, ShieldCheck, Sparkles, MapPin } from "lucide-react";

interface ContentBlock {
    header: string;
    body: string;
}

interface BenefitStoryProps {
    title: string;
    content: ContentBlock[];
}

export const BenefitStory = ({ title, content }: BenefitStoryProps) => {
    return (
        <section className="py-32 bg-white overflow-hidden" id="about">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                    {/* Visual side: Product shot */}
                    <div className="flex-1 w-full order-2 lg:order-1">
                        <div className="relative">
                            {/* Decorative background circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px]"></div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative rounded-[5rem] overflow-hidden shadow-[0_60px_120px_-20px_rgba(255,107,0,0.2)] aspect-[4/5] border-[12px] border-white bg-zinc-50"
                            >
                                <img
                                    src="/images/mailing-club-lifestyle.jpg"
                                    alt="Legend Envelope Flatlay"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-transparent to-transparent"></div>

                                <div className="absolute bottom-12 left-12 right-12 p-8 glass-card border-white/20 rounded-[2.5rem] animate-float">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black">
                                            V2
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-lg">The 2026 Edition</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Now Shipping Globally</p>
                                        </div>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium leading-relaxed">
                                        Our signature "Legend Envelopes" are weather-resistant, tear-proof, and designed to sit in any mailbox comfortably.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Floating UI Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -left-8 top-1/4 p-6 bg-white rounded-3xl shadow-2xl border border-zinc-100 hidden xl:flex items-center gap-4"
                            >
                                <MapPin size={24} className="text-deep/20" />
                                <span className="text-xs font-black uppercase tracking-widest text-deep/40">Ships from the Coast</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Content side */}
                    <div className="flex-1 space-y-16 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="text-5xl md:text-[5rem] font-black text-deep leading-[0.95] tracking-tighter mb-16">
                                {title}
                            </h2>
                        </motion.div>

                        <div className="space-y-16">
                            {content.map((block, i) => (
                                <motion.div
                                    key={block.header}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    className="flex gap-10 group"
                                >
                                    <div className="flex-shrink-0 w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm">
                                        {i === 0 ? <Mail size={40} strokeWidth={2.5} /> : <ShieldCheck size={40} strokeWidth={2.5} />}
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-3xl lg:text-4xl font-black text-deep tracking-tighter leading-none">{block.header}</h3>
                                        <p className="text-xl text-deep/60 leading-relaxed max-w-xl font-medium">
                                            {block.body}
                                        </p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full text-xs font-black uppercase tracking-widest text-deep/30">
                                                <CheckCircle2 size={14} className="text-primary" />
                                                {i === 0 ? "Under $2 Shipping" : "COPPA Secure"}
                                            </div>
                                            {i === 0 && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-xs font-black uppercase tracking-widest text-primary">
                                                    <Sparkles size={14} />
                                                    Hand-Stitched Seal
                                                </div>
                                            )}
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
