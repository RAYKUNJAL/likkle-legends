"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface FlagCard {
    emoji: string;
    island: string;
    fact: string;
}

const FLAG_CARDS: FlagCard[] = [
    { emoji: '🇯🇲', island: 'Jamaica', fact: 'Home of reggae music! 🎵' },
    { emoji: '🇹🇹', island: 'Trinidad & Tobago', fact: 'Land of steel pan drums! 🥁' },
    { emoji: '🇧🇧', island: 'Barbados', fact: 'Beautiful beaches everywhere! 🏖️' },
    { emoji: '🇬🇾', island: 'Guyana', fact: 'Land of many waters! 💧' },
    { emoji: '🇬🇩', island: 'Grenada', fact: 'The spice island! 🌶️' },
    { emoji: '🇧🇸', island: 'Bahamas', fact: '700+ islands to explore! 🏝️' },
    { emoji: '🇰🇳', island: 'St. Kitts', fact: 'Historic sugar plantations! 🍂' },
    { emoji: '🇱🇨', island: 'Saint Lucia', fact: 'Twin mountain peaks! ⛰️' },
    { emoji: '🇻🇨', island: 'St. Vincent', fact: 'Sailing paradise! ⛵' },
    { emoji: '🇦🇬', island: 'Antigua', fact: '365 beaches - one per day! 🏖️' },
];

export default function FlagMatch({ onComplete }: { onComplete?: (score: number) => void }) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentCard, setCurrentCard] = useState<FlagCard | null>(null);
    const [options, setOptions] = useState<FlagCard[]>([]);
    const [showFact, setShowFact] = useState(false);
    const [selectedIsland, setSelectedIsland] = useState<string | null>(null);

    const startGame = () => {
        setGameState('playing');
        setRound(0);
        setScore(0);
        setLives(3);
        generateRound();
    };

    const generateRound = () => {
        const shuffled = [...FLAG_CARDS].sort(() => Math.random() - 0.5);
        const correct = shuffled[0];
        const choices = [correct, shuffled[1], shuffled[2], shuffled[3]].sort(() => Math.random() - 0.5);

        setCurrentCard(correct);
        setOptions(choices);
        setShowFact(false);
        setSelectedIsland(null);
    };

    const handleAnswer = (selected: FlagCard) => {
        setSelectedIsland(selected.island);
        setShowFact(true);

        if (selected.island === currentCard?.island) {
            // Correct!
            setScore(score + 100);
            setTimeout(() => {
                if (round + 1 >= 10) {
                    setGameState('won');
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    if (onComplete) onComplete(score + 100);
                } else {
                    setRound(round + 1);
                    generateRound();
                }
            }, 1500);
        } else {
            // Wrong!
            if (lives <= 1) {
                setTimeout(() => setGameState('lost'), 1500);
            } else {
                setLives(lives - 1);
                setTimeout(() => {
                    if (round + 1 >= 10) {
                        setGameState('won');
                    } else {
                        setRound(round + 1);
                        generateRound();
                    }
                }, 1500);
            }
        }
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-blue-200 via-cyan-100 to-teal-100 rounded-[3rem]">
                <div className="text-9xl animate-bounce">🌍</div>
                <div>
                    <h1 className="text-5xl font-black text-blue-900 mb-4">
                        Caribbean Flags!
                    </h1>
                    <p className="text-xl text-blue-700 max-w-2xl mx-auto">
                        Tap the flag that matches the island name!
                    </p>
                </div>
                <button
                    onClick={startGame}
                    className="px-12 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Start! 🚀
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
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Island Explorer!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">
                        Final Score: <span className="text-yellow-300">{score + 100}</span> 🌍
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
                        You reached: <span className="text-yellow-300">Round {round + 1}</span>
                    </p>
                    <p className="text-2xl font-bold text-white mt-2">
                        Score: <span className="text-yellow-300">{score}</span>
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
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 bg-gradient-to-b from-blue-100 to-cyan-50 rounded-[3rem]">
            {/* Header */}
            <div className="text-center">
                <p className="text-3xl font-black text-blue-900">Round {round + 1} / 10</p>
                <div className="flex justify-center gap-2 mt-2">
                    {Array(3)
                        .fill(0)
                        .map((_, i) => (
                            <span key={i} className={`text-2xl ${i < lives ? '❤️' : '🩶'}`}>
                            </span>
                        ))}
                </div>
            </div>

            {/* Question */}
            <div className="text-center">
                <p className="text-2xl font-bold text-blue-700 mb-4">Tap the flag for:</p>
                <div className="bg-white rounded-2xl px-8 py-4 shadow-lg">
                    <p className="text-5xl font-black text-blue-900">{currentCard?.island}</p>
                </div>
            </div>

            {/* Flag Options - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {options.map((card) => {
                    const isCorrect = card.island === currentCard?.island;
                    const isSelected = selectedIsland === card.island;
                    const isWrong = isSelected && !isCorrect;

                    return (
                        <motion.button
                            key={card.island}
                            onClick={() => !selectedIsland && handleAnswer(card)}
                            disabled={!!selectedIsland}
                            whileHover={!selectedIsland ? { scale: 1.1 } : {}}
                            whileTap={!selectedIsland ? { scale: 0.95 } : {}}
                            animate={
                                isSelected
                                    ? isCorrect
                                        ? { scale: 1.2, rotate: 360 }
                                        : { scale: 1, x: [-10, 10, -10, 0] }
                                    : {}
                            }
                            className={`
                                w-28 h-28 rounded-2xl shadow-lg flex items-center justify-center
                                transition-all font-black text-6xl cursor-pointer
                                ${
                                    isSelected
                                        ? isCorrect
                                            ? 'bg-green-300 border-4 border-green-600'
                                            : 'bg-red-300 border-4 border-red-600'
                                        : 'bg-white hover:bg-blue-50 border-2 border-blue-200'
                                }
                            `}
                        >
                            {card.emoji}
                        </motion.button>
                    );
                })}
            </div>

            {/* Fact Display */}
            {showFact && currentCard && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-center p-4 rounded-2xl max-w-md ${
                        selectedIsland === currentCard.island
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    <p className="text-lg font-bold">{currentCard.fact}</p>
                </motion.div>
            )}

            {/* Score */}
            <div className="text-center text-2xl font-black text-blue-900">
                Score: <span className="text-blue-600">{score}</span>
            </div>
        </div>
    );
}
