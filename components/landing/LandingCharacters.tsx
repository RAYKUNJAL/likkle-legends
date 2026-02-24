'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { TANTY_CHARACTER, CHARACTERS } from '@/lib/constants';

// The full cast shown on the landing page (Tanty first, mystery omitted)
const ALL_CHARACTERS = [
    TANTY_CHARACTER,
    ...CHARACTERS.filter(c => !('isMystery' in c && (c as any).isMystery)),
];

const colorStyles: Record<number, { bg: string; badge: string }> = {
    0: { bg: 'from-orange-100 to-amber-50', badge: 'bg-orange-100 text-orange-700' },
    1: { bg: 'from-blue-100 to-cyan-50', badge: 'bg-blue-100 text-blue-700' },
    2: { bg: 'from-yellow-100 to-lime-50', badge: 'bg-yellow-100 text-yellow-700' },
    3: { bg: 'from-green-100 to-emerald-50', badge: 'bg-green-100 text-green-700' },
    4: { bg: 'from-red-100 to-pink-50', badge: 'bg-red-100 text-red-700' },
    5: { bg: 'from-blue-100 to-indigo-50', badge: 'bg-blue-100 text-blue-700' },
};

const parentValues: string[][] = [
    ['Builds emotional confidence', 'Creates a sense of calm and safety', 'Teaches Caribbean wisdom naturally'],
    ['Keeps kids focused on learning', 'Makes routines feel adventurous', 'Guides children independently'],
    ['Introduces food & culture joyfully', 'Builds social confidence', 'Sparks curiosity about the islands'],
    ['Teaches perspective and pride', 'Builds self-worth from the ground up', 'Encourages brave thinking'],
    ['Makes music and rhythm fun', 'Teaches through learning songs', 'Caribbean music appreciation'],
    ['Fuels adventurous confidence', 'Teaches kids to face challenges', 'Keeps energy positive and high'],
];

export default function LandingCharacters() {
    const [idx, setIdx] = useState(0);
    const active = ALL_CHARACTERS[idx];
    const style = colorStyles[idx] ?? colorStyles[0];
    const values = parentValues[idx] ?? [];

    const prev = () => setIdx(i => (i - 1 + ALL_CHARACTERS.length) % ALL_CHARACTERS.length);
    const next = () => setIdx(i => (i + 1) % ALL_CHARACTERS.length);

    return (
        <section id="characters" className="py-24 bg-[#FFFDF7] overflow-hidden border-y border-orange-50">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-14">
                    <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-5">
                        Your Child's Island Guides
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-deep leading-tight">
                        Meet the Legends
                    </h2>
                    <p className="mt-4 text-lg text-deep/50 font-medium max-w-xl mx-auto">
                        Each guide has a unique personality — they teach, inspire, and make every learning moment feel like an island adventure.
                    </p>
                </div>

                {/* Dot Navigation */}
                <div className="flex justify-center gap-2 mb-12">
                    {ALL_CHARACTERS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-orange-500' : 'w-2.5 bg-orange-200 hover:bg-orange-300'}`}
                        />
                    ))}
                </div>

                {/* Main Showcase */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 32 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -32 }}
                        transition={{ duration: 0.3 }}
                        className="grid md:grid-cols-2 gap-10 items-center"
                    >
                        {/* Character Image */}
                        <div className={`relative rounded-[3rem] overflow-hidden bg-gradient-to-br ${style.bg} aspect-square shadow-2xl`}>
                            <Image
                                src={active.image}
                                alt={active.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                onError={(e) => {
                                    // Fallback to roti image if character image missing
                                    (e.target as HTMLImageElement).src = '/images/roti-new.jpg';
                                }}
                            />
                        </div>

                        {/* Character Info */}
                        <div className="flex flex-col gap-5">
                            <span className={`self-start px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${style.badge}`}>
                                {active.role}
                            </span>
                            <h3 className="text-5xl font-black text-deep leading-tight">
                                {active.name}
                            </h3>
                            <p className="text-xl font-bold text-orange-500 italic">
                                {active.tagline}
                            </p>
                            <p className="text-deep/60 font-medium leading-relaxed">
                                {active.description}
                            </p>

                            {/* Parent Value Props */}
                            {values.length > 0 && (
                                <div className="space-y-2.5 pt-2">
                                    <p className="text-[10px] font-black text-deep/30 uppercase tracking-widest">
                                        Why parents love {active.name.split(' ')[0]}
                                    </p>
                                    {values.map((v, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                <span className="text-orange-500 text-[11px] font-black">✓</span>
                                            </div>
                                            <span className="text-deep/70 font-semibold text-sm">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Nav + CTA */}
                            <div className="flex gap-3 pt-3">
                                <button
                                    onClick={prev}
                                    className="w-12 h-12 rounded-2xl bg-white border border-orange-100 shadow flex items-center justify-center hover:bg-orange-50 transition-all"
                                >
                                    <ChevronLeft size={20} className="text-deep/50" />
                                </button>
                                <button
                                    onClick={next}
                                    className="w-12 h-12 rounded-2xl bg-white border border-orange-100 shadow flex items-center justify-center hover:bg-orange-50 transition-all"
                                >
                                    <ChevronRight size={20} className="text-deep/50" />
                                </button>
                                <Link
                                    href="/#pricing"
                                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black rounded-2xl py-3 text-sm transition-all group"
                                >
                                    Start Learning with {active.name.split(' ')[0]}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
