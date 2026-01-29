"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Heart, Play, RefreshCw, ArrowLeft, Star, Volume2, Gamepad2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

// ==========================================
// CONSTANTS
// ==========================================

const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 60;
const FRUIT_SIZE = 50;
const SPAWN_RATE = 1500; // ms between fruit spawns
const GRAVITY = 3.5;

type ItemType = 'mango' | 'guava' | 'pineapple' | 'coconut_shell';

interface GameItem {
    id: number;
    x: number;
    y: number;
    type: ItemType;
    speed: number;
    rotation: number;
    rotationSpeed: number;
}

const ITEMS: Record<ItemType, { emoji: string; points: number; isObstacle: boolean }> = {
    mango: { emoji: '🥭', points: 10, isObstacle: false },
    guava: { emoji: '🍏', points: 15, isObstacle: false },
    pineapple: { emoji: '🍍', points: 25, isObstacle: false },
    coconut_shell: { emoji: '🥥', points: -20, isObstacle: true },
};

export default function MangoCatch({ onComplete }: { onComplete?: (score: number, correct: number, total: number) => void }) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();

    // Game state
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [basketX, setBasketX] = useState(GAME_WIDTH / 2);
    const [items, setItems] = useState<GameItem[]>([]);

    // Refs for mutable game state to avoid closure staleness in animation loop
    const stateRef = useRef({
        score: 0,
        lives: 3,
        level: 1,
        basketX: GAME_WIDTH / 2,
        items: [] as GameItem[],
        lastSpawn: 0,
        isGameOver: false,
    });

    const spawnItem = useCallback((now: number) => {
        const types: ItemType[] = ['mango', 'mango', 'mango', 'guava', 'guava', 'pineapple', 'coconut_shell'];
        const type = types[Math.floor(Math.random() * types.length)];

        const newItem: GameItem = {
            id: now,
            x: Math.random() * (GAME_WIDTH - FRUIT_SIZE),
            y: -FRUIT_SIZE,
            type,
            speed: GRAVITY + (stateRef.current.level * 0.5),
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 5,
        };

        stateRef.current.items.push(newItem);
    }, []);

    const updateGame = useCallback((time: number) => {
        if (stateRef.current.isGameOver) return;

        // Spawn logic
        const spawnDelay = SPAWN_RATE / (1 + (stateRef.current.level - 1) * 0.2);
        if (time - stateRef.current.lastSpawn > spawnDelay) {
            spawnItem(time);
            stateRef.current.lastSpawn = time;
        }

        // Move items
        stateRef.current.items.forEach(item => {
            item.y += item.speed;
            item.rotation += item.rotationSpeed;
        });

        // Collision logic
        const basketY = GAME_HEIGHT - BASKET_HEIGHT - 40;
        const remainingItems: GameItem[] = [];

        stateRef.current.items.forEach(item => {
            const hitBasket =
                item.y + FRUIT_SIZE > basketY &&
                item.y < basketY + BASKET_HEIGHT &&
                item.x + FRUIT_SIZE > stateRef.current.basketX - BASKET_WIDTH / 2 &&
                item.x < stateRef.current.basketX + BASKET_WIDTH / 2;

            if (hitBasket) {
                const itemData = ITEMS[item.type];
                if (itemData.isObstacle) {
                    stateRef.current.lives -= 1;
                    if (stateRef.current.lives <= 0) {
                        stateRef.current.isGameOver = true;
                        setGameState('gameover');
                        if (onComplete) onComplete(stateRef.current.score, stateRef.current.score, stateRef.current.score);
                    }
                } else {
                    stateRef.current.score += itemData.points;
                    // Level up every 200 points
                    const newLevel = Math.floor(stateRef.current.score / 200) + 1;
                    if (newLevel > stateRef.current.level) {
                        stateRef.current.level = newLevel;
                        setLevel(newLevel);
                    }
                }
            } else if (item.y < GAME_HEIGHT) {
                remainingItems.push(item);
            } else if (!ITEMS[item.type].isObstacle) {
                // Missed fruit - penalty? (maybe only for older kids)
                // For now, no penalty for missing, just don't catch the shells!
            }
        });

        stateRef.current.items = remainingItems;

        // Sync to React state
        setItems([...stateRef.current.items]);
        setScore(stateRef.current.score);
        setLives(stateRef.current.lives);

        if (!stateRef.current.isGameOver) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(updateGame);
        }
    }, [spawnItem]);

    const startGame = () => {
        stateRef.current = {
            score: 0,
            lives: 3,
            level: 1,
            basketX: GAME_WIDTH / 2,
            items: [],
            lastSpawn: 0,
            isGameOver: false,
        };
        setScore(0);
        setLives(3);
        setLevel(1);
        setItems([]);
        setGameState('playing');
        requestRef.current = requestAnimationFrame(updateGame);
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (gameState !== 'playing' || !containerRef.current) return;

        let clientX: number;
        if (e && 'touches' in e && e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        } else if (e && 'clientX' in e) {
            clientX = (e as any).clientX;
        } else {
            return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const scale = GAME_WIDTH / rect.width;
        let x = (clientX - rect.left) * scale;

        // Clamp
        x = Math.max(BASKET_WIDTH / 2, Math.min(GAME_WIDTH - BASKET_WIDTH / 2, x));

        stateRef.current.basketX = x;
        setBasketX(x);
    };

    useEffect(() => {
        if (gameState === 'gameover') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState]);

    return (
        <div className="h-full flex flex-col bg-[#0a0a1a] rounded-[3rem] overflow-hidden border border-white/10 relative text-white">
            {/* HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-400" size={20} />
                        <span className="font-black text-2xl">{score}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <div className="flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Heart
                                key={i}
                                size={20}
                                className={`${i < lives ? 'text-red-500 fill-red-500' : 'text-white/10'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 px-6 py-3 rounded-2xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60 block">Level</span>
                    <span className="font-black text-xl">🌴 {level}</span>
                </div>
            </div>

            {/* Game Canvas/Area */}
            <div
                ref={containerRef}
                className="relative flex-1 cursor-none touch-none bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-500/20"
                style={{ touchAction: 'none' }}
            >
                {/* Global Event Listener for smoother Input */}
                <div
                    className="absolute inset-0 z-50"
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleMouseMove}
                />
                {/* Visual Background Elements */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-600 to-transparent opacity-30" />
                <motion.div
                    animate={{ x: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-20 right-20 text-6xl opacity-20"
                >🌴</motion.div>
                <motion.div
                    animate={{ x: [0, -40, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute top-40 left-10 text-4xl opacity-10"
                >☁️</motion.div>

                {gameState === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-sm z-[60]">
                        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-8 relative">
                            <span className="text-6xl">🥭</span>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-dashed border-primary/40 rounded-full"
                            />
                        </div>
                        <h1 className="text-5xl font-black text-center mb-4 text-transparent bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text">
                            Mango Catch
                        </h1>
                        <p className="text-xl text-white/70 max-w-sm text-center mb-8">
                            Catch the tropical fruits but avoid the prickly coconut shells!
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                                <span>🥭 🍐 🍍</span>
                                <span className="font-bold text-green-400">GOOD</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                                <span>🥥 (Shell)</span>
                                <span className="font-bold text-red-400">BAD</span>
                            </div>
                        </div>
                        <button
                            onClick={startGame}
                            className="px-12 py-5 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Play fill="currentColor" /> START PLAYING
                        </button>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-md z-[70]">
                        <div className="text-8xl mb-6">🏁</div>
                        <h2 className="text-5xl font-black text-white mb-2">Game Over!</h2>
                        <p className="text-2xl text-white/50 mb-8">Your Legendary Score: <span className="text-yellow-400 font-extrabold">{score}</span></p>

                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-white text-black rounded-2xl font-black flex items-center gap-2 hover:bg-gray-100 transition-colors"
                            >
                                <RefreshCw size={20} /> Play Again
                            </button>
                            <button
                                onClick={() => router.push('/portal/games')}
                                className="px-8 py-4 bg-primary text-white rounded-2xl font-black flex items-center gap-2"
                            >
                                <ArrowLeft size={20} /> Back to Hub
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Items */}
                <AnimatePresence>
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="absolute pointer-events-none select-none text-4xl"
                            style={{
                                left: `${(item.x / GAME_WIDTH) * 100}%`,
                                top: `${(item.y / GAME_HEIGHT) * 100}%`,
                                transform: `rotate(${item.rotation}deg)`,
                                width: `${(FRUIT_SIZE / GAME_WIDTH) * 100}%`,
                                height: `${(FRUIT_SIZE / GAME_HEIGHT) * 100}%`,
                            }}
                        >
                            {ITEMS[item.type].emoji}
                        </div>
                    ))}
                </AnimatePresence>

                {/* Basket */}
                {gameState === 'playing' && (
                    <div
                        className="absolute bottom-10 flex flex-col items-center justify-center pointer-events-none transition-all duration-75"
                        style={{
                            left: `${(basketX / GAME_WIDTH) * 100}%`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="relative">
                            <div className="text-7xl">🧺</div>
                            {/* Visual effect for catch */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl opacity-40"
                            >✨</motion.div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with game instructions */}
            <footer className="p-4 bg-black/40 border-t border-white/10 text-center">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {gameState === 'playing' ? 'Move your mouse or finger to move the basket!' : 'A Likkle Legends Adventure'}
                </p>
            </footer>
        </div>
    );
}
