
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Radio, Music, Sparkles } from 'lucide-react';
import Image from 'next/image';

// Branding / High-End Design System
const COLORS = {
    primary: '#FB8500', // Island Orange
    secondary: '#FFB703', // Sun Gold
    accent: '#023047', // Deep Navy
    sky: '#8ECAE6', // Caribbean Blue
    pink: '#FF4D6D', // Hibiscus Pink
};

const MOCK_PLAYLIST = [
    {
        id: '1',
        title: 'Yellow Bird Chant',
        artist: 'Tanty Spice',
        audio_url: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-twinkle-sound-2900.mp3', // Placeholder
        thumbnail_url: '/images/tanty_spice_avatar.jpg'
    },
    {
        id: '2',
        title: 'Anansi Beats',
        artist: 'Steelpan Sam',
        audio_url: 'https://assets.mixkit.co/sfx/preview/mixkit-game-level-completed-2059.mp3',
        thumbnail_url: '/images/steelpan_sam.png'
    },
    {
        id: '3',
        title: 'Island Lullaby',
        artist: 'Mango Moko',
        audio_url: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3',
        thumbnail_url: '/images/mango_moko.png'
    }
];

export default function TantySpiceRadio() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const currentTrack = MOCK_PLAYLIST[currentTrackIndex];

    // Handle Progress
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                if (audioRef.current) {
                    const duration = audioRef.current.duration || 100;
                    const currentTime = audioRef.current.currentTime;
                    setProgress((currentTime / duration) * 100);
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % MOCK_PLAYLIST.length);
        setIsPlaying(true);
        // Small delay to ensure state update before play
        setTimeout(() => audioRef.current?.play(), 100);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + MOCK_PLAYLIST.length) % MOCK_PLAYLIST.length);
        setIsPlaying(true);
        setTimeout(() => audioRef.current?.play(), 100);
    };

    return (
        <section className="py-24 relative overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[120px] -mr-64 -mt-32 opacity-60" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -ml-64 -mb-32 opacity-60" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-black uppercase tracking-wider mb-6">
                                <Radio size={16} className="animate-pulse" />
                                Live from the Island
                            </span>
                            <h2 className="text-5xl lg:text-7xl font-black text-orange-950 leading-[0.9] mb-8">
                                Tanty Spice <br />
                                <span className="text-orange-500 italic">Radio Station</span>
                            </h2>
                            <p className="text-xl text-orange-900/60 font-medium max-w-xl mb-10">
                                Turn up de rhythm! A safe, ad-free listening space where kids explore Caribbean culture through nursery rhymes, island stories, and joyful beats.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <div className="flex items-center gap-3 bg-white border border-orange-100 px-5 py-3 rounded-2xl shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                        <Volume2 size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-orange-400 uppercase tracking-widest">Safe Audio</p>
                                        <p className="font-bold text-orange-950">100% Ad-Free</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-orange-100 px-5 py-3 rounded-2xl shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <Music size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Community</p>
                                        <p className="font-bold text-orange-950">Island Nursery Rhymes</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Radio Player Side */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative w-full max-w-md"
                        >
                            {/* The "Boombox" Container */}
                            <div className="relative bg-[#1A1A1A] rounded-[4rem] p-8 shadow-2xl border-[12px] border-orange-50 overflow-hidden">

                                {/* Mesh Background Effect */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-40 pointer-events-none" />

                                {/* Screen Overlay */}
                                <div className="relative bg-black/40 backdrop-blur-md rounded-[3rem] p-8 mb-8 border border-white/10 overflow-hidden">

                                    {/* Animated Sound Wave (Static if not playing) */}
                                    <div className="flex items-end justify-center gap-1 h-12 mb-6">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={isPlaying ? { height: [8, 32, 12, 40, 16] } : { height: 4 }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 0.5 + Math.random(),
                                                    delay: i * 0.05
                                                }}
                                                className="w-1 bg-orange-500 rounded-full"
                                            />
                                        ))}
                                    </div>

                                    {/* Song Info */}
                                    <div className="text-center">
                                        <h4 className="text-2xl font-black text-white mb-1 truncate px-4">
                                            {currentTrack.title}
                                        </h4>
                                        <p className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-6">
                                            {currentTrack.artist}
                                        </p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-orange-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                        <span>Live</span>
                                        <span>On Air</span>
                                    </div>
                                </div>

                                {/* Main Controls */}
                                <div className="flex items-center justify-center gap-10">
                                    <button
                                        onClick={prevTrack}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <SkipBack size={32} />
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(251,133,0,0.4)] active:scale-95 transition-all group"
                                    >
                                        {isPlaying ? (
                                            <Pause size={40} fill="currentColor" />
                                        ) : (
                                            <Play size={40} fill="currentColor" className="ml-2" />
                                        )}
                                        {/* Outer Ring Animation */}
                                        <div className={`absolute w-28 h-28 border-2 border-orange-500 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 ${isPlaying ? 'animate-ping' : ''}`} />
                                    </button>

                                    <button
                                        onClick={nextTrack}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <SkipForward size={32} />
                                    </button>
                                </div>

                                {/* Floating Tanty Spice Character */}
                                <div
                                    className="absolute -bottom-4 -right-4 w-32 h-32 transform rotate-12 transition-transform hover:rotate-0"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                                        <Image
                                            src="/images/tanty_spice_avatar.jpg"
                                            alt="Tanty Spice"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-orange-500/20 mix-blend-overlay" />
                                    </div>

                                    {/* Speak Bubble */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: -40 }}
                                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                                className="absolute top-0 right-full mr-4 bg-white text-orange-950 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap shadow-xl"
                                            >
                                                "Oye! Feel de rhythm, darlin'!"
                                                <div className="absolute top-full right-4 w-2 h-2 bg-white rotate-45 -translate-y-1" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Decorative Audio Jacks */}
                            <div className="flex justify-between px-16 -mt-4">
                                <div className="w-12 h-6 bg-orange-100 rounded-b-xl shadow-inner" />
                                <div className="w-12 h-6 bg-orange-100 rounded-b-xl shadow-inner" />
                            </div>

                            <audio
                                ref={audioRef}
                                src={currentTrack.audio_url}
                                onEnded={nextTrack}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

