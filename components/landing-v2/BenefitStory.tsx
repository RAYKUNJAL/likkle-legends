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
        <section className="py-48 bg-white relative overflow-hidden" id="about">
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px] -mr-96 -mt-48 opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-24 lg:gap-40">
                    {/* Visual Composite */}
                    <div className="flex-1 w-full order-2 lg:order-1 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative"
                        >
                            {/* Main Lifestyle Shot */}
                            <div className="relative rounded-[6rem] overflow-hidden shadow-premium-xl border-[16px] border-white bg-zinc-50 aspect-[4/5] lg:aspect-[3/4]">
                                <img
                                    src="/images/mailing-club-lifestyle.jpg"
                                    alt="Legend Envelope Physical Experience"
                                    className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent to-transparent"></div>

                                {/* Inner Floating Card */}
                                <div className="absolute bottom-12 left-12 right-12 p-10 glass-morphism rounded-[3rem] border-white/40 shadow-2xl">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-16 h-16 bg-primary-gradient rounded-2xl flex items-center justify-center text-white shadow-xl">
                                            <Mail size={32} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-deep leading-none tracking-tight italic">Genuine Mail</p>
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-primary mt-2">Personalized Arrival</p>
                                        </div>
                                    </div>
                                    <p className="text-deep/60 text-lg font-medium leading-relaxed">
                                        Every letter is addressed by name, continuing their specific island adventure across the globe.
                                    </p>
                                </div>
                            </div>

                            {/* Floating "Sticker" Asset */}
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-400 rounded-full shadow-gold border-[8px] border-white flex flex-col items-center justify-center text-center p-4 rotate-12"
                            >
                                <Sparkles className="text-deep mb-2" size={32} />
                                <p className="text-base font-black uppercase tracking-[0.1em] text-deep leading-tight">Physical <br />Collector Items</p>
                            </motion.div>
                        </motion.div>

                        {/* Background Parallax Shadow element */}
                        <div className="absolute -inset-10 bg-secondary/5 -z-20 rounded-[8rem] blur-3xl"></div>
                    </div>

                    {/* Content Block: Magazine Editorial */}
                    <div className="flex-1 space-y-20 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            <h2 className="text-6xl md:text-7xl lg:text-[7rem] font-black text-deep leading-[0.85] tracking-tighter">
                                {title}
                            </h2>
                        </motion.div>

                        <div className="space-y-20">
                            {content.map((block, i) => (
                                <motion.div
                                    key={block.header}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2, duration: 0.8 }}
                                    className="flex gap-12 group"
                                >
                                    <div className="flex-shrink-0 w-28 h-28 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center text-deep group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm border border-zinc-100">
                                        {i === 0 ? <Anchor size={44} strokeWidth={2.5} /> : <ShieldCheck size={44} strokeWidth={2.5} />}
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-4xl font-black text-deep tracking-tighter leading-none group-hover:text-primary transition-colors">{block.header}</h3>
                                        <p className="text-2xl text-deep/50 leading-relaxed font-medium max-w-xl">
                                            {block.body}
                                        </p>
                                        <div className="flex items-center gap-6 pt-4">
                                            <div className="flex items-center gap-2 px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-full text-base font-black uppercase tracking-widest text-deep/40 shadow-sm">
                                                <CheckCircle2 size={16} className="text-primary" />
                                                Verified Delivery
                                            </div>
                                            <div className="hidden sm:flex items-center gap-2 px-6 py-3 bg-secondary/5 border border-secondary/10 rounded-full text-base font-black uppercase tracking-widest text-secondary shadow-sm">
                                                <MapPin size={16} />
                                                Universal Mail Access
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
                            className="p-12 border-l-8 border-primary bg-primary/5 rounded-r-[3rem] italic"
                        >
                            <p className="text-2xl font-bold text-deep/80 leading-relaxed">
                                "The magic isn't in what's in the box, it's what's in the message. We focus on the legacy, one letter at a time."
                            </p>
                            <p className="mt-4 text-base font-black uppercase tracking-widest text-primary">Likkle Legends Philosophy</p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave Transition */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-50 to-transparent"></div>
        </section>
    );
};
