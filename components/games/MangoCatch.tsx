"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Trophy, Target, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

type FruitKey = 'mango' | 'banana' | 'pineapple' | 'coconut';

type FruitDef = {
    key: FruitKey;
    emoji: string;
    name: string;
    colorHint: string;
};

type FruitTile = {
    id: string;
    fruit: FruitDef;
    isTapped: boolean;
};

const FRUITS: FruitDef[] = [
    { key: 'mango', emoji: '??', name: 'Mango', colorHint: 'yellow-orange' },
    { key: 'banana', emoji: '??', name: 'Banana', colorHint: 'yellow' },
    { key: 'pineapple', emoji: '??', name: 'Pineapple', colorHint: 'golden' },
    { key: 'coconut', emoji: '??', name: 'Coconut', colorHint: 'brown' },
];

const TOTAL_ROUNDS = 6;
const ROUND_TARGET_COUNT = 4;

function shuffle<T>(arr: T[]) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function createBoard(target: FruitDef, seed: number): FruitTile[] {
    const tiles: FruitTile[] = [];
    const distractors = FRUITS.filter((f) => f.key !== target.key);

    for (let i = 0; i < ROUND_TARGET_COUNT; i += 1) {
        tiles.push({ id: `t-${seed}-${i}`, fruit: target, isTapped: false });
    }

    for (let i = 0; i < 8; i += 1) {
        const fruit = distractors[i % distractors.length];
        tiles.push({ id: `d-${seed}-${i}`, fruit, isTapped: false });
    }

    return shuffle(tiles);
}

