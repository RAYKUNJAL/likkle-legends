"use client";

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Trophy, Lightbulb, CheckCircle2, XCircle, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

type Pair = {
    patois: string;
    english: string;
    hint: string;
    example: string;
};

const WORD_PAIRS: Pair[] = [
    { patois: 'Pickney', english: 'Child', hint: 'A young person', example: 'The pickney is reading a story.' },
    { patois: 'Wha Gwan', english: "What\'s up?", hint: 'A greeting', example: 'Wha gwan, friend?' },
    { patois: 'Big Up', english: 'Respect', hint: 'Showing appreciation', example: 'Big up to your teacher for helping.' },
    { patois: 'Irie', english: 'Good/Fine', hint: 'Everything is alright', example: 'Today is irie and sunny.' },
    { patois: 'Likkle', english: 'Little', hint: 'Small in size', example: 'I found a likkle shell on the beach.' },
    { patois: 'Tallawah', english: 'Strong', hint: 'Mighty despite size', example: 'She is tallawah and brave.' },
    { patois: 'Bashment', english: 'Party', hint: 'A really good time', example: 'The music bashment starts tonight.' },
    { patois: 'Bredren', english: 'Friend', hint: 'A close buddy', example: 'My bredren helped me study.' },
    { patois: 'Nyam', english: 'Eat', hint: 'To consume food', example: 'Time to nyam lunch.' },
    { patois: 'Duppy', english: 'Ghost', hint: 'A spirit story word', example: 'The story had a friendly duppy.' },
    { patois: 'Yard', english: 'Home', hint: 'House or home country', example: 'We are going back to yard.' },
    { patois: 'Vex', english: 'Angry', hint: 'Upset about something', example: 'Do not stay vex, take a breath.' },
];

type Choice = { id: string; text: string };

function pickRandomPairs(count: number) {
    return [...WORD_PAIRS].sort(() => Math.random() - 0.5).slice(0, count);
}

