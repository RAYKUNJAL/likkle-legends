"use client";

import { motion } from "framer-motion";
import { Mic, Brain, Heart, Zap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

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
        <section className="py-48 bg-white relative overflow-hidden" id="features">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("/images/pattern.png")', backgroundSize: '600px' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-32 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-4 px-6 py-2 bg-secondary/5 text-secondary rounded-full text-xs font-black uppercase tracking-[0.4em]"
                    >
                        <Sparkles size={16} /> Heritage Handlers
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-[6.5rem] font-black text-deep tracking-tighter leading-[0.9] text-gradient"
                    >
                        {title}
                    </motion.h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-20 lg:gap-32">
                    {characters.map((char, i) => (
                        <motion.div
                            key={char.name}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative flex flex-col group pb-20"
                        >
                            {/* Decorative Background Layer */}
                            <div className="absolute top-10 right-10 -z-10 w-full h-full bg-zinc-50 rounded-[6rem] -rotate-2 group-hover:rotate-0 transition-transform duration-1000"></div>

                            {/* Image Container with Custom Clip Path or Radius */}
                            <div className="relative aspect-square md:aspect-[16/11] rounded-[5rem] overflow-hidden shadow-premium group-hover:shadow-premium-xl transition-all duration-700 bg-deep">
                                <img
                                    src={char.name === "Tanty Spice" ? "/images/tanty_spice_avatar.jpg" : "/images/roti-new.jpg"}
                                    alt={char.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-2000 opacity-90 group-hover:opacity-100"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-transparent transition-opacity group-hover:opacity-60"></div>

                                {/* Focus Badge */}
                                <div className="absolute top-12 left-12 flex -space-x-3">
                                    <div className="px-8 py-4 glass-morphism rounded-2xl shadow-xl font-black text-xs text-deep uppercase tracking-widest flex items-center gap-3 border-white/40">
                                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary' : 'bg-secondary'} animate-pulse`}></div>
                                        Primary Focus: {char.focus}
                                    </div>
                                </div>

                                <div className="absolute bottom-12 left-12 right-12">
                                    <h4 className={`font-black uppercase tracking-[0.3em] text-[10px] mb-3 ${i === 0 ? 'text-primary' : 'text-secondary'}`}>{char.title}</h4>
                                    <h3 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">{char.name}</h3>
                                </div>
                            </div>

                            {/* Content Layer - Floating over the image area slightly */}
                            <div className="px-12 pt-16 space-y-10 relative z-20">
                                <div className="space-y-6">
                                    <p className="text-3xl lg:text-4xl font-black text-deep italic leading-tight group-hover:text-primary transition-colors">
                                        "{char.hook}"
                                    </p>
                                    <p className="text-xl text-deep/60 leading-relaxed font-medium max-w-xl">
                                        {char.benefit_copy}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-zinc-100">
                                    <div className="space-y-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                            {i === 0 ? <Heart size={24} /> : <Brain size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-deep/30">Pedagogy</p>
                                            <p className="text-lg font-black text-deep leading-tight mt-1">{i === 0 ? 'Heritage Literacy' : 'Reading Confidence'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i === 0 ? 'bg-primary-gradient text-white' : 'bg-secondary-gradient text-white'} shadow-lg`}>
                                            {i === 0 ? <Mic size={24} /> : <Zap size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-deep/30">Magic Tech</p>
                                            <p className="text-lg font-black text-deep leading-tight mt-1">{i === 0 ? 'Patois Voice AI' : 'Smart Reading Buddy'}</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="group/btn w-full mt-4 flex items-center justify-between p-2 pl-12 bg-zinc-50 border border-zinc-100 rounded-[3rem] transition-all hover:bg-deep group-hover:border-transparent">
                                    <span className="font-black text-deep tracking-widest uppercase text-xs group-hover/btn:text-white transition-colors">Start Session with {char.name}</span>
                                    <div className="w-20 h-20 bg-primary rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover/btn:rotate-12 transition-all">
                                        <ArrowRight size={32} />
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Secondary Feature Row: Island Magic Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-40 grid md:grid-cols-3 gap-12 p-16 bg-deep-gradient rounded-[5rem] overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10 mix-blend-overlay"></div>

                    <div className="relative z-10 space-y-4 text-center">
                        <p className="text-5xl font-black text-white leading-none tracking-tighter">100%</p>
                        <p className="text-sm font-bold text-white/40 uppercase tracking-[0.2em]">Ad-Free Arena</p>
                    </div>
                    <div className="relative z-10 space-y-4 text-center border-x border-white/10">
                        <p className="text-5xl font-black text-primary leading-none tracking-tighter">2k+</p>
                        <p className="text-sm font-bold text-white/40 uppercase tracking-[0.2em]">Active Heroes</p>
                    </div>
                    <div className="relative z-10 space-y-4 text-center">
                        <p className="text-5xl font-black text-white leading-none tracking-tighter">15+</p>
                        <p className="text-sm font-bold text-white/40 uppercase tracking-[0.2em]">Island Adventures</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
