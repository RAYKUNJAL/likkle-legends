"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flag, Map as MapIcon, Star, CheckCircle2,
    Lock, Sparkles, ChevronRight, X, Play,
    Camera, Music, Utensils, BookOpen, Heart
} from 'lucide-react';
import { QUESTS } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface IslandMissionMapProps {
    onComplete?: (points: number, questId: string) => void;
    completedIds?: string[];
}

export const IslandMissionMap: React.FC<IslandMissionMapProps> = ({ onComplete, completedIds = [] }) => {
    const [selectedQuest, setSelectedQuest] = useState<any>(null);
    const [isCelebrating, setIsCelebrating] = useState(false);

    const handleComplete = (quest: any) => {
        if (onComplete) {
            onComplete(quest.rewardPoints, quest.id);
            setIsCelebrating(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                setIsCelebrating(false);
                setSelectedQuest(null);
            }, 3000);
        }
    };

    // Helper to get iconography for categories
    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'nature': return <Utensils className="text-emerald-500" />;
            case 'culture': return <Music className="text-orange-500" />;
            case 'food': return <Utensils className="text-amber-500" />;
            case 'language': return <BookOpen className="text-blue-500" />;
            default: return <Star className="text-yellow-500" />;
        }
    };

    return (
        <div className="relative w-full min-h-[600px] bg-sky-50 rounded-[4rem] p-8 md:p-12 overflow-hidden border-8 border-white shadow-2xl">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/20 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200/20 blur-3xl rounded-full -ml-32 -mb-32" />

            <header className="relative z-10 mb-12 text-center">
                <h2 className="text-5xl font-black text-slate-800 tracking-tight mb-2">My Journey Map</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Unlock milestones and earn cultural XP</p>

                <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="bg-white px-6 py-2 rounded-full shadow-md flex items-center gap-2 border border-slate-100">
                        <TrophyIcon className="text-yellow-500" size={18} />
                        <span className="font-black text-slate-700">{completedIds.length} / {QUESTS.length} Done</span>
                    </div>
                </div>
            </header>

            {/* The Map Trail */}
            <div className="relative z-10 max-w-4xl mx-auto py-20 px-10">
                {/* SVG Connecting Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 800 400">
                    <motion.path
                        d="M 100 200 Q 250 50 400 200 T 700 200"
                        fill="none"
                        stroke="#3ABEF9"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="20 30"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                </svg>

                <div className="flex flex-wrap justify-center gap-16 md:gap-24 relative">
                    {QUESTS.map((quest, index) => {
                        const isCompleted = completedIds.includes(quest.id);
                        const isLocked = index > 0 && !completedIds.includes(QUESTS[index - 1].id);

                        // Alternate positions
                        const yOffset = index % 2 === 0 ? '-translate-y-12' : 'translate-y-12';

                        return (
                            <div key={quest.id} className={`relative group ${yOffset}`}>
                                {isCompleted && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full z-20 shadow-lg border-2 border-white"
                                    >
                                        <CheckCircle2 size={24} />
                                    </motion.div>
                                )}

                                <motion.button
                                    whileHover={!isLocked ? { scale: 1.1, rotate: 5 } : {}}
                                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                                    onClick={() => !isLocked && setSelectedQuest(quest)}
                                    className={`relative w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] flex flex-col items-center justify-center transition-all ${isCompleted
                                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-xl shadow-green-200'
                                            : isLocked
                                                ? 'bg-slate-200 opacity-50 grayscale cursor-not-allowed'
                                                : 'bg-white shadow-2xl hover:shadow-primary/20 ring-4 ring-white'
                                        }`}
                                >
                                    <span className="text-5xl md:text-6xl mb-2">{quest.icon}</span>
                                    {isLocked && <Lock className="absolute inset-0 m-auto text-slate-400 opacity-50" size={40} />}
                                </motion.button>

                                <div className="mt-6 text-center">
                                    <p className={`font-black text-sm uppercase tracking-tighter ${isLocked ? 'text-slate-300' : 'text-slate-800'}`}>
                                        {quest.title}
                                    </p>
                                    {!isLocked && !isCompleted && (
                                        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-primary">
                                            <Sparkles size={10} />
                                            <span>READY</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mission Detail Modal */}
            <AnimatePresence>
                {selectedQuest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl relative border-8 border-white"
                        >
                            <button
                                onClick={() => setSelectedQuest(null)}
                                className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors z-20"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-12 text-center">
                                <span className="text-9xl mb-8 block animate-bounce-slow">{selectedQuest.icon}</span>

                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-sky-100">
                                    {getCategoryIcon(selectedQuest.category)}
                                    {selectedQuest.category} MISSION
                                </div>

                                <h3 className="text-4xl font-black text-slate-800 mb-4">{selectedQuest.title}</h3>
                                <p className="text-slate-500 font-bold text-lg mb-10 leading-relaxed px-4">
                                    "{selectedQuest.description}"
                                </p>

                                <div className="bg-slate-50 rounded-[2.5rem] p-8 text-left mb-10 border-2 border-slate-100">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Steps to finish:</h4>
                                    <div className="space-y-4">
                                        {selectedQuest.steps.map((step: string, i: number) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary font-black flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-slate-600 font-bold leading-tight pt-1">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {completedIds.includes(selectedQuest.id) ? (
                                    <div className="w-full bg-emerald-50 text-emerald-600 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 border-4 border-emerald-100">
                                        <CheckCircle2 size={24} /> Mission Completed!
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleComplete(selectedQuest)}
                                        disabled={isCelebrating}
                                        className="w-full bg-gradient-to-r from-primary to-accent text-white py-6 rounded-3xl font-black text-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                                    >
                                        {isCelebrating ? (
                                            <motion.div initial={{ y: 40 }} animate={{ y: 0 }}>
                                                ✨ YOU DID IT! +{selectedQuest.rewardPoints} XP
                                            </motion.div>
                                        ) : (
                                            <>
                                                I COMPLETED IT! <Sparkles />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Simple Trophy Icon component since Lucide might vary
const TrophyIcon = ({ size, className }: { size: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);
