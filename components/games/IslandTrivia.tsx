"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowLeft, Map, CheckCircle2, Lock, Play, ChevronRight, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

// ==========================================
// DATA: ISLANDS & QUESTIONS
// ==========================================

const ISLANDS = [
    {
        id: 'jamaica',
        name: 'Jamaica',
        flag: '🇯🇲',
        color: 'from-green-500 to-yellow-500',
        description: 'Land of Wood and Water',
        questions: [
            { q: "What is the national fruit of Jamaica?", options: ["Ackee", "Mango", "Banana", "Pineapple"], a: 0, fact: "Ackee is delicious with Saltfish!" },
            { q: "Who is the fastest man in the world from Jamaica?", options: ["Bob Marley", "Usain Bolt", "Shaggy", "Koffee"], a: 1, fact: "Usain Bolt holds the world record for 100m!" },
            { q: "What is the capital city of Jamaica?", options: ["Montego Bay", "Kingston", "Negril", "Ocho Rios"], a: 1, fact: "Kingston is the heartbeat of Jamaica!" },
            { q: "Which music genre started in Jamaica?", options: ["Reggae", "Jazz", "Pop", "Rock"], a: 0, fact: "Reggae is loved all over the world!" },
            { q: "What do Jamaicans say for 'Running fast'?", options: ["Wheel and come again", "Small up yuhself", "Run like lightning", "Leggo beast"], a: 2, fact: "Jamaicans are known for speed!" }
        ]
    },
    {
        id: 'trinidad',
        name: 'Trinidad & Tobago',
        flag: '🇹🇹',
        color: 'from-red-600 to-black',
        description: 'Home of Carnival & Steel Pan',
        questions: [
            { q: "Which instrument was invented in Trinidad?", options: ["Guitar", "Piano", "Steel Pan", "Drums"], a: 2, fact: "Steel Pan is made from oil drums!" },
            { q: "What is the big festival called?", options: ["Christmas", "Carnival", "Easter", "Harvest"], a: 1, fact: "Trinidad Carnival is the biggest party on earth!" },
            { q: "What is a 'Doubles'?", options: ["A dance", "A delicious snack", "A game", "Two people"], a: 1, fact: "Doubles is curry channa inside fried barra!" },
            { q: "What is the capital of Trinidad?", options: ["San Fernando", "Port of Spain", "Arima", "Tobago"], a: 1, fact: "Port of Spain is a bustling city!" }
        ]
    },
    {
        id: 'barbados',
        name: 'Barbados',
        flag: '🇧🇧',
        color: 'from-blue-500 to-yellow-400',
        description: 'Gem of the Caribbean Sea',
        questions: [
            { q: "What is the national fish of Barbados?", options: ["Flying Fish", "Shark", "Tuna", "Salmon"], a: 0, fact: "Flying fish can glide over the water!" },
            { q: "Calls Barbados home?", options: ["Rihanna", "Beyonce", "Drake", "Bob Marley"], a: 0, fact: "Rihanna is a national hero of Barbados!" },
            { q: "What is the capital city?", options: ["Bridgetown", "Holetown", "Oistins", "Speightstown"], a: 0, fact: "Bridgetown is a UNESCO World Heritage site!" }
        ]
    },
    {
        id: 'st_lucia',
        name: 'St. Lucia',
        flag: '🇱🇨',
        color: 'from-cyan-400 to-blue-600',
        description: 'The Helen of the West',
        questions: [
            { q: "What are the famous twin peaks called?", options: ["The Pitons", "The Alps", "The Rockies", "The Hills"], a: 0, fact: "The Pitons are a symbol of St. Lucia!" },
            { q: "What is the capital of St. Lucia?", options: ["Vieux Fort", "Castries", "Soufriere", "Gros Islet"], a: 1, fact: "Castries has a colorful market!" },
            { q: "What color is the triangle on the flag?", options: ["Red", "Blue", "Black & Yellow", "Green"], a: 2, fact: "The flag represents the sky, sea, and Pitons!" }
        ]
    },
    {
        id: 'bahamas',
        name: 'The Bahamas',
        flag: '🇧🇸',
        color: 'from-cyan-400 to-yellow-300',
        description: '700 Islands of Paradise',
        questions: [
            { q: "What animal swims in the sea in Exuma?", options: ["Pigs", "Cats", "Dogs", "Horses"], a: 0, fact: "The swimming pigs are world famous!" },
            { q: "What is the capital city?", options: ["Freeport", "Nassau", "Andros", "Bimini"], a: 1, fact: "Nassau is on the island of New Providence!" },
            { q: "What currency is used?", options: ["Dollar", "Euro", "Pound", "Yen"], a: 0, fact: "The Bahamian dollar is equal to the US dollar!" }
        ]
    }
];

