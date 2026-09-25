"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RefreshCw, Trophy, ArrowLeft, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { MEMORY_PLAN, type MemoryDifficulty } from '@/lib/games/long-play';

const MEMORY_SYMBOLS = [
    { symbol: '🥥', name: 'Coconut' },
    { symbol: '🥭', name: 'Mango' },
    { symbol: '🍍', name: 'Pineapple' },
    { symbol: '🍌', name: 'Banana' },
    { symbol: '🦜', name: 'Parrot' },
    { symbol: '🏝️', name: 'Island' },
    { symbol: '⛵', name: 'Boat' },
    { symbol: '🥁', name: 'Steel Pan' },
    { symbol: '🌴', name: 'Palm' },
    { symbol: '🌺', name: 'Hibiscus' },
    { symbol: '🐚', name: 'Conch' },
    { symbol: '🐠', name: 'Reef Fish' },
    { symbol: '🦀', name: 'Crab' },
    { symbol: '☀️', name: 'Sun' },
    { symbol: '🌊', name: 'Wave' },
    { symbol: '🎵', name: 'Music' },
];

export default function IslandMemory({ onComplete }: { onComplete?: (score: number, correct: number, total: number) => void }) {
    const router = useRouter();
    const [cards, setCards] = useState<{ id: number; symbol: string; name: string; isFlipped: boolean; isMatched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const cardButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const [difficulty, setDifficulty] = useState<MemoryDifficulty | null>(null);
    const [board, setBoard] = useState(1);
    const [notice, setNotice] = useState<string | null>(null);

    const plan = difficulty ? MEMORY_PLAN[difficulty] : null;

    const totalPairs = useMemo(() => plan?.pairs ?? MEMORY_SYMBOLS.length, [plan]);

    const gridColumns = plan?.columns ?? 4;

    useEffect(() => {
        if (difficulty) initializeGame(1);
    }, [difficulty]);

    const initializeGame = (nextBoard = 1) => {
        if (!difficulty) return;
        const nextPlan = MEMORY_PLAN[difficulty];
        const pairsCount = nextPlan.pairs;

        // Choose random symbols
        const selectedSymbols = [...MEMORY_SYMBOLS].sort(() => Math.random() - 0.5).slice(0, pairsCount);

        const shuffled = [...selectedSymbols, ...selectedSymbols]
            .sort(() => Math.random() - 0.5)
            .map((item, index) => ({
                id: index,
                symbol: item.symbol,
                name: item.name,
                isFlipped: false,
                isMatched: false
            }));

        setCards(shuffled);
        if (nextBoard === 1) setMoves(0);
        setMatches(0);
        setFlippedIndices([]);
        setGameWon(false);
        setFocusedIndex(0);
        setBoard(nextBoard);
        setNotice(null);
    };

    useEffect(() => {
        const node = cardButtonRefs.current[focusedIndex];
        if (node) node.focus();
    }, [focusedIndex, cards.length]);

    const handleCardClick = (index: number) => {
        if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [firstIndex, secondIndex] = newFlipped;

            if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards(newCards);
                setFlippedIndices([]);
                setMatches(prev => {
                    const next = prev + 1;
                    const boardPairs = cards.length / 2;
                    if (next === boardPairs && difficulty) {
                        const boards = MEMORY_PLAN[difficulty].boards;
                        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                        if (board < boards) {
                            setNotice(`Board ${board} clear! Next board is ready.`);
                            window.setTimeout(() => initializeGame(board + 1), 900);
                        } else {
                            setGameWon(true);
                            const total = MEMORY_PLAN[difficulty].pairs * boards;
                            if (onComplete) onComplete(1000 * (difficulty === 'hard' ? 2 : 1), total, total);
                        }
                    }
                    return next;
                });
            } else {
                setTimeout(() => {
                    newCards[firstIndex].isFlipped = false;
                    newCards[secondIndex].isFlipped = false;
                    setCards(newCards);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    if (!difficulty) {
        return (
            <div className="h-full bg-[#1a2c4e] rounded-[3rem] p-8 flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-black text-white mb-8">Island Memory</h1>
                <p className="text-white/60 mb-8 max-w-md">Train your brain and remember the island treasures!</p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button onClick={() => setDifficulty('easy')} className="p-4 bg-green-500 rounded-2xl font-black text-white hover:scale-105 transition-transform">
                        Easy · 2 boards of 6 pairs
                    </button>
                    <button onClick={() => setDifficulty('medium')} className="p-4 bg-yellow-500 rounded-2xl font-black text-white hover:scale-105 transition-transform">
                        Medium · 2 boards of 8 pairs
                    </button>
                    <button onClick={() => setDifficulty('hard')} className="p-4 bg-red-500 rounded-2xl font-black text-white hover:scale-105 transition-transform">
                        Hard · 3 boards of 10 pairs
                    </button>
                    <button onClick={() => router.push('/portal/games')} className="mt-4 text-white/40 font-bold hover:text-white">
                        Back to Hub
                    </button>
                </div>
            </div>
        );
    }

    const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (cards.length === 0) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            setFocusedIndex((prev) => Math.min(cards.length - 1, prev + 1));
            return;
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setFocusedIndex((prev) => Math.max(0, prev - 1));
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex((prev) => Math.min(cards.length - 1, prev + gridColumns));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex((prev) => Math.max(0, prev - gridColumns));
            return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(focusedIndex);
        }
    };

    // Grid sizing based on difficulty
    const gridData: Record<MemoryDifficulty, string> = {
        easy: 'grid-cols-3 md:grid-cols-4',
        medium: 'grid-cols-4',
        hard: 'grid-cols-4'
    };

    return (
        <div className="h-full bg-[#1a2c4e] rounded-[3rem] p-8 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <button title="Go Back" aria-label="Go Back" onClick={() => router.push('/portal/games')} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20"><ArrowLeft /></button>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white">
                        <Target size={18} className="text-primary" />
                        <span className="text-white/60 text-sm">Moves:</span>
                        <span className="font-black">{moves}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white">
                        <Trophy size={18} className="text-amber-400" />
                        <span className="text-white/60 text-sm">Matches:</span>
                        <span className="font-black text-amber-400">{matches}/{totalPairs}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white">
                        <span className="text-white/60 text-sm">Board:</span>
                        <span className="font-black">{board}/{plan?.boards ?? 1}</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative z-10 flex items-center justify-center">
                {gameWon ? (
                    <div className="text-center text-white">
                        <h2 className="text-5xl font-black mb-4 animate-bounce">Winner!</h2>
                        <p className="text-xl text-white/60 mb-8">You cleared every board in {moves} moves.</p>
                        {notice && <p className="text-lg text-amber-200 mb-6">{notice}</p>}
                        <button onClick={() => initializeGame(1)} className="px-8 py-4 bg-green-500 rounded-2xl font-black text-xl hover:scale-105 transition-transform">
                            Play Again
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl">
                        {notice && <p className="mb-4 text-center text-lg font-black text-amber-200">{notice}</p>}
                    <div
                        role="grid"
                        aria-label="Memory game board"
                        tabIndex={0}
                        onKeyDown={handleGridKeyDown}
                        className={`grid gap-4 w-full max-w-2xl aspect-square p-4 outline-none ${gridData[difficulty]}`}
                    >
                        {cards.map((card, index) => (
                            <button
                                key={card.id}
                                title={`Card ${index + 1}`}
                                aria-label={`Card ${index + 1}`}
                                aria-pressed={card.isFlipped || card.isMatched}
                                tabIndex={index === focusedIndex ? 0 : -1}
                                ref={(node) => { cardButtonRefs.current[index] = node; }}
                                onClick={() => handleCardClick(index)}
                                onFocus={() => setFocusedIndex(index)}
                                className={`rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 transform aspect-square ${card.isFlipped || card.isMatched
                                    ? 'bg-gradient-to-br from-cyan-400 to-blue-500 rotate-0 scale-100 shadow-lg shadow-cyan-500/40'
                                    : 'bg-white/10 hover:bg-white/15 border border-white/10'
                                    } ${card.isMatched ? 'opacity-50 grayscale' : ''} ${index === focusedIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#1a2c4e]' : ''}`}
                            >
                                <span className={`transition-all duration-300 ${card.isFlipped || card.isMatched ? 'scale-100' : 'scale-0'}`}>
                                    {card.isFlipped || card.isMatched ? card.symbol : ''}
                                </span>
                            </button>
                        ))}
                    </div>
                    </div>
                )}
            </div>
        </div>
    );
}
