"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Fruit {
    id: number;
    emoji: string;
    x: number;
    y: number;
    points: number;
    isObstacle: boolean;
}

export default function MangoCatch({ onComplete }: { onComplete?: (score: number) => void }) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [fruits, setFruits] = useState<Fruit[]>([]);
    const [caughtCount, setCaughtCount] = useState(0);

    const FRUITS = [
        { emoji: '🥭', points: 10, isObstacle: false },
        { emoji: '🍍', points: 15, isObstacle: false },
        { emoji: '🍌', points: 10, isObstacle: false },
        { emoji: '🧤', points: -30, isObstacle: true },
    ];

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLives(3);
        setLevel(1);
        setFruits([]);
        setCaughtCount(0);
        spawnFruits(1);
    };

    const spawnFruits = (lvl: number) => {
        const newFruits: Fruit[] = [];
        const fruitCount = 3 + lvl;

        for (let i = 0; i < fruitCount; i++) {
            const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
            newFruits.push({
                id: Date.now() + i,
                emoji: fruit.emoji,
                x: Math.random() * 85 + 5, // percentage
                y: Math.random() * 70 + 10,
                points: fruit.points,
                isObstacle: fruit.isObstacle,
            });
        }

        setFruits(newFruits);
    };

    const catchFruit = (id: number) => {
        const fruit = fruits.find((f) => f.id === id);
        if (!fruit) return;

        if (fruit.isObstacle) {
            // Hit obstacle!
            if (lives <= 1) {
                setGameState('lost');
            } else {
                setLives(lives - 1);
            }
        } else {
            // Caught good fruit!
            setScore(score + fruit.points);
            setCaughtCount(caughtCount + 1);
        }

        // Remove fruit
        setFruits(fruits.filter((f) => f.id !== id));

        // Check if level complete
        if (caughtCount + 1 >= 3 + level) {
            if (level >= 3) {
                // Win!
                setGameState('won');
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                if (onComplete) onComplete(score + fruit.points);
            } else {
                // Next level
                const nextLevel = level + 1;
                setLevel(nextLevel);
                setCaughtCount(0);
                spawnFruits(nextLevel);
            }
        }
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-orange-200 to-amber-100 rounded-[3rem]">
                <div className="text-9xl animate-bounce">🥭</div>
                <div>
                    <h1 className="text-5xl font-black text-orange-900 mb-4">
                        Mango Catch!
                    </h1>
                    <p className="text-xl text-orange-700 max-w-2xl mx-auto">
                        Tap the fruits to catch them! Avoid the old mangoes! 🎯
                    </p>
                </div>
                <button
                    onClick={startGame}
                    className="px-12 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Start Catching! 🚀
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
                <h1 className="text-5xl font-black text-white drop-shadow-lg">Fruit Master!</h1>
                <div className="bg-white/30 p-8 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">
                        Final Score: <span className="text-yellow-300">{score}</span> 🥭
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
                        You caught: <span className="text-yellow-300">{caughtCount}</span> fruits
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
        <div className="h-full flex flex-col p-6 bg-gradient-to-b from-orange-50 to-amber-100 rounded-[3rem]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-2xl font-black text-orange-900">Level {level}/3</p>
                    <p className="text-lg text-orange-700">Caught: {caughtCount}/{3 + level}</p>
                </div>
                <div>
                    <p className="text-2xl font-black text-orange-900">Score: {score}</p>
                    <div className="flex gap-1 mt-1">
                        {Array(3)
                            .fill(0)
                            .map((_, i) => (
                                <span key={i} className={`text-2xl ${i < lives ? '❤️' : '🩶'}`}>
                                </span>
                            ))}
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative bg-white/40 rounded-3xl overflow-hidden backdrop-blur-sm border-4 border-orange-200">
                {fruits.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                        <p className="text-3xl font-bold text-orange-700">Spawning fruits...</p>
                    </div>
                ) : (
                    fruits.map((fruit) => (
                        <motion.button
                            key={fruit.id}
                            onClick={() => catchFruit(fruit.id)}
                            initial={{ scale: 0, y: -20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0 }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            style={{
                                position: 'absolute',
                                left: `${fruit.x}%`,
                                top: `${fruit.y}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                            className="text-6xl cursor-pointer hover:scale-125 transition-transform drop-shadow-lg"
                        >
                            {fruit.emoji}
                        </motion.button>
                    ))
                )}
            </div>

            {/* Instructions */}
            <div className="text-center mt-6 text-sm font-bold text-orange-700 bg-orange-100 p-3 rounded-2xl">
                <p>🥭 Tap fruits to catch them!</p>
                <p>🧤 Avoid the old mangoes!</p>
            </div>
        </div>
    );
}
