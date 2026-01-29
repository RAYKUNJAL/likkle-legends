"use client";

import { useState, useEffect, useRef } from 'react';
import { AnansiGameState, startAnansiGame, submitAnansiAnswer } from '@/app/actions/games';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Volume2, RefreshCw, Trophy } from 'lucide-react';
import { narrateText } from '@/services/geminiService'; // Use our new robust voice service

export default function AnansiGame() {
    const [gameState, setGameState] = useState<AnansiGameState | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState<{ text: string; type: 'success' | 'error' | 'neutral' }[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Audio context for sound effects or speech
    const startRef = useRef<HTMLDivElement>(null);

    const handleStart = async () => {
        setIsLoading(true);
        console.log("[Anansi] Starting game with 15s safety lock...");

        let hasTimedOut = false;
        const timer = setTimeout(() => {
            hasTimedOut = true;
            setIsLoading(false);
            addFeedback("Anansi is slow today... please refresh or try later.", 'error');
            console.error("[Anansi] UI Forced Stop: 15s timeout reached.");
        }, 15000);

        try {
            const state = await startAnansiGame("easy");
            clearTimeout(timer);

            if (hasTimedOut) return; // ignore late response

            setGameState(state);
            addFeedback(state.currentRiddle?.question || "Ready?", 'neutral');
            playSpeech(state.currentRiddle?.question || "");
        } catch (e) {
            clearTimeout(timer);
            console.error(e);
            addFeedback("Something went wrong spinning the web.", 'error');
        } finally {
            if (!hasTimedOut) setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || !gameState) return;

        setIsLoading(true);
        const currentAnswer = input;
        setInput(""); // clear early

        let hasTimedOut = false;
        const timer = setTimeout(() => {
            hasTimedOut = true;
            setIsLoading(false);
            addFeedback("Anansi got tangled in the web. Try again!", 'error');
            console.error("[Anansi] Submit Forced Stop: 15s timeout.");
        }, 15000);

        try {
            const result = await submitAnansiAnswer(gameState, currentAnswer);
            clearTimeout(timer);

            if (hasTimedOut) return;

            // Add feedback
            addFeedback(result.feedback, result.isCorrect ? 'success' : 'error');
            playSpeech(result.feedback);

            if (result.isCorrect) {
                // Wait for feedback reading then update state
                setTimeout(() => {
                    setGameState(result.newState);
                    if (result.newState.isComplete) {
                        playSpeech("We reach the top! You are a Legend for true!");
                    } else if (result.newState.currentRiddle) {
                        // Queue next riddle
                        setTimeout(() => {
                            addFeedback(result.newState.currentRiddle!.question, 'neutral');
                            playSpeech(result.newState.currentRiddle!.question);
                        }, 2000);
                    }
                }, 2000);
            }
        } catch (e) {
            clearTimeout(timer);
            console.error(e);
            addFeedback("The web got tangled. Try again.", 'error');
        } finally {
            if (!hasTimedOut) setIsLoading(false);
        }
    };

    const addFeedback = (text: string, type: 'success' | 'error' | 'neutral') => {
        setFeedbacks(prev => [...prev.slice(-2), { text, type }]); // Keep last 3
    };

    const playSpeech = async (text: string) => {
        if (!text) return;
        try {
            setIsSpeaking(true);
            const buffer = await narrateText(text);
            if (buffer) {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => setIsSpeaking(false);
                source.start(0);
            } else {
                setIsSpeaking(false);
            }
        } catch (e) {
            console.warn("Speech failed", e);
            setIsSpeaking(false);
        }
    };

    if (!gameState) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white rounded-[3rem]">
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center mb-4 relative">
                    <span className="text-8xl">🕷️</span>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-dashed border-white/20 rounded-full"
                    />
                </div>
                <div>
                    <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight mb-4 text-orange-400">
                        Anansi's Web v2.2
                    </h1>
                    <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto">
                        Help Anansi the Spider climb to the top of the mango tree! Solve the riddles to spin the web higher.
                    </p>
                </div>
                <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="group relative px-12 py-6 bg-orange-500 hover:bg-orange-400 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    {isLoading ? "Spinning..." : "Start Adventure!"}
                    <Sparkles className="absolute top-2 right-4 text-orange-200 animate-pulse" />
                </button>
            </div>
        );
    }

    if (gameState.isComplete) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-blue-400 to-green-400 text-white rounded-[3rem]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    className="text-9xl mb-4"
                >
                    🏆
                </motion.div>
                <h1 className="text-5xl font-black text-yellow-300 drop-shadow-lg">You Did It!</h1>
                <p className="text-2xl font-bold">Anansi reached the top safely!</p>
                <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-xl">Score: <span className="font-black text-yellow-300">{gameState.score}</span></p>
                </div>
                <button
                    onClick={() => setGameState(null)}
                    className="px-8 py-4 bg-white text-green-600 rounded-2xl font-black hover:scale-105 transition-transform"
                >
                    Play Again
                </button>
            </div>
        );
    }

    // Determine Anansi's position based on level (1, 2, 3) -> 10%, 50%, 90%
    const webHeight = `${gameState.level * 33}%`;

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 bg-slate-900 rounded-[3rem] overflow-hidden relative">
            {/* Left: The Web Visual */}
            <div className="flex-1 bg-slate-800/50 rounded-[2.5rem] relative overflow-hidden border-4 border-slate-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                {/* The Web Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 -translate-x-1/2"></div>

                {/* Anansi Character */}
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 text-6xl z-10 filter drop-shadow-lg cursor-pointer"
                    animate={{ bottom: webHeight }}
                    transition={{ type: "spring", stiffness: 50 }}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    onClick={() => playSpeech("Eh heh! Don't tickle me!")}
                >
                    🕷️
                </motion.div>

                {/* Level Markers */}
                {[1, 2, 3].map(lvl => (
                    <div key={lvl} className="absolute left-2 text-xs font-bold text-slate-500" style={{ bottom: `${lvl * 33}%` }}>
                        Level {lvl}
                    </div>
                ))}
            </div>

            {/* Right: Interaction Area */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Chat/Riddle Area */}
                <div className="flex-1 bg-white rounded-[2.5rem] p-6 shadow-xl flex flex-col overflow-y-auto min-h-[300px]">
                    <div className="flex-1 space-y-4">
                        <AnimatePresence>
                            {feedbacks.map((fb, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`p-4 rounded-2xl max-w-[90%] ${fb.type === 'neutral' ? 'bg-orange-100 text-orange-900 self-start rounded-tl-none' :
                                        fb.type === 'success' ? 'bg-green-100 text-green-800 self-start' :
                                            'bg-red-50 text-red-800 self-start'
                                        }`}
                                >
                                    <p className="font-bold text-lg">{fb.text}</p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isSpeaking && (
                            <div className="flex gap-1 items-center px-4 py-2 bg-slate-100 rounded-full self-start w-fit">
                                <Volume2 size={16} className="text-slate-400" />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white p-2 rounded-[2rem] shadow-lg flex items-center gap-2 border-4 border-orange-200">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Type your answer..."
                        className="flex-1 px-6 py-4 bg-transparent outline-none text-xl font-bold text-slate-800 placeholder:text-slate-300"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !input.trim()}
                        className="w-14 h-14 bg-orange-500 hover:bg-orange-400 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 shadow-md active:scale-90"
                    >
                        {isLoading ? <RefreshCw className="animate-spin" /> : <Send size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
