"use client";

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trophy, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Pan {
    id: number;
    color: string;
    frequency: number;
    emoji: string;
}

const PANS: Pan[] = [
    { id: 0, color: 'bg-red-400', frequency: 440, emoji: '🔴' },
    { id: 1, color: 'bg-yellow-400', frequency: 550, emoji: '🟡' },
    { id: 2, color: 'bg-green-400', frequency: 660, emoji: '🟢' },
    { id: 3, color: 'bg-blue-400', frequency: 880, emoji: '🔵' },
];

export default function SteelpanSimon({ onComplete }: { onComplete?: (score: number) => void }) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [round, setRound] = useState(0);
    const [isPlayingSequence, setIsPlayingSequence] = useState(false);
    const [activePan, setActivePan] = useState<number | null>(null);

    // Initialize audio context
    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playTone = async (frequency: number, duration: number = 200) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);
    };

    const playSequence = async (seq: number[]) => {
        setIsPlayingSequence(true);
        for (let i = 0; i < seq.length; i++) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    setActivePan(seq[i]);
                    playTone(PANS[seq[i]].frequency);
                    setTimeout(() => {
                        setActivePan(null);
                        resolve(null);
                    }, 200);
                }, 600);
            });
        }
        setIsPlayingSequence(false);
    };

    const startGame = () => {
        setSequence([]);
        setPlayerSequence([]);
        setRound(0);
        setGameState('playing');
        addToSequence();
    };

    const addToSequence = async () => {
        const newSequence = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(newSequence);
        setPlayerSequence([]);
        setRound((r) => r + 1);
        await new Promise((r) => setTimeout(r, 500));
        await playSequence(newSequence);
    };

    const handlePanClick = async (panId: number) => {
        if (isPlayingSequence) return;

        const newPlayerSequence = [...playerSequence, panId];
        setPlayerSequence(newPlayerSequence);

        setActivePan(panId);
        await playTone(PANS[panId].frequency);
        setTimeout(() => setActivePan(null), 200);

        // Check if correct
        if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
            // Wrong!
            setGameState('lost');
            return;
        }

        // Check if completed this round
        if (newPlayerSequence.length === sequence.length) {
            if (sequence.length === 8) {
                // Won!
                setGameState('won');
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                if (onComplete) onComplete(round * 100);
            } else {
                // Next round
                await new Promise((r) => setTimeout(r, 1000));
                await addToSequence();
            }
        }
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-purple-100 to-pink-50 rounded-[3rem]">
                <div className="text-9xl animate-bounce">🥁</div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-purple-900 mb-4">
                        Steelpan Simon Says
                    </h1>
                    <p className="text-lg text-purple-700 max-w-2xl mx-auto">
                        Listen to the steelpan sequence and repeat it! Get all 8 rounds right to win!
                    </p>
                </div>
                <button
                    onClick={startGame}
                    className="px-12 py-6 bg-purple-500 hover:bg-purple-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Start Playing! 🎵
                </button>
            </div>
        );
    }

    if (gameState === 'won') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-green-400 to-emerald-300 rounded-[3rem]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    className="text-9xl"
                >
                    🏆
                </motion.div>
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Music Legend!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">
                        Final Score: <span className="text-yellow-300">{round * 100}</span>
                    </p>
                </div>
                <button
                    onClick={() => setGameState('start')}
                    className="px-8 py-4 bg-white text-green-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
                >
                    Play Again
                </button>
            </div>
        );
    }

    if (gameState === 'lost') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-red-400 to-orange-300 rounded-[3rem]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-9xl"
                >
                    😅
                </motion.div>
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Game Over!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">
                        Reached Round: <span className="text-yellow-300">{round}</span>
                    </p>
                    <p className="text-2xl font-bold text-white mt-2">
                        Score: <span className="text-yellow-300">{(round - 1) * 100}</span>
                    </p>
                </div>
                <button
                    onClick={() => setGameState('start')}
                    className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 bg-gradient-to-b from-purple-50 to-pink-100 rounded-[3rem]">
            {/* Header */}
            <div className="text-center">
                <p className="text-3xl font-black text-purple-900 mb-2">Round {round}</p>
                <p className="text-lg text-purple-700">
                    {isPlayingSequence ? '🎵 Listen carefully...' : '👂 Your turn!'}
                </p>
            </div>

            {/* Steelpan Pans */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {PANS.map((pan) => (
                    <motion.button
                        key={pan.id}
                        onClick={() => handlePanClick(pan.id)}
                        disabled={isPlayingSequence}
                        whileHover={!isPlayingSequence ? { scale: 1.05 } : {}}
                        whileTap={!isPlayingSequence ? { scale: 0.95 } : {}}
                        animate={
                            activePan === pan.id
                                ? { scale: 1.15, boxShadow: '0 0 30px rgba(0,0,0,0.3)' }
                                : { scale: 1, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
                        }
                        className={`${pan.color} rounded-3xl p-12 shadow-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center`}
                    >
                        <span className="text-6xl">{pan.emoji}</span>
                    </motion.button>
                ))}
            </div>

            {/* Status */}
            <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
                <p className="text-lg font-bold text-purple-900">
                    Sequence length: <span className="text-purple-600 text-2xl">{sequence.length}</span>
                </p>
                <p className="text-sm text-purple-600 mt-2">
                    {isPlayingSequence
                        ? 'Listening to sequence...'
                        : `You've played ${playerSequence.length} of ${sequence.length}`}
                </p>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-purple-700 font-bold bg-purple-100 p-4 rounded-2xl max-w-md">
                <p>🎵 Watch the lights and listen to the steelpan tones</p>
                <p>🎯 Tap the pans in the same order</p>
                <p>🏆 Complete 8 rounds to become a Music Legend!</p>
            </div>
        </div>
    );
}
