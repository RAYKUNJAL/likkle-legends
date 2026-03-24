"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Sparkles, ChevronRight, Star } from 'lucide-react';
import { CRAFT_ACTIVITIES, type CraftActivity } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface CraftCornerProps {
    completedIds?: string[];
    onComplete?: (xp: number, craftId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    music:   'bg-orange-100 text-orange-700',
    food:    'bg-yellow-100 text-yellow-700',
    nature:  'bg-emerald-100 text-emerald-700',
    culture: 'bg-pink-100 text-pink-700',
    art:     'bg-purple-100 text-purple-700',
};

const DIFFICULTY_LABEL: Record<string, string> = {
    easy:   '⭐ Easy',
    medium: '⭐⭐ Medium',
};

export function CraftCorner({ completedIds = [], onComplete }: CraftCornerProps) {
    const [selected, setSelected] = useState<CraftActivity | null>(null);
    const [celebrating, setCelebrating] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const handleComplete = (craft: CraftActivity) => {
        if (celebrating) return;
        setCelebrating(true);
        confetti({ particleCount: 180, spread: 80, origin: { y: 0.5 } });
        onComplete?.(craft.rewardXp, craft.id);
        setSaveMessage(`Saved! +${craft.rewardXp} XP added.`);
        setTimeout(() => setSaveMessage(null), 2600);
        setTimeout(() => {
            setCelebrating(false);
            setSelected(null);
        }, 2800);
    };

    const totalDone = completedIds.length;
    const totalXpEarned = CRAFT_ACTIVITIES
        .filter((craft) => completedIds.includes(craft.id))
        .reduce((sum, craft) => sum + craft.rewardXp, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            {/* Progress strip */}
            <div className="flex items-center justify-between bg-white rounded-[2rem] px-8 py-5 shadow-lg border-2 border-amber-100">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">🎨</span>
                    <div>
                        <p className="font-black text-blue-900 text-lg leading-none">Craft Corner</p>
                        <p className="text-blue-700/50 text-xs font-bold uppercase tracking-widest mt-1">
                            {totalDone} of {CRAFT_ACTIVITIES.length} crafts completed
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-3">
                    <Star className="text-amber-500" size={18} fill="currentColor" />
                    <span className="font-black text-amber-700 text-sm">{totalXpEarned} XP earned</span>
                </div>
            </div>
            {saveMessage && (
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-700 font-black text-sm">
                    {saveMessage}
                </div>
            )}

            {/* Craft grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {CRAFT_ACTIVITIES.map((craft) => {
                    const done = completedIds.includes(craft.id);
                    return (
                        <motion.button
                            key={craft.id}
                            type="button"
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelected(craft)}
                            className="relative bg-white rounded-[2.5rem] p-6 shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-amber-100 text-left group"
                        >
                            {done && (
                                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white z-10">
                                    <CheckCircle2 size={20} />
                                </div>
                            )}

                            {/* Icon bubble */}
                            <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${craft.color} flex items-center justify-center text-5xl shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                                {craft.icon}
                            </div>

                            <h3 className="font-black text-blue-900 text-xl leading-tight mb-2">{craft.title}</h3>
                            <p className="text-blue-700/60 text-sm font-medium leading-snug mb-4 line-clamp-2">{craft.description}</p>

                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${CATEGORY_COLORS[craft.category]}`}>
                                    {craft.category}
                                </span>
                                <span className="text-xs font-black text-primary flex items-center gap-1">
                                    <Sparkles size={12} />
                                    +{craft.rewardXp} XP
                                </span>
                            </div>

                            <div className="mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {DIFFICULTY_LABEL[craft.difficulty]} · Ages {craft.ageMin}–{craft.ageMax}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Craft detail modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                        onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative border-8 border-white my-8"
                        >
                            {/* Gradient header */}
                            <div className={`bg-gradient-to-br ${selected.color} rounded-t-[2.5rem] p-10 text-center`}>
                                <button
                                    type="button"
                                    onClick={() => setSelected(null)}
                                    className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all"
                                    aria-label="Close"
                                >
                                    <X size={22} />
                                </button>
                                <span className="text-8xl block mb-3">{selected.icon}</span>
                                <h2 className="text-3xl font-black text-white tracking-tight">{selected.title}</h2>
                                <p className="text-white/80 text-sm font-bold mt-2">
                                    Ages {selected.ageMin}–{selected.ageMax} · {DIFFICULTY_LABEL[selected.difficulty]}
                                </p>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-slate-600 font-bold text-base leading-relaxed">{selected.description}</p>

                                {/* Materials */}
                                <div className="bg-amber-50 rounded-[2rem] p-6 border-2 border-amber-100">
                                    <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4">🛍️ You will need:</h4>
                                    <ul className="space-y-2">
                                        {selected.materials.map((m, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Steps */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">📋 How to make it:</h4>
                                    <div className="space-y-3">
                                        {selected.steps.map((step, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${selected.color} text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md`}>
                                                    {i + 1}
                                                </div>
                                                <p className="text-slate-700 font-semibold text-sm leading-snug pt-1.5">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tip */}
                                <div className="bg-sky-50 rounded-[2rem] p-6 border-2 border-sky-100 flex items-start gap-4">
                                    <span className="text-2xl flex-shrink-0">💡</span>
                                    <p className="text-sky-700 font-bold text-sm leading-relaxed">{selected.tip}</p>
                                </div>

                                {/* CTA */}
                                {completedIds.includes(selected.id) ? (
                                    <div className="w-full bg-emerald-50 text-emerald-600 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 border-4 border-emerald-200">
                                        <CheckCircle2 size={28} /> Amazing — Craft Done!
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleComplete(selected)}
                                        disabled={celebrating}
                                        className="w-full bg-gradient-to-r from-primary to-accent text-white py-5 rounded-[2rem] font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {celebrating ? (
                                            <motion.span initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                                ✨ AMAZING! +{selected.rewardXp} XP!
                                            </motion.span>
                                        ) : (
                                            <>I Made It! <Sparkles size={22} /> <ChevronRight size={22} /></>
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
}
