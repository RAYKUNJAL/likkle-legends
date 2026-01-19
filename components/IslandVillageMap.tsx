"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Music, Play, Palette,
    Target, Radio, Home, Camera, Sparkles,
    Cloud, Sun, Bird
} from 'lucide-react';
import Image from 'next/image';

interface MapLocation {
    id: string;
    title: string;
    icon: any;
    color: string;
    position: { x: string; y: string };
    href: string;
    label: string;
    animationDelay?: number;
}

interface IslandVillageMapProps {
    onNavigate: (section: string) => void;
}

export default function IslandVillageMap({ onNavigate }: IslandVillageMapProps) {
    const locations: MapLocation[] = [
        {
            id: 'stories',
            title: 'Story Library',
            icon: BookOpen,
            color: 'bg-blue-500',
            position: { x: '20%', y: '30%' },
            href: '/portal/stories',
            label: '📖 Library'
        },
        {
            id: 'radio',
            title: 'Tantys Radio',
            icon: Radio,
            color: 'bg-orange-500',
            position: { x: '70%', y: '25%' },
            href: '/portal/radio',
            label: '📻 Radio'
        },
        {
            id: 'lessons',
            title: 'Video Cinema',
            icon: Play,
            color: 'bg-purple-500',
            position: { x: '15%', y: '65%' },
            href: '/portal/lessons',
            label: '🎬 Cinema'
        },
        {
            id: 'games',
            title: 'The Arcade',
            icon: Palette,
            color: 'bg-green-500',
            position: { x: '50%', y: '50%' },
            href: '/portal/games',
            label: '🎮 Arcade'
        },
        {
            id: 'songs',
            title: 'Music Studio',
            icon: Music,
            color: 'bg-pink-500',
            position: { x: '80%', y: '70%' },
            href: '/portal/songs',
            label: '🎵 Music'
        },
        {
            id: 'missions',
            title: 'Mission Hub',
            icon: Target,
            color: 'bg-red-500',
            position: { x: '45%', y: '80%' },
            href: '/portal/missions',
            label: '🎯 Missions'
        },
    ];

    return (
        <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white/50 group">
            {/* Sky Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ x: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-10 left-10 text-white/40"
                >
                    <Cloud size={80} />
                </motion.div>
                <motion.div
                    animate={{ x: [0, -70, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 right-20 text-white/30"
                >
                    <Cloud size={100} />
                </motion.div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-10 right-1/3 text-yellow-300 drop-shadow-[0_0_20px_rgba(255,255,0,0.5)]"
                >
                    <Sun size={60} />
                </motion.div>
            </div>

            {/* Island Base (SVG or stylized CSS) */}
            <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-emerald-400 rounded-t-[100%] scale-x-125 transform translate-y-1/4 shadow-inner overflow-hidden">
                {/* Grass texture/patterns */}
                <div className="absolute inset-0 opacity-10 bg-[url('/images/grass-pattern.png')] bg-repeat"></div>

                {/* Ambient Island Elements */}
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-1/4 left-1/4 text-emerald-800/20"
                >
                    <Bird size={40} />
                </motion.div>

                {/* Village Paths (SVG) */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 1000 600">
                    <path
                        d="M 200 180 Q 500 300 800 150 Q 500 400 200 500 Q 500 450 800 550"
                        fill="none"
                        stroke="white"
                        strokeWidth="40"
                        strokeLinecap="round"
                        strokeDasharray="20 40"
                    />
                </svg>
            </div>

            {/* Locations */}
            {locations.map((loc) => (
                <motion.button
                    key={loc.id}
                    onClick={() => onNavigate(loc.id)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1, y: -10 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute z-20 flex flex-col items-center group/loc"
                    style={{ left: loc.position.x, top: loc.position.y }}
                >
                    {/* Shadow */}
                    <div className="absolute -bottom-2 w-12 h-4 bg-black/10 rounded-full blur-md group-hover/loc:scale-150 transition-transform"></div>

                    {/* Building/Icon Container */}
                    <div className={`relative w-20 h-20 md:w-28 md:h-28 rounded-3xl flex items-center justify-center text-white shadow-xl ${loc.color} border-4 border-white transition-all`}>
                        <loc.icon size={40} className="md:size-48" />

                        {/* Sparkles on hover */}
                        <div className="absolute -inset-4 opacity-0 group-hover/loc:opacity-100 transition-opacity">
                            <Sparkles className="absolute top-0 right-0 text-yellow-400 animate-pulse" size={20} />
                            <Sparkles className="absolute bottom-0 left-0 text-yellow-400 animate-pulse delay-75" size={16} />
                        </div>
                    </div>

                    {/* Label */}
                    <div className="mt-4 px-4 py-2 bg-white rounded-2xl shadow-lg border-2 border-gray-100 transform -rotate-1 group-hover/loc:rotate-0 transition-transform">
                        <span className="text-sm font-black text-gray-900 whitespace-nowrap uppercase tracking-tighter">
                            {loc.label}
                        </span>
                    </div>
                </motion.button>
            ))}

            {/* Decorative Elements (Trees) */}
            <div className="absolute bottom-20 left-10 text-emerald-600/30 select-none pointer-events-none">🌴</div>
            <div className="absolute bottom-40 right-10 text-emerald-600/30 select-none pointer-events-none text-4xl">🌴</div>
            <div className="absolute top-1/2 left-1/3 text-emerald-600/20 select-none pointer-events-none text-2xl">🐚</div>
            <div className="absolute bottom-1/4 right-1/4 text-emerald-600/20 select-none pointer-events-none text-3xl">🌴</div>

            {/* Ocean (Bottom overlay) */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-blue-400/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
            </div>
        </div>
    );
}
