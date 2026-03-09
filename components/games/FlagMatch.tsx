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
    { flagCode: 'jm', emoji: '🇯🇲', island: 'Jamaica', fact: 'Home of reggae music! 🎵' },
    { flagCode: 'tt', emoji: '🇹🇹', island: 'Trinidad & Tobago', fact: 'Land of steel pan drums! 🥁' },
    { flagCode: 'bb', emoji: '🇧🇧', island: 'Barbados', fact: 'Beautiful beaches everywhere! 🏖️' },
    { flagCode: 'gy', emoji: '🇬🇾', island: 'Guyana', fact: 'Land of many waters! 💧' },
    { flagCode: 'gd', emoji: '🇬🇩', island: 'Grenada', fact: 'The spice island! 🌶️' },
    { flagCode: 'bs', emoji: '🇧🇸', island: 'Bahamas', fact: '700+ islands to explore! 🏝️' },
    { flagCode: 'kn', emoji: '🇰🇳', island: 'St. Kitts & Nevis', fact: 'Historic sugar plantations! 🍂' },
    { flagCode: 'lc', emoji: '🇱🇨', island: 'Saint Lucia', fact: 'Twin mountain peaks! ⛰️' },
    { flagCode: 'vc', emoji: '🇻🇨', island: 'St. Vincent & the Grenadines', fact: 'Sailing paradise! ⛵' },
    { flagCode: 'ag', emoji: '🇦🇬', island: 'Antigua & Barbuda', fact: '365 beaches - one per day! 🏖️' },
    { flagCode: 'dm', emoji: '🇩🇲', island: 'Dominica', fact: 'The nature island! 🌿' },
    { flagCode: 'ht', emoji: '🇭🇹', island: 'Haiti', fact: 'First independent Caribbean nation! 🏰' },
    { flagCode: 'do', emoji: '🇩🇴', island: 'Dominican Republic', fact: 'Shares an island with Haiti! 🗺️' },
    { flagCode: 'cu', emoji: '🇨🇺', island: 'Cuba', fact: 'The largest island in the Caribbean! 🚙' },
    { flagCode: 'pr', emoji: '🇵🇷', island: 'Puerto Rico', fact: 'Island of enchantment! 🐸' },
    { flagCode: 'bz', emoji: '🇧🇿', island: 'Belize', fact: 'Home to the Great Blue Hole! 🤿' },
];

const LEVELS = [
    { num: 1, name: 'Tourist', options: 2, timeMs: 0 },
    { num: 2, name: 'Explorer', options: 4, timeMs: 0 },
    { num: 3, name: 'Navigator', options: 4, timeMs: 10000 },
    { num: 4, name: 'Captain', options: 6, timeMs: 8000 },
    { num: 5, name: 'Legend', options: 8, timeMs: 5000 },
];

