"use client";

import { motion } from "framer-motion";
import { Bot, Radio, Music, Map, Leaf, Gamepad2, BookOpen, Calculator, Mic, Palette, CookingPot, Scissors, Headphones, BookOpenText, Baby, Sparkles, ArrowRight, Compass, BookMarked, Globe, Cherry, Lightbulb, Drum } from "lucide-react";
import TantyRadio from "@/components/TantyRadio";
import Image from "next/image";

const categories = [
    {
        name: "The Scholar Suite",
        lead: "R.O.T.I.",
        leadImage: "/images/roti-new.jpg",
        color: "#2D5A27",
        icon: Bot,
        features: [
            { name: "Phonics", icon: Mic, desc: "Voice-friendly reading practice with R.O.T.I." },
            { name: "Letters", icon: BookOpen, desc: "Handwriting, tracing, and letter recognition" },
            { name: "Math Workbooks", icon: Calculator, desc: "Interactive math games & printable worksheets" },
            { name: "Flashcards", icon: BookMarked, desc: "Caribbean-themed vocabulary & sight words" },
        ]
    },
    {
        name: "Tanty Radio",
        lead: "Tanty Spice",
        leadImage: "/images/tanty_spice_avatar.jpg",
        color: "#FF6B00",
        icon: Radio,
        features: [
            { name: "Island Rhythms", icon: Headphones, desc: "Always-on Caribbean music, safe & ad-free" },
            { name: "Ad-Free Stories", icon: BookOpenText, desc: "Tanty narrates original bedtime stories" },
            { name: "Nursery Rhymes", icon: Baby, desc: "Traditional & original Caribbean nursery rhymes" },
        ]
    },
    {
        name: "The Creative Carnival",
        lead: "Dilly Doubles & Steelpan Sam",
        leadImage: "/images/steelpan_sam.png",
        color: "#FF3FB4",
        icon: Music,
        features: [
            { name: "Coloring Books", icon: Palette, desc: "Digital & printable coloring with island themes" },
            { name: "Arts & Crafts", icon: Scissors, desc: "Paper crafts, mask-making & carnival projects" },
            { name: "Step-by-Step Drawing", icon: Sparkles, desc: "Guided drawing lessons for young artists" },
            { name: "Rhythm & Music", icon: Drum, desc: "Beat games and simple instruments" },
        ]
    },
    {
        name: "Adventure Alley",
        lead: "Mango Moko, Benny & Scorcha",
        leadImage: "/images/mango_moko.png",
        color: "#E85D04",
        icon: Compass,
        features: [
            { name: "Folklore Stories", icon: BookOpenText, desc: "Caribbean legends and tales brought to life" },
            { name: "Game Portal", icon: Gamepad2, desc: "Learning games tied to island adventures" },
            { name: "Island Geography", icon: Globe, desc: "Maps, flags, and facts about each island" },
            { name: "Mini Storybooks", icon: BookMarked, desc: "Short illustrated stories for independent reading" },
        ]
    },
    {
        name: "Heritage Kitchen",
        lead: "Tanty Spice & Benny",
        leadImage: "/images/benny-of-shadows.jpg",
        color: "#386641",
        icon: Leaf,
        features: [
            { name: "Kid-Friendly Recipes", icon: CookingPot, desc: "Step-by-step Caribbean cooking for kids" },
            { name: "Ingredient Fun Facts", icon: Cherry, desc: "Learn about Caribbean spices, fruits & herbs" },
            { name: "Culture Bites", icon: Lightbulb, desc: "Food traditions and their island origins" },
        ]
    },
];

export const FeatureMatrix = () => {
    return (
        <section className="py-20 sm:py-32 lg:py-48 bg-deep relative overflow-hidden" id="features">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px] -mr-[400px] -mt-[400px]"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[200px] -ml-[300px] -mb-[300px]"></div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 lg:mb-28 space-y-4 sm:space-y-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/10"
                    >
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Full Portal Reveal</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl lg:text-7xl font-black text-white tracking-tighter leading-tight sm:leading-[0.95]"
                    >
                        A Complete Learning System<br /><span className="text-gradient italic">in One Portal</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-base sm:text-lg text-white/30 font-medium"
                    >
                        Five zones. Clear routines. Culture built in.
                    </motion.p>
                </div>

                {/* Category Cards */}
                <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-6xl mx-auto">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white/[0.04] backdrop-blur-sm rounded-2xl sm:rounded-[2.5rem] border border-white/[0.06] p-4 sm:p-6 lg:p-10 hover:bg-white/[0.06] transition-all duration-500"
                        >
                            {/* Category Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10 flex-shrink-0 relative">
                                    <Image src={cat.leadImage} alt={cat.lead} fill className="object-cover" sizes="56px" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-none">{cat.name}</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: cat.color }}>
                                        Led by {cat.lead}
                                    </p>
                                </div>
                            </div>

                            {/* Embed Interactive Elements for specific zones */}
                            {cat.name === "Tanty Radio" && (
                                <div className="mt-8 mb-4 max-w-2xl mx-auto bg-white/5 rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live: Radio Preview</span>
                                    </div>
                                    <TantyRadio isLite={true} />
                                </div>
                            )}

                            {/* Feature Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                {cat.features.map(feat => (
                                    <div
                                        key={feat.name}
                                        className="bg-white/[0.04] rounded-xl p-3 sm:p-5 border border-white/[0.06] hover:border-white/10 transition-all"
                                    >
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3"
                                            style={{ backgroundColor: cat.color + '20' }}>
                                            <feat.icon size={18} style={{ color: cat.color }} />
                                        </div>
                                        <h4 className="font-black text-white text-xs sm:text-sm mb-1 sm:mb-1.5 tracking-tight">{feat.name}</h4>
                                        <p className="text-[10px] sm:text-xs text-white/25 leading-relaxed font-medium">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <button className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Unlock Full Portal for $10
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