export default function MangoCatch({ onComplete }: { onComplete?: (score: number) => void }) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [boardSeed, setBoardSeed] = useState(1);
    const [targetFruit, setTargetFruit] = useState<FruitDef>(FRUITS[0]);
    const [caughtTarget, setCaughtTarget] = useState(0);
    const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

    const board = useMemo(() => createBoard(targetFruit, boardSeed), [targetFruit, boardSeed]);
    const [tiles, setTiles] = useState<FruitTile[]>(board);

    React.useEffect(() => {
        setTiles(board);
    }, [board]);

    const startRound = (newRound: number, keepScore: number, keepLives: number) => {
        const nextTarget = shuffle(FRUITS)[0];
        setRound(newRound);
        setScore(keepScore);
        setLives(keepLives);
        setTargetFruit(nextTarget);
        setCaughtTarget(0);
        setFeedback(null);
        setBoardSeed((s) => s + 1);
    };

    const startGame = () => {
        setGameState('playing');
        startRound(1, 0, 3);
    };

    const endWin = (finalScore: number) => {
        setGameState('won');
        confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
        onComplete?.(finalScore);
    };

    const handleTileTap = (id: string) => {
        if (gameState !== 'playing') return;

        const tile = tiles.find((t) => t.id === id);
        if (!tile || tile.isTapped) return;

        setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, isTapped: true } : t)));

        if (tile.fruit.key === targetFruit.key) {
            const nextCaught = caughtTarget + 1;
            const gained = 25 + (round - 1) * 5;
            const nextScore = score + gained;

            setCaughtTarget(nextCaught);
            setScore(nextScore);
            setFeedback({ ok: true, text: `Great! You found a ${targetFruit.name}.` });

            if (nextCaught >= ROUND_TARGET_COUNT) {
                if (round >= TOTAL_ROUNDS) {
                    endWin(nextScore);
                } else {
                    window.setTimeout(() => {
                        startRound(round + 1, nextScore, lives);
                    }, 700);
                }
            }
        } else {
            const nextLives = lives - 1;
            setLives(nextLives);
            setFeedback({ ok: false, text: `Oops, that's ${tile.fruit.name}. Find ${targetFruit.name}.` });

            if (nextLives <= 0) {
                setGameState('lost');
            }
        }
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-orange-200 to-amber-100 rounded-[3rem]">
                <div className="text-8xl">??</div>
                <div>
                    <h1 className="text-5xl font-black text-orange-900 mb-4">Mango Catch Learning Quest</h1>
                    <p className="text-xl text-orange-700 max-w-2xl mx-auto mb-2">
                        Catch the target fruit, count your catches, and build island vocabulary.
                    </p>
                    <p className="text-sm font-bold text-orange-600">Best for ages 3-9</p>
                </div>
                <button
                    onClick={startGame}
                    className="px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                    Start Game
                </button>
            </div>
        );
    }

    if (gameState === 'won') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-7 bg-gradient-to-b from-green-400 to-emerald-300 rounded-[3rem]">
                <div className="text-8xl">??</div>
                <h2 className="text-5xl font-black text-white">Fruit Champion!</h2>
                <div className="bg-white/30 p-7 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">Final Score: <span className="text-yellow-200">{score}</span></p>
                    <p className="text-lg text-white/90 mt-2">You completed all {TOTAL_ROUNDS} learning rounds.</p>
                </div>
                <button
                    onClick={() => setGameState('start')}
                    className="px-8 py-4 bg-white text-green-700 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
                >
                    Play Again
                </button>
            </div>
        );
    }

    if (gameState === 'lost') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-7 bg-gradient-to-b from-red-400 to-orange-300 rounded-[3rem]">
                <div className="text-8xl">??</div>
                <h2 className="text-5xl font-black text-white">Try Again!</h2>
                <div className="bg-white/30 p-7 rounded-3xl backdrop-blur-sm">
                    <p className="text-3xl font-black text-white">Score: <span className="text-yellow-200">{score}</span></p>
                    <p className="text-lg text-white/90 mt-2">Round reached: {round}/{TOTAL_ROUNDS}</p>
                </div>
                <button
                    onClick={() => setGameState('start')}
                    className="px-8 py-4 bg-white text-red-700 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
                >
                    Restart
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-b from-orange-50 to-amber-100 rounded-[3rem]">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <div>
                    <p className="text-2xl font-black text-orange-900">Round {round}/{TOTAL_ROUNDS}</p>
                    <p className="text-lg text-orange-700">Catch {ROUND_TARGET_COUNT} {targetFruit.name}s ({targetFruit.colorHint})</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-orange-800 font-black">
                        <Target size={18} /> {caughtTarget}/{ROUND_TARGET_COUNT}
                    </div>
                    <div className="flex items-center gap-1 text-orange-800 font-black">
                        <Trophy size={18} /> {score}
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Heart key={i} size={18} className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                        ))}
                    </div>
                </div>
            </div>

            {feedback && (
                <div className={`mb-4 p-3 rounded-xl font-bold flex items-center gap-2 ${feedback.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />} {feedback.text}
                </div>
            )}

            <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-4 bg-white/50 rounded-3xl p-5 border-2 border-orange-200">
                {tiles.map((tile) => (
                    <motion.button
                        key={tile.id}
                        onClick={() => handleTileTap(tile.id)}
                        whileHover={!tile.isTapped ? { scale: 1.05 } : {}}
                        whileTap={!tile.isTapped ? { scale: 0.95 } : {}}
                        disabled={tile.isTapped}
                        className={`aspect-square rounded-2xl text-5xl md:text-6xl flex items-center justify-center border-2 transition-all ${tile.isTapped ? 'bg-gray-100 border-gray-200 opacity-50' : 'bg-white border-orange-200 hover:border-orange-400'}`}
                        aria-label={`Fruit ${tile.fruit.name}`}
                        title={tile.fruit.name}
                    >
                        {tile.fruit.emoji}
                    </motion.button>
                ))}
            </div>

            <div className="text-center mt-4 text-sm font-bold text-orange-700 bg-orange-100 p-3 rounded-2xl flex items-center justify-center gap-2">
                <RefreshCw size={14} /> Learning tip: say each fruit name out loud when you tap it.
            </div>
        </div>
    );
}