export default function FlagMatch({ onComplete }: { onComplete?: (score: number) => void }) {
    const [gameState, setGameState] = useState<'start' | 'level_select' | 'playing' | 'won' | 'lost'>('start');
    const [currentLevel, setCurrentLevel] = useState(1);
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentCard, setCurrentCard] = useState<FlagCard | null>(null);
    const [options, setOptions] = useState<FlagCard[]>([]);
    const [showFact, setShowFact] = useState(false);
    const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
    const [imageErrorByCode, setImageErrorByCode] = useState<Record<string, boolean>>({});

    // Timer state
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Timer effect
    React.useEffect(() => {
        if (gameState !== 'playing' || timeLeft === null || showFact) return;

        if (timeLeft <= 0) {
            handleAnswer(null); // Time out
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev! - 50);
        }, 50);

        return () => clearTimeout(timer);
    }, [timeLeft, gameState, showFact]);

    const startGame = (level: number) => {
        setCurrentLevel(level);
        setGameState('playing');
        setRound(0);
        setScore(0);
        setLives(3);
        generateRound(level);
    };

    const generateRound = (level: number) => {
        const levelConfig = LEVELS.find(l => l.num === level)!;
        const shuffled = [...FLAG_CARDS].sort(() => Math.random() - 0.5);

        const correct = shuffled[0];
        const choices = [correct];

        // Fill the rest of the options
        for (let i = 1; i < levelConfig.options; i++) {
            choices.push(shuffled[i]);
        }

        // Final shuffle of choices
        const finalChoices = choices.sort(() => Math.random() - 0.5);

        setCurrentCard(correct);
        setOptions(finalChoices);
        setShowFact(false);
        setSelectedIsland(null);

        // Set timer based on level
        if (levelConfig.timeMs > 0) {
            setTimeLeft(levelConfig.timeMs);
        } else {
            setTimeLeft(null); // No timer
        }
    };

    const handleAnswer = (selected: FlagCard | null) => {
        if (showFact) return; // Prevent double clicks

        setSelectedIsland(selected ? selected.island : 'TIMEOUT');
        setShowFact(true);

        const isRight = selected?.island === currentCard?.island;
        const nextRound = round + 1;
        const levelConfig = LEVELS.find(l => l.num === currentLevel)!;

        if (isRight) {
            // Give bonus for time remaining if applicable
            let timeBonus = 0;
            if (timeLeft !== null && timeLeft > 0) {
                timeBonus = Math.floor((timeLeft / levelConfig.timeMs) * 50);
            }

            const earned = (currentLevel * 50) + timeBonus;
            const nextScore = score + earned;
            setScore(nextScore);

            setTimeout(() => {
                if (nextRound >= 10) {
                    setGameState('won');
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    onComplete?.(nextScore);
                } else {
                    setRound(nextRound);
                    generateRound(currentLevel);
                }
            }, 2000);
            return;
        }

        // Wrong answer or timeout
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
                generateRound(currentLevel);
            }
        }, 2200);
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-blue-200 via-cyan-100 to-teal-100 rounded-[3rem]">
                <div className="text-9xl animate-bounce">🌍</div>
                <div>
                    <h1 className="text-5xl font-black text-blue-900 mb-4">Caribbean Flags!</h1>
                    <p className="text-xl text-blue-700 max-w-2xl mx-auto">Master the flags of the islands across 5 difficulty levels.</p>
                </div>
                <button
                    onClick={() => setGameState('level_select')}
                    className="px-12 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Start Adventure
                </button>
            </div>
        );
    }

    if (gameState === 'level_select') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-[3rem] text-center text-white shadow-2xl overflow-hidden">
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl max-w-4xl w-full text-slate-900 relative z-10 overflow-y-auto no-scrollbar">
                    <div className="mb-6">
                        <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-4 inline-block">Flag Match Explorer</span>
                        <h2 className="text-4xl font-black tracking-tight mb-2">Select Your Journey</h2>
                        <p className="text-slate-500 font-bold">Higher levels have more flags and ticking timers!</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {LEVELS.map(level => {
                            return (
                                <button
                                    key={level.num}
                                    onClick={() => startGame(level.num)}
                                    className="p-6 rounded-3xl flex flex-col items-center justify-center gap-3 border-4 transition-all bg-cyan-50 border-cyan-100 text-cyan-900 hover:border-cyan-500 hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="text-center w-full">
                                        <div className="font-black text-2xl mb-1 flex items-center justify-center gap-2">
                                            Level {level.num}
                                        </div>
                                        <div className="text-sm uppercase tracking-widest font-black text-cyan-600 mb-2">{level.name}</div>
                                        <div className="flex justify-center gap-4 text-xs font-bold opacity-70">
                                            <span className="bg-white px-2 py-1 rounded-lg">{level.options} Flags</span>
                                            {level.timeMs > 0 && <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg">{(level.timeMs / 1000)}s Timer</span>}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setGameState('start')}
                        className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 uppercase tracking-widest text-sm"
                    >
                        Back
                    </button>
                </div>
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
                    <p className="text-2xl font-bold text-white mt-2">Level: <span className="text-yellow-300">{LEVELS.find(l => l.num === currentLevel)?.name}</span></p>
                    <p className="text-2xl font-bold text-white mt-2">Score: <span className="text-yellow-300">{score}</span></p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => startGame(currentLevel)} className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
                        Try Again
                    </button>
                    <button onClick={() => setGameState('level_select')} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-transform border-2 border-white/20">
                        Change Level
                    </button>
                </div>
            </div>
        );
    }

    const currentLevelConfig = LEVELS.find(l => l.num === currentLevel)!;
    const progressPercentage = timeLeft !== null ? (timeLeft / currentLevelConfig.timeMs) * 100 : 100;

    // Determine grid based on number of options
    let gridClass = "grid-cols-2";
    if (options.length === 6) gridClass = "grid-cols-2 md:grid-cols-3";
    if (options.length === 8) gridClass = "grid-cols-2 md:grid-cols-4";

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

            <div className="text-center w-full max-w-2xl relative">
                {currentLevelConfig.timeMs > 0 && !showFact && (
                    <div className="absolute -top-10 left-0 right-0 max-w-xs mx-auto">
                        <div className="h-3 bg-white/50 rounded-full overflow-hidden mb-1">
                            <motion.div
                                className={`h-full ${progressPercentage > 50 ? 'bg-green-500' : progressPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${progressPercentage}%` }}
                                layout
                            />
                        </div>
                        <p className={`text-xs font-black uppercase tracking-widest ${progressPercentage < 25 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
                            {progressPercentage < 25 ? 'Hurry up!' : 'Time Remaining'}
                        </p>
                    </div>
                )}
                <p className="text-lg md:text-2xl font-bold text-blue-700 mb-2">Where is</p>
                <div className="bg-white rounded-2xl px-4 md:px-8 py-4 shadow-lg mb-2">
                    <p className="text-3xl md:text-5xl font-black text-blue-900">{currentCard?.island}?</p>
                </div>
            </div>

            <div className={`grid ${gridClass} gap-4 md:gap-6 w-full max-w-3xl justify-items-center`}>
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
                            className={`w-28 h-28 md:w-32 md:h-32 rounded-2xl shadow-lg flex items-center justify-center transition-all cursor-pointer overflow-hidden ${isSelected
                                    ? isCorrect
                                        ? 'bg-green-300 border-4 border-green-600'
                                        : 'bg-red-300 border-4 border-red-600'
                                    : showFact && isCorrect
                                        ? 'bg-green-100 border-4 border-green-400 opacity-60' // Reveal answer on wrong guess
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
                    className={`text-center p-6 rounded-3xl max-w-xl w-full mx-4 shadow-2xl z-10 ${selectedIsland === currentCard.island ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                >
                    <p className="text-2xl md:text-3xl font-black mb-2 flex items-center justify-center gap-3">
                        {selectedIsland === currentCard.island ? '🎉 Correct!' : selectedIsland === 'TIMEOUT' ? '⏰ Out of Time!' : '❌ Oops!'}
                    </p>
                    <div className="bg-white/20 p-4 rounded-2xl mt-4">
                        <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-80">Did you know?</p>
                        <p className="text-xl font-bold">{currentCard.fact}</p>
                    </div>
                </motion.div>
            )}

            <div className="text-center text-2xl font-black text-blue-900">
                Score: <span className="text-blue-600">{score}</span>
            </div>
        </div>
    );
}
