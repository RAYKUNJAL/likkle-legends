"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Volume2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

const WORD_PAIRS = [
    { patois: 'Pickney', english: 'Child', hint: 'A young person' },
    { patois: 'Wha Gwan', english: "What's up?", hint: 'A greeting' },
    { patois: 'Big Up', english: 'Respect', hint: 'Showing appreciation' },
    { patois: 'Irie', english: 'Good/Fine', hint: 'Everything is alright' },
    { patois: 'Likkle', english: 'Little', hint: 'Small in size' },
    { patois: 'Tallawah', english: 'Strong', hint: 'Mighty despite size' },
    { patois: 'Bashment', english: 'Party', hint: 'A really good time' },
    { patois: 'Bredren', english: 'Friend', hint: 'My close buddy' },
    { patois: 'Nyam', english: 'Eat', hint: 'To consume food' },
    { patois: 'Duppy', english: 'Ghost', hint: 'Spirit from the grave' },
    { patois: 'Ginnal', english: 'Trickster', hint: 'Someone who is sly' },
    { patois: 'Yard', english: 'Home', hint: 'My house or country' },
    { patois: 'Facety', english: 'Rude', hint: 'Bad manners' },
    { patois: 'Vex', english: 'Angry', hint: 'Upset about something' },
    { patois: 'Link up', english: 'Meet', hint: 'Get together' },
    { patois: 'Boonoonoonoos', english: 'Special', hint: 'Someone you love' },
    { patois: 'Labrish', english: 'Gossip', hint: 'Chatting too much' },
    { patois: 'Criss', english: 'Cool', hint: 'Looking good' },
    { patois: 'Dead lef', english: 'Leftovers', hint: 'Food for later' },
    { patois: 'Hush', english: 'Sorry', hint: 'Comforting someone' }
];

