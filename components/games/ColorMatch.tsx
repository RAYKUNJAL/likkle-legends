"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, ArrowLeft, RefreshCw, Play, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

// ==========================================
// CONSTANTS
// ==========================================

const COLOR_TILES = [
    { name: 'Red', hex: '#EF4444', emoji: '🍎', items: ['🍒', '🍓', '🍉'] },
    { name: 'Yellow', hex: '#F59E0B', emoji: '🍌', items: ['🍍', '🍋', '🧀'] },
    { name: 'Green', hex: '#10B981', emoji: '🌴', items: ['🍏', '🍐', '🥒'] },
    { name: 'Blue', hex: '#3B82F6', emoji: '🌊', items: ['🐟', '🐬', '🐦'] },
    { name: 'Orange', hex: '#F97316', emoji: '🍊', items: ['🏀', '🥕', '🦊'] },
    { name: 'Purple', hex: '#8B5CF6', emoji: '🍇', items: ['🍆', '🔮', '☂️'] },
];

export default function ColorMatch({ onComplete }: { onComplete?: (score: number, correct: number, total: number) => void }) {
    const router = useRouter();
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'complete'>('idle');
    const [score, setScore] = useState(0);
    const [rounds, setRounds] = useState(0);
    const [targetColor, setTargetColor] = useState(COLOR_TILES[0]);
    const [options, setOptions] = useState<typeof COLOR_TILES>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const generateRound = useCallback(() => {
        setTargetColor((prev) => {
            let shuffled = [...COLOR_TILES].sort(() => Math.random() - 0.5);
            // Ensure we don't pick the same color twice in a row if possible
            while (shuffled[0].name === prev?.name && COLOR_TILES.length > 1) {
                shuffled = [...COLOR_TILES].sort(() => Math.random() - 0.5);
            }

            const target = shuffled[0];
            // Get 3 other unique complications
            const others = shuffled.slice(1, 4);
            const roundOptions = [target, ...others].sort(() => Math.random() - 0.5);

            setOptions(roundOptions);
            return target;
        });
        setFeedback(null);
    }, []);

    const startGame = () => {
        setScore(0);
        setRounds(0);
        setGameState('playing');
        generateRound();
    };

    const handleSelect = (selected: typeof COLOR_TILES[0]) => {
        if (feedback) return;

        if (selected.name === targetColor.name) {
            setScore(prev => prev + 100);
            setFeedback({ type: 'success', text: 'Correct! Great job!' });

            setTimeout(() => {
                if (rounds + 1 >= 10) {
                    setGameState('complete');
                    if (onComplete) onComplete(score + 100, 10, 10);
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                } else {
                    setRounds(prev => prev + 1);
                    generateRound();
                }
            }, 1000);
        } else {
            setFeedback({ type: 'error', text: 'Try again, Legend!' });
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-[3rem] overflow-hidden border-4 border-indigo-100 shadow-2xl relative text-slate-800">
            {/* HUD */}
            <div className="p-6 flex justify-between items-center bg-indigo-50/50">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={24} />
                    <span className="font-black text-2xl text-indigo-900">{score}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-3 w-48 bg-indigo-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500"
                            animate={{ width: `${(rounds / 10) * 100}%` }}
                        />
                    </div>
                    <span className="font-bold text-indigo-400">Round {rounds + 1}/10</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {gameState === 'idle' && (
                    <div className="text-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-9xl mb-8"
                        >
                            🎨
                        </motion.div>
                        <h1 className="text-5xl font-black mb-4 text-indigo-900">Island Color Match</h1>
                        <p className="text-xl text-slate-500 mb-8 max-w-sm mx-auto">
                            Can you help find the colored fruits on our island?
                        </p>
                        <button
                            onClick={startGame}
                            className="px-12 py-5 bg-indigo-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-indigo-600 hover:-translate-y-1 transition-all"
                        >
                            READY TO PLAY!
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="w-full max-w-2xl space-y-12">
                        {/* Target Display */}
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Find the color:</h2>
                            <motion.div
                                key={targetColor.name}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-block px-8 py-4 rounded-[2rem] border-8 shadow-inner"
                                style={{ backgroundColor: `${targetColor.hex}22`, borderColor: targetColor.hex }}
                            >
                                <span className="text-6xl font-black" style={{ color: targetColor.hex }}>
                                    {targetColor.name}
                                </span>
                            </motion.div>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {options.map((option) => (
                                <button
                                    key={option.name}
                                    onClick={() => handleSelect(option)}
                                    className={`relative aspect-square rounded-[2.5rem] flex flex-col items-center justify-center text-8xl shadow-lg transition-all group ${feedback && feedback.type === 'success' && option.name === targetColor.name
                                        ? 'scale-110 ring-8 ring-green-400'
                                        : feedback && feedback.type === 'error' && option.name !== targetColor.name
                                            ? 'opacity-30 grayscale'
                                            : 'hover:scale-105 hover:shadow-2xl active:scale-95'
                                        }`}
                                    style={{ backgroundColor: option.hex }}
                                >
                                    <span className="group-hover:rotate-12 transition-transform">
                                        {option.emoji}
                                    </span>
                                    {/* Random secondary items */}
                                    <div className="absolute top-2 right-4 text-2xl opacity-50">
                                        {option.items[Math.floor(Math.random() * option.items.length)]}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Feedback Toast */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    className={`text-center py-4 px-8 rounded-full font-black text-2xl mx-auto w-fit shadow-xl ${feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                                        }`}
                                >
                                    {feedback.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {gameState === 'complete' && (
                    <div className="text-center">
                        <div className="w-48 h-48 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <Star className="text-white fill-current" size={80} />
                        </div>
                        <h2 className="text-5xl font-black text-indigo-900 mb-2">Legendary Result!</h2>
                        <p className="text-2xl text-slate-500 mb-8">You found all the island colors!</p>
                        <div className="bg-indigo-50 p-6 rounded-3xl mb-8 border-2 border-indigo-100">
                            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest block mb-1">Final Score</span>
                            <span className="text-6xl font-black text-indigo-600">{score}</span>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-600 transition-all"
                            >
                                <RefreshCw size={20} /> Play Again
                            </button>
                            <button
                                onClick={() => router.push('/portal/games')}
                                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-200"
                            >
                                <ArrowLeft size={20} /> Back to Hub
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <footer className="p-4 bg-indigo-50 border-t border-indigo-100 text-center">
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">
                    Learning Caribbean Colors with Tanty Spice
                </p>
            </footer>
        </div>
    );
}
