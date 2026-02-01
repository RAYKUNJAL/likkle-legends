"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Music, Play, Palette,
    Target, Radio, Download, Sparkles,
    Cloud, Sun, Anchor, Fish
} from 'lucide-react';

interface MapLocation {
    id: string;
    title: string;
    icon: any;
    color: string;
    position: { left: string; top: string };
    label: string;
    description: string;
    islandColor: string;
}

interface IslandVillageMapProps {
    onNavigate: (section: string) => void;
}

export default function IslandVillageMap({ onNavigate }: IslandVillageMapProps) {
    const locations: MapLocation[] = [
        {
            id: 'stories',
            title: 'Story Island',
            icon: BookOpen,
            color: 'text-blue-600',
            islandColor: 'bg-[#a3e635]', // Lime green
            position: { left: '10%', top: '30%' },
            label: 'Story Island',
            description: 'Read & Listen'
        },
        {
            id: 'songs',
            title: 'Rhythm Reef',
            icon: Music,
            color: 'text-pink-600',
            islandColor: 'bg-[#f472b6]', // Pink
            position: { left: '30%', top: '15%' },
            label: 'Rhythm Reef',
            description: 'Songs & Dance'
        },
        {
            id: 'story-studio',
            title: 'Story Studio',
            icon: Sparkles,
            color: 'text-purple-600',
            islandColor: 'bg-[#d8b4fe]', // Purple
            position: { left: '60%', top: '20%' },
            label: 'Create Magic',
            description: 'Make Your Own Stories'
        },
        {
            id: 'lessons',
            title: 'Cinema Cay',
            icon: Play,
            color: 'text-indigo-600',
            islandColor: 'bg-[#818cf8]', // Indigo
            position: { left: '85%', top: '40%' },
            label: 'Cinema Cay',
            description: 'Watch & Learn'
        },
        {
            id: 'missions',
            title: 'Adventure Atoll',
            icon: Target,
            color: 'text-orange-600',
            islandColor: 'bg-[#fbbf24]', // Amber
            position: { left: '45%', top: '48%' },
            label: 'Adventure Atoll',
            description: 'Quests'
        },
        {
            id: 'games',
            title: 'Play Port',
            icon: Palette,
            color: 'text-emerald-600',
            islandColor: 'bg-[#34d399]', // Emerald
            position: { left: '20%', top: '70%' },
            label: 'Play Port',
            description: 'Games & Fun'
        },
        {
            id: 'printables',
            title: 'Craft Cove',
            icon: Download,
            color: 'text-amber-600',
            islandColor: 'bg-[#fb923c]', // Orange
            position: { left: '70%', top: '75%' },
            label: 'Craft Cove',
            description: 'Printables'
        },
        {
            id: 'radio',
            title: 'Tanty\'s Tower',
            icon: Radio,
            color: 'text-red-500',
            islandColor: 'bg-[#f87171]', // Red
            position: { left: '90%', top: '10%' },
            label: 'Broadcast',
            description: 'Live Radio'
        },
    ];

    return (
        <div className="relative w-full h-[600px] md:h-auto md:aspect-[16/9] bg-[#0ea5e9] overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white/20 group select-none">
            {/* Ocean Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400 via-sky-500 to-sky-600 opacity-100"></div>

            {/* Waves Animation */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>

            {/* Sky Elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ x: [0, 50, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-10 left-10 text-white/40"
                >
                    <Cloud size={80} />
                </motion.div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-5 right-20 text-yellow-300 drop-shadow-[0_0_20px_rgba(255,255,0,0.5)]"
                >
                    <Sun size={60} />
                </motion.div>
            </div>

            {/* Ocean Decor */}
            <motion.div
                animate={{ x: [-10, 10, -10], rotate: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-20 left-1/3 text-white/20"
            >
                <Fish size={30} />
            </motion.div>
            <motion.div
                animate={{ x: [10, -10, 10], rotate: [5, -5, 5] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute top-1/2 right-20 text-white/10"
            >
                <Fish size={40} />
            </motion.div>

            {/* Islands */}
            {locations.map((loc, index) => (
                <motion.button
                    key={loc.id}
                    onClick={() => onNavigate(loc.id)}
                    className="absolute z-10 flex flex-col items-center group/island focus:outline-none"
                    style={{ left: loc.position.left, top: loc.position.top }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Island Shape */}
                    <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full ${loc.islandColor} shadow-[0_10px_20px_rgba(0,0,0,0.2)] border-b-8 border-black/10 flex items-center justify-center transform overflow-hidden`}>
                        {/* Sand/Shore Texture */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-30 mix-blend-multiply"></div>

                        {/* Icon */}
                        <div className="relative bg-white/90 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover/island:rotate-6 transition-transform duration-300">
                            <loc.icon size={32} className={`md:w-8 md:h-8 ${loc.color}`} />
                        </div>

                        {/* Palm Tree Decor (Randomly placed on some islands or specific) */}
                        {index % 2 === 0 && (
                            <div className="absolute -bottom-1 -right-2 text-green-800/20 transform -rotate-12 scale-150 pointer-events-none">🌴</div>
                        )}
                    </div>

                    {/* Ripples under island */}
                    <div className="absolute -bottom-4 w-24 h-6 bg-black/20 rounded-full blur-lg -z-10 group-hover/island:scale-125 transition-transform duration-500"></div>

                    {/* Label Tag */}
                    <div className="mt-3 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border-2 border-white/50 transform group-hover/island:scale-110 transition-all">
                        <span className="block text-xs md:text-sm font-black text-slate-700 uppercase tracking-tight leading-none text-center">
                            {loc.label}
                        </span>
                    </div>
                </motion.button>
            ))}

            {/* Ship Decoration */}
            <motion.div
                className="absolute bottom-10 right-32 text-white/40"
                animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="relative">
                    <Anchor size={40} />
                    <div className="absolute -bottom-2 w-10 h-2 bg-black/20 blur-sm rounded-full"></div>
                </div>
            </motion.div>

        </div>
    );
}
