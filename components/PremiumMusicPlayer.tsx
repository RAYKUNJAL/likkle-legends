"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    X, Play, Pause, SkipBack, SkipForward,
    Volume2, Heart, Music, Disc, Sparkles, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface PremiumMusicPlayerProps {
    song: {
        id: string;
        title: string;
        artist: string;
        audio_url?: string;
        thumbnail_url?: string;
        xp_reward?: number;
    };
    onClose: () => void;
    onComplete: (xp: number) => void;
}

export default function PremiumMusicPlayer({ song, onClose, onComplete }: PremiumMusicPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(p);

            // Auto complete at 95%
            if (p > 95 && !isCompleted) {
                handleComplete();
            }
        }
    };

    const handleComplete = () => {
        setIsCompleted(true);
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
        });
        setTimeout(() => {
            onComplete(song.xp_reward || 25);
        }, 3000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] bg-blue-950/40 backdrop-blur-xl flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="w-full max-w-xl bg-white rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white/50 relative"
                >
                    {/* Background visualizer aesthetic */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.1, 0.3, 0.1],
                                    x: [0, 50, 0]
                                }}
                                transition={{ duration: 5 + i, repeat: Infinity }}
                                className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-[100px]"
                                style={{
                                    left: `${i * 25}%`,
                                    top: `${i * 10}%`
                                }}
                            />
                        ))}
                    </div>

                    {/* Top Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
                        title="Close"
                        aria-label="Close Music Player"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative z-10 p-12 flex flex-col items-center">
                        {/* Artwork with disc animation */}
                        <div className="relative group">
                            <motion.div
                                animate={isPlaying ? { rotate: 360 } : {}}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-64 h-64 bg-gradient-to-br from-gray-900 to-black rounded-full p-1 shadow-2xl relative"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 rounded-full"></div>
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20">
                                    <Image
                                        src={song.thumbnail_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"}
                                        alt={song.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {/* Spindle */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-100">
                                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                                </div>
                            </motion.div>

                            {/* Floating icons */}
                            <motion.div
                                animate={isPlaying ? { y: [0, -20, 0], opacity: [0, 1, 0] } : { opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-4 -right-4 text-primary"
                            >
                                <Music size={32} />
                            </motion.div>
                        </div>

                        {/* Song Info */}
                        <div className="mt-12 text-center">
                            <h2 className="text-4xl font-black text-blue-900 tracking-tighter mb-2">{song.title}</h2>
                            <p className="text-xl text-blue-700/60 font-bold uppercase tracking-widest text-sm">{song.artist}</p>
                        </div>

                        {/* Audio Engine */}
                        <audio
                            ref={audioRef}
                            src={song.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleComplete}
                        />

                        {/* Progress */}
                        <div className="w-full mt-12 space-y-4">
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative border-2 border-gray-50">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-primary rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30 backdrop-blur-sm"></div>
                            </div>
                            <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                                <span>Island Beats</span>
                                <div className="flex items-center gap-1 text-primary">
                                    <Sparkles size={12} />
                                    <span>+{song.xp_reward || 25} XP</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-12 flex items-center justify-center gap-10">
                            <button
                                className="text-slate-300 hover:text-primary transition-colors"
                                title="Previous Track"
                                aria-label="Skip to previous track"
                            >
                                <SkipBack size={32} />
                            </button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={togglePlay}
                                className="w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-2xl"
                                title={isPlaying ? "Pause" : "Play"}
                                aria-label={isPlaying ? "Pause Music" : "Play Music"}
                            >
                                {isPlaying ? <Pause size={48} /> : <Play size={48} className="ml-2" />}
                            </motion.button>

                            <button
                                className="text-slate-300 hover:text-primary transition-colors"
                                title="Next Track"
                                aria-label="Skip to next track"
                            >
                                <SkipForward size={32} />
                            </button>
                        </div>
                    </div>

                    {/* Completion HUD */}
                    {isCompleted && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-8 shadow-xl animate-bounce">
                                <Trophy size={48} className="text-white" />
                            </div>
                            <h3 className="text-4xl font-black text-blue-900 mb-2">MUSIC MASTER!</h3>
                            <p className="text-blue-700/60 font-bold mb-10">You're catching the rhythm of the islands!</p>
                            <button
                                onClick={onClose}
                                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20"
                                title="Keep Exploring"
                                aria-label="Keep Exploring and close player"
                            >
                                Keep Exploring
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
