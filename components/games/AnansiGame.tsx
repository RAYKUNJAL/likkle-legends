"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface DrumPattern {
    drums: ('red' | 'yellow' | 'blue' | 'green')[];
    speed: number;
}

const PATTERNS: DrumPattern[] = [
    { drums: ['red', 'yellow', 'red', 'yellow'], speed: 800 },
    { drums: ['yellow', 'blue', 'yellow', 'blue'], speed: 700 },
    { drums: ['red', 'blue', 'green', 'yellow'], speed: 600 },
    { drums: ['green', 'red', 'yellow', 'blue', 'red'], speed: 550 },
    { drums: ['yellow', 'yellow', 'red', 'red', 'blue', 'blue'], speed: 500 },
];

const DRUM_COLORS = {
    red: { bg: 'bg-red-400', sound: 261.63 },
    yellow: { bg: 'bg-yellow-400', sound: 329.63 },
    blue: { bg: 'bg-blue-400', sound: 392.0 },
    green: { bg: 'bg-green-400', sound: 523.25 },
};

export default function AnansiGame({ onComplete }: { onComplete?: (score: number) => void }) {
    const [gameState, setGameState] = useState<'start' | 'pattern' | 'playing' | 'won' | 'lost'>('start');
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [playerSequence, setPlayerSequence] = useState<('red' | 'yellow' | 'blue' | 'green')[]>([]);
    const [showingPattern, setShowingPattern] = useState(false);
    const [activeDrum, setActiveDrum] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize audio context
    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playDrumSound = async (drum: string) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const freq = DRUM_COLORS[drum as keyof typeof DRUM_COLORS]?.sound || 440;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    };

    const startGame = () => {
        setGameState('pattern');
        setRound(0);
        setScore(0);
        setPlayerSequence([]);
        playRound(0);
    };

    const playRound = async (roundNum: number) => {
        if (roundNum >= PATTERNS.length) {
            setGameState('won');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            if (onComplete) onComplete(score + 500);
            return;
        }

        setRound(roundNum);
        const pattern = PATTERNS[roundNum];
        setShowingPattern(true);
        setPlayerSequence([]);

        // Show pattern
        for (const drum of pattern.drums) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    setActiveDrum(drum);
                    playDrumSound(drum);
                    setTimeout(() => {
                        setActiveDrum(null);
                        resolve(null);
                    }, 200);
                }, pattern.speed);
            });
        }

        // Wait before letting player play
        await new Promise((resolve) => setTimeout(resolve, 500));
        setShowingPattern(false);
        setGameState('playing');
    };

    const handleDrumTap = async (drum: 'red' | 'yellow' | 'blue' | 'green') => {
        if (gameState !== 'playing' || showingPattern) return;

        const pattern = PATTERNS[round];
        const newSequence = [...playerSequence, drum];
        setPlayerSequence(newSequence);

        // Play sound
        setActiveDrum(drum);
        await playDrumSound(drum);
        setTimeout(() => setActiveDrum(null), 200);

        // Check if correct
        if (drum !== pattern.drums[newSequence.length - 1]) {
            // Wrong!
            setGameState('lost');
            return;
        }

        // Check if completed this round
        if (newSequence.length === pattern.drums.length) {
            // Next round!
            setScore(score + 100);
            await new Promise((resolve) => setTimeout(resolve, 800));
            playRound(round + 1);
        }
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-purple-100 to-pink-50 rounded-[3rem]">
                <div className="text-9xl animate-bounce">🥁</div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-purple-900 mb-4">
                        Anansi's Drum Party
                    </h1>
                    <p className="text-lg text-purple-700 max-w-2xl mx-auto">
                        Watch the drum pattern and tap the drums in the same order! The drums get faster each round!
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
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Drum Master!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">
                        Final Score: <span className="text-yellow-300">{score + 500}</span> 🎵
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
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Oops! Wrong Drum!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">
                        You made it to: <span className="text-yellow-300">Round {round + 1}</span>
                    </p>
                    <p className="text-2xl font-bold text-white mt-2">
                        Score: <span className="text-yellow-300">{score}</span> 🎵
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
                <p className="text-3xl font-black text-purple-900 mb-2">Round {round + 1} / {PATTERNS.length}</p>
                <p className="text-lg text-purple-700">
                    {showingPattern ? '👂 Watch carefully...' : '🎯 Your turn!'}
                </p>
            </div>

            {/* Drums Grid */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {(['red', 'yellow', 'blue', 'green'] as const).map((drum) => (
                    <motion.button
                        key={drum}
                        onClick={() => handleDrumTap(drum)}
                        disabled={showingPattern}
                        whileHover={!showingPattern ? { scale: 1.05 } : {}}
                        whileTap={!showingPattern ? { scale: 0.95 } : {}}
                        animate={
                            activeDrum === drum
                                ? { scale: 1.15, boxShadow: '0 0 30px rgba(0,0,0,0.3)' }
                                : { scale: 1, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
                        }
                        className={`${DRUM_COLORS[drum].bg} rounded-full w-24 h-24 shadow-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center text-5xl font-black`}
                    >
                        🥁
                    </motion.button>
                ))}
            </div>

            {/* Status */}
            <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
                <p className="text-lg font-bold text-purple-900">
                    Progress: <span className="text-purple-600 text-2xl">{playerSequence.length} / {PATTERNS[round]?.drums.length || 0}</span>
                </p>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-purple-700 font-bold bg-purple-100 p-4 rounded-2xl max-w-md">
                <p>🎵 Watch the drums light up and play</p>
                <p>🥁 Tap them in the same order</p>
                <p>🏆 Each round gets harder!</p>
            </div>
        </div>
    );
}
