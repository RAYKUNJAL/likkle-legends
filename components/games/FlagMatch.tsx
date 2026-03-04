"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface FlagCard {
    flagCode: string;
    emoji: string;
    island: string;
    fact: string;
}

const FLAG_CARDS: FlagCard[] = [
    { flagCode: 'jm', emoji: '\u{1F1EF}\u{1F1F2}', island: 'Jamaica', fact: 'Home of reggae music! \u{1F3B5}' },
    { flagCode: 'tt', emoji: '\u{1F1F9}\u{1F1F9}', island: 'Trinidad & Tobago', fact: 'Land of steel pan drums! \u{1F941}' },
    { flagCode: 'bb', emoji: '\u{1F1E7}\u{1F1E7}', island: 'Barbados', fact: 'Beautiful beaches everywhere! \u{1F3D6}\u{FE0F}' },
    { flagCode: 'gy', emoji: '\u{1F1EC}\u{1F1FE}', island: 'Guyana', fact: 'Land of many waters! \u{1F4A7}' },
    { flagCode: 'gd', emoji: '\u{1F1EC}\u{1F1E9}', island: 'Grenada', fact: 'The spice island! \u{1F336}\u{FE0F}' },
    { flagCode: 'bs', emoji: '\u{1F1E7}\u{1F1F8}', island: 'Bahamas', fact: '700+ islands to explore! \u{1F3DD}\u{FE0F}' },
    { flagCode: 'kn', emoji: '\u{1F1F0}\u{1F1F3}', island: 'St. Kitts & Nevis', fact: 'Historic sugar plantations! \u{1F342}' },
    { flagCode: 'lc', emoji: '\u{1F1F1}\u{1F1E8}', island: 'Saint Lucia', fact: 'Twin mountain peaks! \u{26F0}\u{FE0F}' },
    { flagCode: 'vc', emoji: '\u{1F1FB}\u{1F1E8}', island: 'St. Vincent & the Grenadines', fact: 'Sailing paradise! \u{26F5}' },
    { flagCode: 'ag', emoji: '\u{1F1E6}\u{1F1EC}', island: 'Antigua & Barbuda', fact: '365 beaches - one per day! \u{1F3D6}\u{FE0F}' },
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
    const [imageErrorByCode, setImageErrorByCode] = useState<Record<string, boolean>>({});

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

        const isRight = selected.island === currentCard?.island;
        const nextRound = round + 1;

        if (isRight) {
            const nextScore = score + 100;
            setScore(nextScore);

            setTimeout(() => {
                if (nextRound >= 10) {
                    setGameState('won');
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    onComplete?.(nextScore);
                } else {
                    setRound(nextRound);
                    generateRound();
                }
            }, 1200);
            return;
        }

        const nextLives = lives - 1;
        setLives(nextLives);

        setTimeout(() => {
            if (nextLives <= 0) {
                setGameState('lost');
            } else if (nextRound >= 10) {
                setGameState('won');
                onComplete?.(score);
            } else {
                setRound(nextRound);
                generateRound();
            }
        }, 1200);
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-blue-200 via-cyan-100 to-teal-100 rounded-[3rem]">
                <div className="text-9xl animate-bounce">{'\u{1F30D}'}</div>
                <div>
                    <h1 className="text-5xl font-black text-blue-900 mb-4">Caribbean Flags!</h1>
                    <p className="text-xl text-blue-700 max-w-2xl mx-auto">Tap the real flag that matches the island name.</p>
                </div>
                <button
                    onClick={startGame}
                    className="px-12 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Start
                </button>
            </div>
        );
    }

    if (gameState === 'won') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-green-400 to-emerald-300 rounded-[3rem]">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} className="text-9xl">
                    {'\u{1F3C6}'}
                </motion.div>
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Island Explorer!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">Final Score: <span className="text-yellow-300">{score}</span> {'\u{1F30D}'}</p>
                </div>
                <button onClick={() => setGameState('start')} className="px-8 py-4 bg-white text-green-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
                    Play Again
                </button>
            </div>
        );
    }

    if (gameState === 'lost') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-red-400 to-orange-300 rounded-[3rem]">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-9xl">
                    {'\u{1F605}'}
                </motion.div>
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Game Over!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">You reached: <span className="text-yellow-300">Round {round + 1}</span></p>
                    <p className="text-2xl font-bold text-white mt-2">Score: <span className="text-yellow-300">{score}</span></p>
                </div>
                <button onClick={() => setGameState('start')} className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 bg-gradient-to-b from-blue-100 to-cyan-50 rounded-[3rem]">
            <div className="text-center">
                <p className="text-3xl font-black text-blue-900">Round {round + 1} / 10</p>
                <div className="flex justify-center gap-2 mt-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`text-2xl ${i < lives ? 'text-red-500' : 'text-gray-400'}`}>
                            {i < lives ? '\u{2764}\u{FE0F}' : '\u{1FA76}'}
                        </span>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <p className="text-2xl font-bold text-blue-700 mb-4">Tap the flag for:</p>
                <div className="bg-white rounded-2xl px-8 py-4 shadow-lg">
                    <p className="text-4xl md:text-5xl font-black text-blue-900">{currentCard?.island}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {options.map((card) => {
                    const isCorrect = card.island === currentCard?.island;
                    const isSelected = selectedIsland === card.island;

                    return (
                        <motion.button
                            key={card.island}
                            onClick={() => !selectedIsland && handleAnswer(card)}
                            disabled={!!selectedIsland}
                            whileHover={!selectedIsland ? { scale: 1.08 } : {}}
                            whileTap={!selectedIsland ? { scale: 0.95 } : {}}
                            animate={isSelected ? (isCorrect ? { scale: 1.15, rotate: 6 } : { x: [-8, 8, -8, 0] }) : {}}
                            className={`w-28 h-28 rounded-2xl shadow-lg flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                                isSelected
                                    ? isCorrect
                                        ? 'bg-green-300 border-4 border-green-600'
                                        : 'bg-red-300 border-4 border-red-600'
                                    : 'bg-white hover:bg-blue-50 border-2 border-blue-200'
                            }`}
                            aria-label={`Flag option ${card.island}`}
                        >
                            {imageErrorByCode[card.flagCode] ? (
                                <span className="font-black text-5xl">{card.emoji}</span>
                            ) : (
                                <img
                                    src={`https://flagcdn.com/w160/${card.flagCode}.png`}
                                    alt={`Flag of ${card.island}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={() =>
                                        setImageErrorByCode((prev) => ({
                                            ...prev,
                                            [card.flagCode]: true,
                                        }))
                                    }
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {showFact && currentCard && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-center p-4 rounded-2xl max-w-md ${selectedIsland === currentCard.island ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    <p className="text-lg font-bold">{currentCard.fact}</p>
                </motion.div>
            )}

            <div className="text-center text-2xl font-black text-blue-900">
                Score: <span className="text-blue-600">{score}</span>
            </div>
        </div>
    );
}
