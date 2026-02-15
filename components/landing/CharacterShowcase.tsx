'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Rocket } from 'lucide-react';

import { siteContent } from '@/lib/content';
import Image from 'next/image';

const FEATURED = siteContent.characters.characters.map((char, idx) => {
    const colors = [
        { main: 'bg-emerald-500', light: 'bg-emerald-50', icon: Rocket },
        { main: 'bg-amber-500', light: 'bg-amber-50', icon: Heart },
        { main: 'bg-blue-500', light: 'bg-blue-50', icon: Sparkles },
        { main: 'bg-cyan-500', light: 'bg-cyan-50', icon: Rocket },
        { main: 'bg-purple-500', light: 'bg-purple-50', icon: Heart },
        { main: 'bg-rose-500', light: 'bg-rose-50', icon: Sparkles },
    ];
    const color = colors[idx % colors.length];
    return {
        ...char,
        benefit: char.description,
        icon: color.icon,
        color: color.main,
        lightColor: color.light
    };
});

export default function CharacterShowcase() {
    return (
        <section id="characters" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-20 max-w-3xl mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-deep"
                    >
                        Meet the Island Crew
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-lg text-deep/60"
                    >
                        Your child learns with friendly guides across the Likkle Legends universe.
                    </motion.p>
                </div>

                {/* All Characters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {FEATURED.map((char: any, idx) => (
                        <motion.div
                            key={char.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col items-center text-center group bg-zinc-50/50 p-8 rounded-[3rem] border border-transparent hover:border-zinc-100 hover:bg-white hover:shadow-xl transition-all duration-500"
                        >
                            <div className={`w-48 h-48 ${char.lightColor} rounded-[2rem] flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform overflow-hidden shadow-xl border-4 border-white`}>
                                <div className={`absolute inset-0 ${char.color} opacity-10`} />

                                <Image
                                    src={char.image}
                                    alt={char.name}
                                    fill
                                    className="object-cover"
                                />

                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-lg border border-zinc-100 font-black text-deep text-xs whitespace-nowrap mb-2">
                                    {char.name}
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-deep mb-2">{char.role}</h3>
                            <p className="text-deep/60 text-sm font-medium leading-relaxed">{char.benefit}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

