'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { QUIZ_LEVELS, questionFor } from '@/lib/games/island-quiz-data';

interface GameProps {
    onComplete?: (score: number) => void;
}

const ROUND_LENGTH = 8;

export default function IslandQuizQuest({ onComplete }: GameProps) {
    const [started, setStarted] = useState(false);
    const [level, setLevel] = useState(1);
    const [answered, setAnswered] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [locked, setLocked] = useState(false);
    const [picked, setPicked] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const question = questionFor(level);

    function begin(nextLevel = 1) {
        setStarted(true);
        setLevel(nextLevel);
        setAnswered(0);
        setScore(0);
        setStreak(0);
        setLocked(false);
        setPicked(null);
        setDone(false);
    }

    function choose(option: string) {
        if (!started || locked || done) return;
        setPicked(option);
        if (option !== question.correct) {
            setStreak(0);
            setScore((current) => Math.max(0, current - 10));
            window.setTimeout(() => setPicked(null), 450);
            return;
        }
        const nextStreak = streak + 1;
        const nextScore = score + 100 + Math.min(nextStreak, 10) * 15;
        const nextAnswered = answered + 1;
        setLocked(true);
        setStreak(nextStreak);
        setScore(nextScore);
        setAnswered(nextAnswered);
        confetti({ particleCount: 36, spread: 50, origin: { y: 0.65 } });
        if (nextAnswered >= ROUND_LENGTH) {
            setDone(true);
            onComplete?.(nextScore);
        }
    }

    function nextQuestion() {
        if (!locked || done) return;
        setLevel((current) => (current % QUIZ_LEVELS) + 1);
        setLocked(false);
        setPicked(null);
    }

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-700 via-violet-700 to-fuchsia-600 p-4 text-white sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-200">Caribbean culture challenge</p>
                    <h2 className="text-3xl font-black">Island Quiz Quest</h2>
                </div>
                <div className="flex gap-2 text-center text-sm font-black">
                    <Stat label="Level" value={`${((level - 1) % QUIZ_LEVELS) + 1}/${QUIZ_LEVELS}`} />
                    <Stat label="Score" value={score} />
                    <Stat label="Streak" value={streak} />
                </div>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-amber-300" style={{ width: `${(answered / ROUND_LENGTH) * 100}%` }} />
            </div>

            <div className="rounded-3xl bg-white/10 p-4 sm:p-6">
                <p className="text-xs font-black tracking-widest text-amber-200">{question.label}</p>
                <p className="mt-1 text-sm font-bold text-indigo-100">{question.flag} {question.island}</p>
                {question.label === 'ISLAND FLAG' && (
                    <p className="my-3 text-center text-7xl" aria-hidden>{question.flag}</p>
                )}
                <h3 className="mt-2 text-2xl font-black leading-tight">{question.question}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {question.options.map((option) => {
                        const correct = locked && option === question.correct;
                        const wrong = picked === option && option !== question.correct;
                        return (
                            <button
                                key={option}
                                type="button"
                                className={`min-h-[64px] cursor-pointer rounded-2xl px-4 text-left text-lg font-black touch-manipulation ${correct ? 'bg-emerald-300 text-slate-900' : wrong ? 'bg-rose-400 text-white' : 'bg-white text-slate-900'}`}
                                style={{ touchAction: 'manipulation' }}
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    choose(option);
                                }}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                {locked && !done && (
                    <div className="mt-4 rounded-2xl bg-black/25 p-4">
                        <p className="font-black">Passport stamp earned!</p>
                        <p className="mt-1 text-sm text-indigo-100">{question.detail}</p>
                        <button
                            type="button"
                            className="mt-3 min-h-[56px] w-full cursor-pointer rounded-2xl bg-amber-300 font-black text-slate-900 touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                nextQuestion();
                            }}
                        >
                            Next island challenge
                        </button>
                    </div>
                )}
            </div>

            {!started && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/70 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center text-slate-900">
                        <p className="text-5xl">🏝️</p>
                        <h2 className="mt-2 text-3xl font-black">Island Quiz Quest</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Match each island with its foods, wildlife, flags and cultural treasures.
                        </p>
                        <button
                            type="button"
                            className="mt-4 min-h-[64px] w-full cursor-pointer rounded-2xl bg-indigo-600 text-lg font-black text-white touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                begin(1);
                            }}
                        >
                            Start quiz
                        </button>
                    </div>
                </div>
            )}

            {done && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/70 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center text-slate-900">
                        <p className="text-5xl">🎖️</p>
                        <h2 className="mt-2 text-3xl font-black">Quest complete!</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Eight stamps collected. Every island question stays open for another round.
                        </p>
                        <p className="mt-3 text-4xl font-black text-indigo-600">{score}</p>
                        <button
                            type="button"
                            className="mt-4 min-h-[64px] w-full cursor-pointer rounded-2xl bg-indigo-600 text-lg font-black text-white touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                begin((level % QUIZ_LEVELS) + 1);
                            }}
                        >
                            Play again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="min-w-[72px] rounded-2xl bg-white/15 px-2 py-1">
            <div className="text-[10px] uppercase text-indigo-100">{label}</div>
            <div>{value}</div>
        </div>
    );
}
