"use client";

import { motion } from "framer-motion";
import { Mail, ShieldCheck, MapPin, CheckCircle2, Sparkles, Anchor } from "lucide-react";

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
        <section className="py-24 sm:py-32 lg:py-40 bg-white relative overflow-hidden" id="about">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Visual Composite */}
                    <div className="flex-1 w-full order-2 lg:order-1 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            {/* Main Lifestyle Shot */}
                            <div className="relative rounded-[3rem] sm:rounded-[5rem] overflow-hidden shadow-2xl border-[10px] sm:border-[16px] border-white bg-zinc-50 aspect-[4/5]">
                                <img
                                    src="/images/mailing-club-lifestyle.jpg"
                                    alt="Family enjoying Likkle Legends"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent"></div>

                                {/* Inner Floating Card - Simplified */}
                                <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-[2rem] border border-white shadow-xl">
                                    <div className="flex items-center gap-4 mb-2">
                                        <Mail className="text-primary" size={24} />
                                        <p className="text-xl font-black text-deep leading-none tracking-tight">Authentic Connection</p>
                                    </div>
                                    <p className="text-deep/60 text-sm sm:text-base font-medium leading-relaxed">
                                        Personalized mail that brings a smile to your child's face.
                                    </p>
                                </div>
                            </div>

                            {/* Floating Badge - Scaled and Positioned correctly */}
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-[var(--caribbean-sun)] rounded-full shadow-lg border-[6px] sm:border-[8px] border-white flex items-center justify-center text-center p-2 rotate-12 z-20"
                            >
                                <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-deep leading-tight">Physical <br />Collector <br />Items</p>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Content Block */}
                    <div className="flex-1 space-y-12 lg:space-y-16 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-deep leading-[1.1] tracking-tighter">
                                {title}
                            </h2>
                        </motion.div>

                        <div className="space-y-12 lg:space-y-16">
                            {content.map((block, i) => (
                                <motion.div
                                    key={block.header}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2, duration: 0.8 }}
                                    className="flex gap-6 sm:gap-10 group"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 bg-zinc-50 rounded-3xl flex items-center justify-center text-deep group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-zinc-100">
                                        {i === 0 ? <Anchor size={32} strokeWidth={2.5} /> : <ShieldCheck size={32} strokeWidth={2.5} />}
                                    </div>
                                    <div className="space-y-4 sm:space-y-6">
                                        <h3 className="text-2xl sm:text-4xl font-black text-deep tracking-tighter leading-none">{block.header}</h3>
                                        <p className="text-base sm:text-xl text-deep/60 leading-relaxed font-medium max-w-xl">
                                            {block.body}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 pt-2">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-deep/40 shadow-sm">
                                                <CheckCircle2 size={14} className="text-primary" />
                                                Verified Delivery
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/5 border border-secondary/10 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-secondary shadow-sm">
                                                <MapPin size={14} />
                                                Universal Mail
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Editorial Quote */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="p-8 sm:p-10 border-l-[6px] sm:border-l-[8px] border-primary bg-primary/5 rounded-r-3xl italic"
                        >
                            <p className="text-lg sm:text-xl font-bold text-deep/80 leading-relaxed">
                                "We don't just deliver mail, we deliver legacy. Every letter is a heartbeat from the islands."
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
