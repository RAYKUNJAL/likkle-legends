
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, BookOpen, Mic, Music, Palette, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

const CREATION_STEPS = [
    { id: 'concept', icon: BookOpen, title: "Story Idea", desc: "What's it about?" },
    { id: 'character', icon: Palette, title: "Hero", desc: "Who is the star?" },
    { id: 'style', icon: Wand2, title: "Vibe", desc: "Pick a style" },
];

const STYLE_OPTIONS = [
    { id: 'folklore', name: 'Caribbean Folklore', emoji: '🕷️', color: 'from-orange-400 to-red-500' },
    { id: 'scifi', name: 'Afro-Futurism', emoji: '🚀', color: 'from-purple-500 to-blue-600' },
    { id: 'nature', name: 'Island Nature', emoji: '🌺', color: 'from-green-400 to-emerald-600' },
];

import InteractiveReader from '../InteractiveReader';

export default function StoryStudioWizard() {
    const [step, setStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedStory, setGeneratedStory] = useState<any>(null);
    const [formData, setFormData] = useState({
        topic: '',
        heroName: '',
        heroType: '',
        style: 'folklore'
    });

    const handleNext = () => {
        if (step < CREATION_STEPS.length - 1) setStep(s => s + 1);
        else startGeneration();
    };

    const startGeneration = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/story/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success && data.story) {
                // Map API response to Reader format
                const readerPages = data.story.pages.map((p: any) => ({
                    text: p.text,
                    imageUrl: p.imagePrompt ? `/api/placeholder?prompt=${encodeURIComponent(p.imagePrompt)}` : undefined, // Placeholder for now
                    // Audio would be generated in a real async pipeline
                }));

                setGeneratedStory({
                    ...data.story,
                    pages: readerPages
                });
            } else {
                alert("Story generation failed: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Something went wrong!");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section className="py-16 bg-[#FFFBF5] text-orange-950 font-sans selection:bg-orange-200">
            {/* ═══ Header - Embedded Section Header ═══ */}
            <header className="sticky top-[80px] h-20 bg-white/80 backdrop-blur-md border-b border-orange-100 z-40 flex items-center justify-between px-6 lg:px-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Wand2 size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-tight">Story Studio</h1>
                        <p className="text-[10px] uppercase font-bold text-orange-400 tracking-widest">Create Your Legend</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="hidden md:flex items-center gap-2">
                    {CREATION_STEPS.map((s, i) => (
                        <div key={s.id} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${i === step ? 'bg-orange-100 text-orange-600' : 'text-orange-900/30'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= step ? 'bg-orange-500 text-white' : 'bg-orange-200/50'}`}>
                                {i + 1}
                            </div>
                            <span className="font-bold text-sm">{s.title}</span>
                        </div>
                    ))}
                </div>

                <div className="w-10" /> {/* Spacer */}
            </header>

            {/* ═══ Main Content ═══ */}
            <div className="pt-8 pb-20 px-6 container mx-auto max-w-4xl">
                <AnimatePresence mode="wait">

                    {/* STEP 1: TOPIC */}
                    {step === 0 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl border-4 border-orange-50 text-center"
                        >
                            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-8">
                                <BookOpen size={40} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 text-orange-950">What's your story about?</h2>
                            <p className="text-xl text-orange-900/60 mb-10 max-w-lg mx-auto">
                                Is it about a flying mango? A brave crab? Or maybe a day at the beach?
                            </p>

                            <input
                                type="text"
                                placeholder="e.g. A brave little crab who lost his shell..."
                                className="w-full text-2xl md:text-3xl font-bold placeholder:text-orange-200 border-b-4 border-orange-100 py-4 focus:outline-none focus:border-orange-500 transition-colors text-center bg-transparent"
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                autoFocus
                            />
                        </motion.div>
                    )}

                    {/* STEP 2: HERO */}
                    {step === 1 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl border-4 border-orange-50 text-center"
                        >
                            <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center text-pink-500 mx-auto mb-8">
                                <Palette size={40} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 text-orange-950">Who is the hero?</h2>

                            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
                                <div>
                                    <label className="text-sm font-bold uppercase text-orange-400 tracking-widest mb-2 block">Hero's Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name..."
                                        className="w-full text-2xl font-bold bg-orange-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-orange-200"
                                        value={formData.heroName}
                                        onChange={e => setFormData({ ...formData, heroName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold uppercase text-orange-400 tracking-widest mb-2 block">What are they?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Boy, Girl, Anansi..."
                                        className="w-full text-2xl font-bold bg-orange-50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-orange-200"
                                        value={formData.heroType}
                                        onChange={e => setFormData({ ...formData, heroType: e.target.value })}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: STYLE */}
                    {step === 2 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl border-4 border-orange-50 text-center"
                        >
                            <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-500 mx-auto mb-8">
                                <Sparkles size={40} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-10 text-orange-950">Pick a vibe!</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {STYLE_OPTIONS.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setFormData({ ...formData, style: style.id })}
                                        className={`relative group p-6 rounded-[2rem] border-4 transition-all hover:scale-105 active:scale-95 ${formData.style === style.id
                                            ? 'border-orange-500 bg-orange-50 shadow-xl'
                                            : 'border-orange-100 bg-white hover:border-orange-300'
                                            }`}
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center text-3xl shadow-lg`}>
                                            {style.emoji}
                                        </div>
                                        <h3 className="text-xl font-black text-orange-950 mb-2">{style.name}</h3>
                                        {formData.style === style.id && (
                                            <div className="absolute top-4 right-4 text-orange-500">
                                                <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* ═══ Action Bar ═══ */}
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleNext}
                        disabled={(step === 0 && !formData.topic) || (step === 1 && !formData.heroName)}
                        className="group relative px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-zinc-900 transition-all flex items-center gap-3 active:translate-y-1"
                    >
                        <span>{step === CREATION_STEPS.length - 1 ? 'CREATE STORY 🪄' : 'NEXT STEP'}</span>
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* ═══ Loading Overlay ═══ */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-orange-50/95 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <div className="text-center max-w-sm">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="w-24 h-24 mx-auto mb-8 border-8 border-orange-200 border-t-orange-500 rounded-full"
                            />
                            <h2 className="text-3xl font-black text-orange-950 mb-4">Weaving your Legend...</h2>
                            <p className="text-orange-800/60 font-medium">Tanty Spice is checking the recipe. R.O.T.I. is warming up the visuals.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Generated Story Reader ═══ */}
            <AnimatePresence>
                {generatedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
                    >
                        <InteractiveReader
                            title={generatedStory.title}
                            guide="roti"
                            onClose={() => setGeneratedStory(null)}
                            pages={generatedStory.pages}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
