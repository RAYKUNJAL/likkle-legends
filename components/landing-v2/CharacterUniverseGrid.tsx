"use client";

import { motion } from "framer-motion";
import { Bot, Radio, Music, Map, ArrowRight, Sparkles, Gamepad2, Leaf, Mic2, Play, Volume2 } from "lucide-react";
import { narrateText, kickstartMobileAudio } from "@/services/geminiService";
import { useState } from "react";
import Image from "next/image";

const characters = [
    {
        name: "Dilly Doubles",
        role: "Universe Mascot",
        copy: "The fun captain of the whole world—turns learning into a game kids actually want to play.",
        image: "/images/dilly-doubles.jpg",
        color: "#FFBB00",
        icon: Gamepad2,
        stats: ["Fun", "Games", "Mascot"],
    },
    {
        name: "R.O.T.I.",
        role: "Reading + Math Guide",
        copy: "Guides phonics, math, and practice routines with friendly step-by-step learning inside the portal.",
        image: "/images/roti-new.jpg",
        color: "#2D5A27",
        icon: Bot,
        stats: ["Math", "Phonics", "Reading"],
    },
    {
        name: "Tanty Spice",
        role: "Culture + Stories Anchor",
        copy: "Keeps the proverbs, the warmth, and the island wisdom alive—plus Tanty Radio for family vibes.",
        image: "/images/tanty_spice_avatar.jpg",
        color: "#FF6B00",
        icon: Radio,
        stats: ["Stories", "Proverbs", "Radio"],
    },
    {
        name: "Steelpan Sam",
        role: "Music + Creative Director",
        copy: "Brings rhythm, coloring, and creative activities to life—kids create their own Carnival world.",
        image: "/images/steelpan_sam.png",
        color: "#FF3FB4",
        icon: Music,
        stats: ["Coloring", "Crafts", "Music"],
    },
    {
        name: "Mango Moko",
        role: "Explorer of Islands",
        copy: "Leads geography, folklore, and adventures—turning heritage into stories and missions.",
        image: "/images/mango_moko.png",
        color: "#E85D04",
        icon: Map,
        stats: ["Maps", "Folklore", "History"],
    },
    {
        name: "Benny Shadowbenny",
        role: "Flavor + Mystery Guide",
        copy: "Named after the real Caribbean herb—Benny helps kids find ingredients, facts, and hidden island treasures.",
        image: "/images/benny-of-shadows.jpg",
        color: "#386641",
        icon: Leaf,
        stats: ["Recipes", "Facts", "Treasure"],
    },
    {
        name: "Scorcha Pepper",
        role: "Spicy Adventurer",
        copy: "The brave scout of the islands—Scorcha helps kids face challenges with confidence and a little extra heat!",
        image: "/images/scorcha_pepper.jpg",
        color: "#E63946",
        icon: Mic2,
        stats: ["Brave", "Scout", "Energy"],
    },
];

export const CharacterUniverseGrid = () => {
    const [isNarrating, setIsNarrating] = useState(false);

    const handleTantyVoice = async () => {
        if (isNarrating) return;
        setIsNarrating(true);
        try {
            await kickstartMobileAudio();
            const phrases = [
                "Bless up, me darlin'! Ready for an adventure?",
                "Come, sit down, leh me tell yuh a story.",
                "The islands are callin' yuh name!",
                "You are a true Likkle Legend, y'know?"
            ];
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            const buffer = await narrateText(phrase);
            if (buffer) {
                const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContextClass();
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
                source.onended = () => setIsNarrating(false);
            } else {
                setIsNarrating(false);
            }
        } catch (e) {
            console.error("Narration failed:", e);
            setIsNarrating(false);
        }
    };
    return (
        <section className="py-20 sm:py-32 lg:py-48 bg-white relative overflow-hidden" id="characters">
            {/* Background Dot Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#023047 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 lg:mb-32 space-y-4 sm:space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-deep/5 rounded-full"
                    >
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-deep/40">The Hero Cast</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-5xl lg:text-7xl xl:text-[5.5rem] font-black text-deep tracking-tighter leading-tight sm:leading-[0.95]"
                    >
                        Meet the Legends<br />Who <span className="text-gradient italic">Lead</span> the Way
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-base sm:text-lg text-deep/40 font-medium max-w-lg mx-auto"
                    >
                        A core cast kids bond with—so learning becomes a habit.
                    </motion.p>
                </div>

                {/* 3x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {characters.map((char, i) => (
                        <motion.div
                            key={char.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="group relative bg-zinc-50 rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-zinc-100 hover:border-transparent hover:shadow-premium transition-all duration-700"
                        >
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden flex items-end justify-center pt-8" style={{ backgroundColor: char.color + '05' }}>
                                <div className="absolute inset-0 z-10">
                                    <Image
                                        src={char.image}
                                        alt={char.name}
                                        fill
                                        className="object-contain object-bottom group-hover:scale-105 transition-transform duration-1000"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                                {/* Background Decorative Circle */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20"
                                    style={{ backgroundColor: char.color }}></div>
                                {/* Overlay removed to fix visibility issue */}

                                {/* Role Badge */}
                                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm rounded-md sm:rounded-lg shadow-sm z-20">
                                    <char.icon size={10} style={{ color: char.color }} />
                                    <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-[0.1em] text-deep/50">{char.role}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3 sm:p-6 lg:p-7 space-y-1.5 sm:space-y-3 relative z-20 bg-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base sm:text-2xl font-black text-deep tracking-tighter leading-none">{char.name}</h3>
                                    {char.name === "Tanty Spice" && (
                                        <button
                                            onClick={handleTantyVoice}
                                            disabled={isNarrating}
                                            className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all active:scale-90 disabled:opacity-50"
                                            title="Hear Tanty Speak!"
                                        >
                                            <Volume2 size={16} className={isNarrating ? "animate-pulse" : ""} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] sm:text-sm text-deep/45 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">{char.copy}</p>

                                {/* Stat Pills */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {char.stats.map(stat => (
                                        <span
                                            key={stat}
                                            className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border"
                                            style={{ borderColor: char.color + '25', color: char.color, backgroundColor: char.color + '08' }}
                                        >
                                            {stat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 sm:mt-20 lg:mt-28 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
                >
                    {[
                        { value: "100%", label: "Ad-Free" },
                        { value: "30+", label: "Islands" },
                        { value: "7", label: "Characters" },
                        { value: "∞", label: "Adventures" },
                    ].map(stat => (
                        <div key={stat.label} className="text-center p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <p className="text-2xl font-black text-deep tracking-tighter">{stat.value}</p>
                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-deep/25 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