export default function PatoisWizard({ onComplete }: { onComplete?: (score: number, correct: number, total: number) => void }) {
    const router = useRouter();
    const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

    // Game Logic
    const [leftCol, setLeftCol] = useState<{ id: string, text: string, type: 'patois' }[]>([]);
    const [rightCol, setRightCol] = useState<{ id: string, text: string, type: 'english' }[]>([]);

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matchedIds, setMatchedIds] = useState<string[]>([]); // stores patois words that are matched
    const [score, setScore] = useState(0);

    const initGame = () => {
        // Shuffle and prep
        const selection = [...WORD_PAIRS].sort(() => Math.random() - 0.5).slice(0, 6); // Take 6 pairs

        const left = selection.map(p => ({ id: p.patois, text: p.patois, type: 'patois' as const })).sort(() => Math.random() - 0.5);
        const right = selection.map(p => ({ id: p.patois, text: p.english, type: 'english' as const })).sort(() => Math.random() - 0.5); // ID is link key

        setLeftCol(left);
        setRightCol(right);
        setMatchedIds([]);
        setScore(0);
        setSelectedLeft(null);
        setSelectedRight(null);
        setGameState('playing');
    };

    const handleSelect = (id: string, side: 'left' | 'right') => {
        if (matchedIds.includes(id)) return;

        if (side === 'left') {
            setSelectedLeft(id);
            // Check match if right is already selected
            if (selectedRight) checkMatch(id, selectedRight);
        } else {
            setSelectedRight(id);
            // Check match if left is already selected
            if (selectedLeft) checkMatch(selectedLeft, id);
        }
    };

    const checkMatch = (leftId: string, rightId: string) => {
        if (leftId === rightId) {
            // MATCH!
            setMatchedIds(prev => [...prev, leftId]);
            setScore(prev => prev + 100);
            confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });

            // Check win
            if (matchedIds.length + 1 === leftCol.length) {
                setTimeout(() => setGameState('complete'), 1000);
                if (onComplete) onComplete(score + 100, 6, 6);
            }
        } else {
            // No Match
            // Shake effect or error feedback could go here
        }

        // Reset selection after short delay to show result
        setTimeout(() => {
            setSelectedLeft(null);
            setSelectedRight(null);
        }, 500);
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-[3rem] text-center text-slate-900 shadow-2xl">
                <div className="bg-white p-8 rounded-[3rem] shadow-xl max-w-lg w-full">
                    <div className="text-8xl mb-6 animate-bounce">🇯🇲</div>
                    <h1 className="text-4xl font-black mb-4 tracking-tight">Patois Word Wizard</h1>
                    <p className="text-xl text-slate-500 mb-8">
                        Can you match the Jamaican Patois words to their English meanings?
                    </p>
                    <button
                        onClick={initGame}
                        className="w-full py-5 bg-black text-white rounded-2xl font-black text-2xl hover:scale-[1.02] transition-transform shadow-lg"
                    >
                        Start Learning!
                    </button>
                    <button
                        onClick={() => router.push('/portal/games')}
                        className="mt-4 text-slate-400 font-bold hover:text-slate-600 mb-2"
                    >
                        Back to Hub
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        return (
            <div className="h-full bg-slate-100 rounded-[3rem] p-8 flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setGameState('start')}
                        className="p-2 hover:bg-slate-100 rounded-xl"
                        aria-label="Back to Start"
                        title="Back to Start"
                    >
                        <ArrowLeft color="black" />
                    </button>
                    <h2 className="font-black text-xl text-slate-800">Match Matches: {matchedIds.length}/{leftCol.length}</h2>
                    <div className="font-black text-green-600 text-xl flex items-center gap-2">
                        <Trophy size={18} /> {score}
                    </div>
                </div>

                {/* Game Board */}
                <div className="flex-1 grid grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto w-full items-center">

                    {/* Left Column (Patois) */}
                    <div className="space-y-4">
                        <p className="text-center font-black text-green-600 uppercase tracking-widest mb-4">🇯🇲 Patois</p>
                        {leftCol.map(item => {
                            const isSelected = selectedLeft === item.id;
                            const isMatched = matchedIds.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    disabled={isMatched}
                                    onClick={() => handleSelect(item.id, 'left')}
                                    className={`w-full p-6 rounded-2xl font-bold text-lg shadow-md transition-all border-2
                                        ${isMatched ? 'bg-green-100 border-green-400 text-green-700 opacity-50 scale-95' :
                                            isSelected ? 'bg-black text-white border-black scale-105 z-10' :
                                                'bg-white text-slate-800 border-white hover:border-slate-300 hover:scale-[1.02]'}`}
                                >
                                    {item.text}
                                </button>
                            )
                        })}
                    </div>

                    {/* Right Column (English) */}
                    <div className="space-y-4">
                        <p className="text-center font-black text-blue-600 uppercase tracking-widest mb-4">🇺🇸 English</p>
                        {rightCol.map(item => {
                            const isSelected = selectedRight === item.id;
                            const isMatched = matchedIds.includes(item.id); // Checks logic using the patois ID stored in english obj
                            return (
                                <button
                                    key={item.text} // Use text key for react
                                    disabled={isMatched}
                                    onClick={() => handleSelect(item.id, 'right')}
                                    className={`w-full p-6 rounded-2xl font-bold text-lg shadow-md transition-all border-2
                                        ${isMatched ? 'bg-green-100 border-green-400 text-green-700 opacity-50 scale-95' :
                                            isSelected ? 'bg-blue-600 text-white border-blue-600 scale-105 z-10' :
                                                'bg-white text-slate-800 border-white hover:border-slate-300 hover:scale-[1.02]'}`}
                                >
                                    {item.text}
                                </button>
                            )
                        })}
                    </div>

                </div>
            </div>
        );
    }

    if (gameState === 'complete') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[3rem] text-center text-white">
                <div className="text-9xl mb-6">🎉</div>
                <h2 className="text-4xl font-black mb-2 text-yellow-400">Respect!</h2>
                <p className="text-xl text-slate-300 mb-8">You matched all the words correctly.</p>
                <div className="bg-white/10 p-6 rounded-3xl mb-8 min-w-[200px]">
                    <span className="block text-sm font-bold opacity-60 uppercase mb-1">Final Score</span>
                    <span className="text-5xl font-black">{score}</span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={initGame}
                        className="px-8 py-4 bg-green-500 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-lg shadow-green-500/30"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={() => router.push('/portal/games')}
                        className="px-8 py-4 bg-white/10 rounded-2xl font-black text-lg hover:bg-white/20 transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
