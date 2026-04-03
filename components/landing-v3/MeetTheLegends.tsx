'use client';

import { motion } from 'framer-motion';
import { Zap, Heart, Music, Shield, Sparkles } from 'lucide-react';

const CHARACTERS = [
    {
        name: 'Dilly Doubles',
        role: 'Joy Specialist',
        accent: '#A855F7',
        bgFrom: '#2E1065',
        bgTo: '#4C1D95',
        glowColor: '#7C3AED',
        personality: 'The rhythm master of the islands, bringing music and movement to every lesson.',
        teaches: 'Joy, Movement & Island Celebrations',
        icon: Music,
        image: '/games/images/dilly-doubles.jpg',
    },
    {
        name: 'R.O.T.I.',
        role: 'Learning Buddy',
        accent: '#FB923C',
        bgFrom: '#431407',
        bgTo: '#9A3412',
        glowColor: '#EA580C',
        personality: 'A friendly guide who makes learning island history fun and interactive.',
        teaches: 'Island History, Phonics & Math',
        icon: Zap,
        image: '/games/images/roti-new.jpg',
    },
    {
        name: 'Tanty Spice',
        role: 'Wisdom Guardian',
        accent: '#F472B6',
        bgFrom: '#4A044E',
        bgTo: '#831843',
        glowColor: '#DB2777',
        personality: 'Warm and caring, she shares the hidden wisdom of Caribbean traditions.',
        teaches: 'Cultural Stories, Folklore & Traditions',
        icon: Heart,
        image: '/games/images/tanty_spice_avatar.jpg',
    },
    {
        name: 'Mango Moko',
        role: 'Balance Protector',
        accent: '#4ADE80',
        bgFrom: '#052E16',
        bgTo: '#166534',
        glowColor: '#16A34A',
        personality: 'Watching over the islands, ensuring every child grows with confidence and pride.',
        teaches: 'Geography, Traditions & Life Balance',
        icon: Shield,
        image: '/games/images/mango_moko.png',
    },
];

interface MeetTheLegendsProps {
    onOpenWaitlist?: () => void;
}

export function MeetTheLegends({ onOpenWaitlist }: MeetTheLegendsProps) {
    return (
        <section
            className="py-24 relative overflow-hidden px-6"
            style={{ background: 'linear-gradient(180deg, #060D1F 0%, #0D1B35 50%, #060D1F 100%)' }}
        >
            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none" style={{ background: '#7C3AED' }} />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none" style={{ background: '#0EA5E9' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#FFBB00',
                        }}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        The Characters
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6"
                    >
                        Meet Your{' '}
                        <span
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(135deg, #FFBB00, #FF6B00)' }}
                        >
                            Legendary
                        </span>{' '}
                        Teachers
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-white/50 text-xl max-w-2xl mx-auto"
                    >
                        The Archipelago is full of friends who help your child explore their roots through stories, math, and music.
                    </motion.p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {CHARACTERS.map((char, index) => (
                        <motion.div
                            key={char.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10, transition: { duration: 0.25 } }}
                            className="group relative rounded-[28px] overflow-hidden"
                            style={{
                                background: `linear-gradient(160deg, ${char.bgFrom} 0%, ${char.bgTo} 100%)`,
                                border: `1px solid ${char.accent}25`,
                                boxShadow: `0 0 0 0 ${char.glowColor}00`,
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 48px ${char.glowColor}35`;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${char.glowColor}00`;
                            }}
                        >
                            {/* Image area */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={char.image}
                                    alt={char.name}
                                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Gradient overlay for text legibility */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: `linear-gradient(to bottom, transparent 30%, ${char.bgTo}EE 100%)`,
                                    }}
                                />

                                {/* Role badge — top right */}
                                <div className="absolute top-3 right-3 z-10">
                                    <span
                                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                                        style={{ background: char.accent }}
                                    >
                                        {char.role}
                                    </span>
                                </div>

                                {/* Icon — top left */}
                                <div className="absolute top-3 left-3 z-10">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
                                        style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${char.accent}50` }}
                                    >
                                        <char.icon className="w-4 h-4" style={{ color: char.accent }} />
                                    </div>
                                </div>
                            </div>

                            {/* Text content */}
                            <div className="p-5">
                                <h3 className="text-2xl font-black text-white mb-0.5 leading-tight">{char.name}</h3>
                                <p
                                    className="text-[10px] font-black uppercase tracking-widest mb-3"
                                    style={{ color: char.accent }}
                                >
                                    {char.teaches.split(',')[0]}
                                </p>
                                <p className="text-white/55 text-sm leading-relaxed mb-5 line-clamp-2">
                                    {char.personality}
                                </p>

                                <button
                                    onClick={() => (window.location.href = '/checkout')}
                                    className="w-full py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-200 text-white"
                                    style={{
                                        background: `${char.accent}25`,
                                        border: `1.5px solid ${char.accent}55`,
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = char.accent;
                                        (e.currentTarget as HTMLButtonElement).style.border = `1.5px solid ${char.accent}`;
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = `${char.accent}25`;
                                        (e.currentTarget as HTMLButtonElement).style.border = `1.5px solid ${char.accent}55`;
                                    }}
                                >
                                    Get $10 Intro Pass
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* More Characters Card — full width below */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="group rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-6 p-8"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '2px dashed rgba(255,255,255,0.12)',
                    }}
                >
                    <div className="flex items-center gap-5">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{ background: 'rgba(255,187,0,0.1)', border: '2px dashed rgba(255,187,0,0.3)' }}
                        >
                            ✨
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white mb-1">More Friends Coming!</h3>
                            <p className="text-white/40 text-sm">Our universe is growing with new characters from every island in the Caribbean.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => (window.location.href = '/contact')}
                        className="flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all"
                        style={{
                            background: 'rgba(255,187,0,0.1)',
                            border: '1px solid rgba(255,187,0,0.3)',
                            color: '#FFBB00',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,187,0,0.2)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,187,0,0.1)';
                        }}
                    >
                        Suggest a Character →
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