// ==========================================
// COMPONENT
// ==========================================

export default function IslandTrivia({
    onComplete,
    initialQuestions,
    title
}: {
    onComplete?: (score: number, correct: number, total: number) => void,
    initialQuestions?: any[],
    title?: string
}) {
    const router = useRouter();
    const [view, setView] = useState<'map' | 'game' | 'complete'>(initialQuestions ? 'game' : 'map');
    const [selectedIsland, setSelectedIsland] = useState<any>(initialQuestions ? {
        name: title || 'Island Trivia',
        questions: initialQuestions,
        id: 'dynamic',
        flag: '✨',
        color: 'from-amber-400 to-orange-500'
    } : null);
    const [completedIslands, setCompletedIslands] = useState<string[]>([]);

    // Game State
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);

    // -- ACTIONS --

    const startIsland = (island: typeof ISLANDS[0]) => {
        if (completedIslands.includes(island.id)) {
            // Replay?
        }
        setSelectedIsland(island);
        setQIndex(0);
        setShowResult(false);
        setSelectedOption(null);
        setView('game');
    };

    const handleAnswer = (optionIndex: number) => {
        if (!selectedIsland || showResult) return;

        const question = selectedIsland.questions[qIndex];
        const correct = optionIndex === question.a;

        setSelectedOption(optionIndex);
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setScore(prev => prev + 100 + (streak * 20));
            setStreak(prev => prev + 1);
            if (streak > 0 && streak % 3 === 0) {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }
        } else {
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (!selectedIsland) return;

        if (qIndex < selectedIsland.questions.length - 1) {
            setQIndex(prev => prev + 1);
            setShowResult(false);
            setSelectedOption(null);
        } else {
            // Island Complete
            completeIsland();
        }
    };

    const completeIsland = () => {
        if (!selectedIsland) return;

        const isNew = !completedIslands.includes(selectedIsland.id);
        if (isNew) {
            setCompletedIslands(prev => [...prev, selectedIsland.id]);
        }

        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        setView('complete');
    };

    const returnToMap = () => {
        setView('map');
        setSelectedIsland(null);
    };

    // -- RENDERERS --

    if (view === 'map') {
        return (
            <div className="h-full bg-sky-900 rounded-[3rem] overflow-hidden relative flex flex-col">
                {/* Map Background visual */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]"></div>

                <header className="relative z-10 p-8 flex justify-between items-center bg-black/20 backdrop-blur-sm">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Island Trivia Map 🗺️</h1>
                        <p className="text-sky-200">Conquer all the islands to become a Caribbean Master!</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/20">
                            <Trophy className="text-yellow-400" />
                            <span className="text-2xl font-black text-white">{completedIslands.length}/{ISLANDS.length}</span>
                        </div>
                        <div className="bg-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/20">
                            <Star className="text-amber-400" />
                            <span className="text-2xl font-black text-white">{score}</span>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ISLANDS.map((island) => {
                            const isDone = completedIslands.includes(island.id);
                            return (
                                <button
                                    key={island.id}
                                    onClick={() => startIsland(island)}
                                    className={`group relative h-48 rounded-[2.5rem] p-6 text-left transition-all hover:scale-[1.02] overflow-hidden ${isDone ? 'bg-emerald-600 ring-4 ring-emerald-400' : 'bg-white/10 hover:bg-white/20'}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${island.color} opacity-20 group-hover:opacity-30 transition-opacity`} />

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start">
                                            <span className="text-5xl shadow-xl">{island.flag}</span>
                                            {isDone ? (
                                                <div className="bg-white text-emerald-600 p-2 rounded-full shadow-lg">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                            ) : (
                                                <div className="bg-black/30 text-white p-2 rounded-full backdrop-blur-sm">
                                                    <Play size={20} className="ml-1" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white mb-1 group-hover:translate-x-1 transition-transform">{island.name}</h3>
                                            <p className="text-white/60 text-sm font-bold">{isDone ? 'Conquered!' : 'Level 1-5'}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {/* Coming Soon */}
                        <div className="h-48 rounded-[2.5rem] bg-black/20 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/30">
                            <Lock size={32} className="mb-2" />
                            <span className="font-bold">More Islands Soon</span>
                        </div>
                    </div>
                </div>

                <footer className="p-6 text-center text-white/20 font-bold uppercase tracking-widest text-sm relative z-10">
                    <button onClick={() => router.push('/portal/games')} className="hover:text-white transition-colors flex items-center gap-2 mx-auto">
                        <ArrowLeft size={16} /> Exit to Hub
                    </button>
                </footer>
            </div>
        );
    }

    if (view === 'game' && selectedIsland) {
        const question = selectedIsland.questions[qIndex];
        const progress = ((qIndex) / selectedIsland.questions.length) * 100;

        return (
            <div className="h-full bg-slate-900 rounded-[3rem] overflow-hidden flex flex-col relative">
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedIsland.color} opacity-10`} />

                {/* Header */}
                <div className="relative z-10 p-8 flex justify-between items-center">
                    <button onClick={returnToMap} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors">
                        <ArrowLeft />
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">{selectedIsland.name} {selectedIsland.flag}</h2>
                        <div className="w-64 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl text-yellow-400 font-black border border-yellow-500/30">
                        <Star size={18} /> {score}
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 max-w-4xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={qIndex}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="w-full"
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-[3rem] text-center mb-8 shadow-2xl">
                                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                                    {question.q}
                                </h3>
                                <div className="w-16 h-1 bg-white/20 mx-auto rounded-full" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {question.options.map((opt: string, i: number) => {
                                    let stateStyle = "bg-white/5 border-white/10 text-white hover:bg-white/10";
                                    if (showResult) {
                                        if (i === question.a) stateStyle = "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20";
                                        else if (i === selectedOption) stateStyle = "bg-red-500 border-red-400 text-white opacity-50";
                                        else stateStyle = "bg-black/20 border-transparent text-white/30";
                                    }

                                    return (
                                        <button
                                            key={i}
                                            disabled={showResult}
                                            onClick={() => handleAnswer(i)}
                                            className={`p-6 rounded-2xl border-2 font-bold text-xl transition-all active:scale-95 ${stateStyle}`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer / Results */}
                <div className="h-32 p-6 flex justify-center items-center relative z-20">
                    <AnimatePresence>
                        {showResult && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={`w-full max-w-2xl p-4 rounded-2xl flex items-center justify-between shadow-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
                            >
                                <div>
                                    <p className="font-black text-lg">{isCorrect ? 'Correct! 🎉' : 'Oops! Nice try! 🧡'}</p>
                                    <p className="opacity-80 text-sm">{question.fact}</p>
                                </div>
                                <button
                                    onClick={nextQuestion}
                                    className={`px-8 py-3 rounded-xl font-black text-white shadow-lg flex items-center gap-2 ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    if (view === 'complete' && selectedIsland) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[3rem] text-white">
                <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl mb-8 animate-bounce">
                    <Crown size={60} className="text-yellow-800" />
                </div>
                <h2 className="text-5xl font-black mb-4">Island Conquered!</h2>
                <p className="text-2xl text-purple-200 mb-8">You mastered {selectedIsland.name}!</p>
                <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 mb-8 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-white/60 font-bold">Total Score</span>
                        <span className="text-3xl font-black text-yellow-400">{score}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/60 font-bold">XP Earned</span>
                        <span className="text-3xl font-black text-green-400">+{Math.floor(score / 10)}</span>
                    </div>
                </div>
                <button
                    onClick={returnToMap}
                    className="px-12 py-5 bg-gradient-to-r from-primary to-accent rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-transform"
                >
                    Return to Map.
                </button>
            </div>
        );
    }

    return null;
}
