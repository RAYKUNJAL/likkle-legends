"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Flag {
    emoji: string;
    island: string;
    fact: string;
}

const FLAGS: Flag[] = [
    { emoji: '🇯🇲', island: 'Jamaica', fact: 'Jamaica is famous for reggae music and Bob Marley!' },
    { emoji: '🇹🇹', island: 'Trinidad & Tobago', fact: 'Home of the steel pan drum instrument!' },
    { emoji: '🇧🇧', island: 'Barbados', fact: 'Barbados has some of the most beautiful beaches in the Caribbean!' },
    { emoji: '🇬🇾', island: 'Guyana', fact: 'Guyana means "Land of Many Waters" in the local Arawak language.' },
    { emoji: '🇬🇩', island: 'Grenada', fact: 'Grenada is known as the Spice Island for its nutmeg and spices.' },
    { emoji: '🇧🇸', island: 'Bahamas', fact: 'The Bahamas has over 700 islands and cays!' },
    { emoji: '🇰🇳', island: 'St. Kitts & Nevis', fact: 'St. Kitts was one of the first Caribbean islands colonized by Europeans.' },
    { emoji: '🇱🇨', island: 'Saint Lucia', fact: 'The Pitons of Saint Lucia are a UNESCO World Heritage Site!' },
    { emoji: '🇻🇨', island: 'St. Vincent & the Grenadines', fact: 'Famous for nutmeg production and sailing!' },
    { emoji: '🇦🇬', island: 'Antigua & Barbuda', fact: 'Antigua has 365 beaches - one for each day of the year!' },
];

export default function FlagMatch({ onComplete }: { onComplete?: (score: number) => void }) {
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [currentFlag, setCurrentFlag] = useState<Flag | null>(null);
    const [options, setOptions] = useState<Flag[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFact, setShowFact] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);

    // Initialize game
    const startGame = () => {
        setRound(1);
        setScore(0);
        setLives(3);
        setGameState('playing');
        generateRound();
    };

    // Generate new round
    const generateRound = () => {
        const shuffled = [...FLAGS].sort(() => Math.random() - 0.5);
        const correct = shuffled[0];
        const choices = [
            correct,
            shuffled[1],
            shuffled[2],
            shuffled[3],
        ].sort(() => Math.random() - 0.5);

        setCurrentFlag(correct);
        setOptions(choices);
        setSelectedAnswer(null);
        setShowFact(false);
        setTimeLeft(10);
    };

    // Timer effect
    useEffect(() => {
        if (gameState !== 'playing' || selectedAnswer !== null) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, selectedAnswer]);

    const handleTimeout = () => {
        if (lives <= 1) {
            setGameState('lost');
        } else {
            setLives((l) => l - 1);
            setTimeout(() => {
                if (round < 10) {
                    setRound((r) => r + 1);
                    generateRound();
                } else {
                    setGameState('won');
                }
            }, 1500);
        }
    };

    const handleAnswer = (selected: Flag) => {
        setSelectedAnswer(selected.island);
        setShowFact(true);

        if (selected.island === currentFlag?.island) {
            setScore((s) => s + 100);
            setTimeout(() => {
                if (round < 10) {
                    setRound((r) => r + 1);
                    generateRound();
                } else {
                    setGameState('won');
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    if (onComplete) onComplete(score + 100);
                }
            }, 2000);
        } else {
            if (lives <= 1) {
                setTimeout(() => setGameState('lost'), 1500);
            } else {
                setLives((l) => l - 1);
                setTimeout(() => {
                    if (round < 10) {
                        setRound((r) => r + 1);
                        generateRound();
                    } else {
                        setGameState('won');
                    }
                }, 2000);
            }
        }
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-blue-100 to-cyan-50 rounded-[3rem]">
                <div className="text-8xl animate-bounce">🌍</div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-4">
                        Caribbean Flag Match
                    </h1>
                    <p className="text-lg text-blue-700 max-w-2xl mx-auto">
                        Match 10 flags to their islands and learn cool facts about the Caribbean!
                    </p>
                </div>
                <button
                    onClick={startGame}
                    className="px-12 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Start Adventure! 🚀
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
                <h1 className="text-5xl font-black text-white drop-shadow-lg">You're an Island Hopper!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">
                        Final Score: <span className="text-yellow-300">{score}</span>
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
                        Final Score: <span className="text-yellow-300">{score}</span>
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
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 bg-gradient-to-b from-blue-50 to-cyan-100 rounded-[3rem]">
            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-2xl">
                <div className="text-2xl font-black text-blue-900">
                    Round {round}/10
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                            <Heart
                                key={i}
                                size={28}
                                className={i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300'}
                            />
                        ))}
                    </div>
                    <div className={`text-3xl font-black px-4 py-2 rounded-full ${
                        timeLeft <= 3 ? 'bg-red-400 text-white' : 'bg-yellow-300 text-blue-900'
                    }`}>
                        {timeLeft}s
                    </div>
                </div>
            </div>

            {/* Flag Display */}
            {currentFlag && (
                <motion.div
                    key={currentFlag.island}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-9xl"
                >
                    {currentFlag.emoji}
                </motion.div>
            )}

            <div className="text-center">
                <p className="text-lg text-blue-700 font-bold uppercase tracking-widest mb-2">
                    Which island is this?
                </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                <AnimatePresence>
                    {options.map((option, idx) => {
                        const isCorrect = option.island === currentFlag?.island;
                        const isSelected = selectedAnswer === option.island;
                        const isWrong = isSelected && !isCorrect;

                        return (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => !selectedAnswer && handleAnswer(option)}
                                disabled={selectedAnswer !== null}
                                className={`p-4 rounded-2xl font-black text-lg transition-all transform ${
                                    isSelected
                                        ? isCorrect
                                            ? 'bg-green-400 text-white scale-105'
                                            : 'bg-red-400 text-white scale-95 shake'
                                        : 'bg-white text-blue-900 hover:scale-105 active:scale-95'
                                } disabled:opacity-75`}
                            >
                                {option.island}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Fact */}
            <AnimatePresence>
                {showFact && currentFlag && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl max-w-md shadow-lg"
                    >
                        <p className="text-center text-blue-900 font-bold">
                            💡 {currentFlag.fact}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Score */}
            <div className="text-3xl font-black text-blue-900 bg-white px-6 py-3 rounded-full shadow-lg">
                Score: {score}
            </div>
        </div>
    );
}