export default function PatoisWizard({ onComplete }: { onComplete?: (score: number, correct: number, total: number) => void }) {
    const router = useRouter();
    const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
    const [pairCount, setPairCount] = useState(6);

    const [roundPairs, setRoundPairs] = useState<Pair[]>([]);
    const [leftCol, setLeftCol] = useState<Choice[]>([]);
    const [rightCol, setRightCol] = useState<Choice[]>([]);

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matchedIds, setMatchedIds] = useState<string[]>([]);

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeHint, setActiveHint] = useState<string>('Match each Patois word to the right meaning.');

    const accuracy = useMemo(() => {
        if (attempts === 0) return 100;
        return Math.round((matchedIds.length / attempts) * 100);
    }, [attempts, matchedIds.length]);

    const initGame = (count = pairCount) => {
        const chosen = pickRandomPairs(count);
        setRoundPairs(chosen);

        setLeftCol(chosen.map((p) => ({ id: p.patois, text: p.patois })).sort(() => Math.random() - 0.5));
        setRightCol(chosen.map((p) => ({ id: p.patois, text: p.english })).sort(() => Math.random() - 0.5));

        setMatchedIds([]);
        setScore(0);
        setStreak(0);
        setAttempts(0);
        setSelectedLeft(null);
        setSelectedRight(null);
        setFeedback(null);
        setActiveHint('Match each Patois word to the right meaning.');
        setGameState('playing');
    };

    const evaluateMatch = (leftId: string, rightId: string) => {
        const pair = roundPairs.find((p) => p.patois === leftId);
        setAttempts((prev) => prev + 1);

        if (leftId === rightId) {
            const bonus = streak * 10;
            const earned = 100 + bonus;
            const nextMatched = matchedIds.length + 1;

            setMatchedIds((prev) => [...prev, leftId]);
            setScore((prev) => prev + earned);
            setStreak((prev) => prev + 1);
            setFeedback({
                type: 'success',
                text: `${pair?.patois} = ${pair?.english}. ${pair?.example || ''}`,
            });
            setActiveHint(pair?.hint || 'Great match.');
            confetti({ particleCount: 20, spread: 35, origin: { y: 0.6 } });

            if (nextMatched === roundPairs.length) {
                setTimeout(() => {
                    setGameState('complete');
                    if (onComplete) onComplete(score + earned, nextMatched, roundPairs.length);
                }, 700);
            }
        } else {
            setStreak(0);
            setFeedback({
                type: 'error',
                text: `Not quite. Hint: ${pair?.hint || 'Try again.'}`,
            });
            setActiveHint(pair?.hint || 'Try another meaning.');
        }

        setTimeout(() => {
            setSelectedLeft(null);
            setSelectedRight(null);
        }, 500);
    };

    const handleSelect = (id: string, side: 'left' | 'right') => {
        if (matchedIds.includes(id)) return;

        const newLeft = side === 'left' ? id : selectedLeft;
        const newRight = side === 'right' ? id : selectedRight;

        if (side === 'left') setSelectedLeft(id);
        if (side === 'right') setSelectedRight(id);

        if (newLeft && newRight) {
            evaluateMatch(newLeft, newRight);
        }
    };

    if (gameState === 'start') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-[3rem] text-center text-slate-900 shadow-2xl">
                <div className="bg-white p-8 rounded-[3rem] shadow-xl max-w-xl w-full">
                    <h1 className="text-4xl font-black mb-3 tracking-tight">Patois Word Wizard</h1>
                    <p className="text-slate-600 mb-5 font-bold">Learning Goal: build Caribbean vocabulary for everyday conversation.</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => {
                                setPairCount(6);
                                initGame(6);
                            }}
                            className="py-4 bg-black text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform"
                        >
                            Quick Learn (6)
                        </button>
                        <button
                            onClick={() => {
                                setPairCount(8);
                                initGame(8);
                            }}
                            className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform"
                        >
                            Full Lesson (8)
                        </button>
                    </div>

                    <button
                        onClick={() => router.push('/portal/games')}
                        className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600"
                    >
                        <ArrowLeft size={16} /> Back to Hub
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        return (
            <div className="h-full bg-slate-100 rounded-[3rem] p-6 md:p-8 flex flex-col overflow-hidden relative">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setGameState('start')}
                        className="p-2 hover:bg-slate-100 rounded-xl"
                        aria-label="Back to Start"
                        title="Back to Start"
                    >
                        <ArrowLeft color="black" />
                    </button>
                    <div className="font-black text-slate-800 text-sm md:text-base">
                        Matches: {matchedIds.length}/{leftCol.length}
                    </div>
                    <div className="flex items-center gap-3 text-sm md:text-base">
                        <div className="font-black text-green-600 flex items-center gap-1">
                            <Trophy size={16} /> {score}
                        </div>
                        <div className="font-black text-blue-600 flex items-center gap-1">
                            <Target size={16} /> {accuracy}%
                        </div>
                    </div>
                </div>

                <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="font-black text-amber-700 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Lightbulb size={14} /> Learning Tip
                    </p>
                    <p className="font-bold text-amber-900">{activeHint}</p>
                </div>

                {feedback && (
                    <div className={`mb-5 p-4 rounded-2xl border ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                        <p className="font-black flex items-center gap-2">
                            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />} {feedback.text}
                        </p>
                    </div>
                )}

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto w-full items-start overflow-y-auto">
                    <div className="space-y-3">
                        <p className="text-center font-black text-green-700 uppercase tracking-widest mb-2">Patois</p>
                        {leftCol.map((item) => {
                            const isSelected = selectedLeft === item.id;
                            const isMatched = matchedIds.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    disabled={isMatched}
                                    onClick={() => handleSelect(item.id, 'left')}
                                    className={`w-full p-5 rounded-2xl font-bold text-lg shadow-sm transition-all border-2 ${isMatched ? 'bg-green-100 border-green-400 text-green-700 opacity-60' : isSelected ? 'bg-black text-white border-black scale-[1.01]' : 'bg-white text-slate-800 border-white hover:border-slate-300'}`}
                                >
                                    {item.text}
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-3">
                        <p className="text-center font-black text-blue-700 uppercase tracking-widest mb-2">Meaning</p>
                        {rightCol.map((item) => {
                            const isSelected = selectedRight === item.id;
                            const isMatched = matchedIds.includes(item.id);
                            return (
                                <button
                                    key={item.text}
                                    disabled={isMatched}
                                    onClick={() => handleSelect(item.id, 'right')}
                                    className={`w-full p-5 rounded-2xl font-bold text-lg shadow-sm transition-all border-2 ${isMatched ? 'bg-green-100 border-green-400 text-green-700 opacity-60' : isSelected ? 'bg-blue-600 text-white border-blue-600 scale-[1.01]' : 'bg-white text-slate-800 border-white hover:border-slate-300'}`}
                                >
                                    {item.text}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[3rem] text-center text-white">
            <h2 className="text-4xl font-black mb-2 text-yellow-400">Respect!</h2>
            <p className="text-lg text-slate-300 mb-8">You completed the vocabulary challenge.</p>
            <div className="bg-white/10 p-6 rounded-3xl mb-8 min-w-[260px] space-y-2">
                <p className="text-sm font-bold opacity-60 uppercase">Final Score</p>
                <p className="text-5xl font-black">{score}</p>
                <p className="font-bold text-cyan-300">Accuracy: {accuracy}%</p>
                <p className="text-sm text-slate-300">Words mastered: {matchedIds.length}/{roundPairs.length}</p>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={() => initGame(pairCount)}
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
