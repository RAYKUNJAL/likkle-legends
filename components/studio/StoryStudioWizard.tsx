
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, BookOpen, Mic, Music, Palette, CheckCircle2, ChevronRight, Loader2, Laugh, Compass, Moon, Heart, Search, PawPrint, Star } from 'lucide-react';
import { siteContent } from '@/lib/content';

const STYLE_ICONS: Record<string, any> = {
    laugh: Laugh,
    compass: Compass,
    moon: Moon,
    heart: Heart,
    magnifier: Search,
    music: Music,
    paw: PawPrint,
    star: Star
};

const CREATION_STEPS = [
    { id: 'concept', icon: BookOpen, title: "Story Idea", desc: "What's it about?" },
    { id: 'character', icon: Palette, title: "Hero", desc: "Who is the star?" },
    { id: 'style', icon: Wand2, title: "Vibe", desc: "Pick a vibe!" },
    { id: 'voice', icon: Mic, title: "Voice", desc: "Who tells it?" },
];

import dynamic from 'next/dynamic';

const InteractiveReader = dynamic(() => import('../InteractiveReader'), {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={48} /></div>
});

const PREBUILT_PROMPTS = [
    "A flying mango tree that gives super powers",
    "A brave land crab who wants to win a race",
    "Finding a secret treasure in Grandma's garden",
    "A friendly dolphin who knows where the music is"
];

import { useUser } from '@/components/UserContext';

export default function StoryStudioWizard() {
    const { user, tierLevel, isSubscribed } = useUser();
    const [step, setStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [funFactIndex, setFunFactIndex] = useState(0);
    const [generatedStory, setGeneratedStory] = useState<any>(null);
    const [formData, setFormData] = useState({
        topic: '',
        heroName: '',
        heroType: '',
        style: 'friendship_kindness',
        narrator: 'roti'
    });
    const [storyId, setStoryId] = useState<string | null>(null);

    const v2Content = siteContent.ai_story_studio.v2;

    const handleNext = () => {
        if (step < CREATION_STEPS.length - 1) setStep(s => s + 1);
        else startGeneration();
    };

    const startGeneration = async () => {
        if (!user) {
            alert("Please log in to create a story!");
            return;
        }

        const startTime = Date.now();
        setIsGenerating(true);
        setLoadingStep(0);

        // Usage limits are primarily enforced on the server, 
        // but we start the UI loading sequence here
        const stepInterval = setInterval(() => {
            setLoadingStep(s => (s < v2Content.loading_steps.length - 1 ? s + 1 : s));
        }, 1800);

        const factInterval = setInterval(() => {
            setFunFactIndex(i => (i + 1) % v2Content.fun_facts.length);
        }, 4000);

        try {
            const response = await fetch('/api/story/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            // Ensure loading screen stays for at least 2 seconds for UX consistency
            const elapsed = Date.now() - startTime;
            if (elapsed < 2000) {
                await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
            }

            if (data.success && data.story) {
                // Map API response to Reader format
                const readerPages = data.story.pages.map((p: any) => ({
                    text: p.text,
                    imageUrl: p.imageUrl,
                    audioUrl: p.audioUrl
                }));

                setStoryId(data.storyId);
                setGeneratedStory({
                    ...data.story,
                    pages: readerPages
                });
            } else {
                alert(data.error || data.details || "Story generation failed. Using too much magic today?");
            }
        } catch (e) {
            console.error(e);
            alert("Something went wrong!");
        } finally {
            clearInterval(stepInterval);
            clearInterval(factInterval);
            setIsGenerating(false);
        }
    };

    return (
        <div id="story-studio" className="py-24 bg-[#FFFBF5] text-orange-950 font-sans selection:bg-orange-200">
            {/* ═══ Main Content ═══ */}
            <main className="container mx-auto max-w-4xl px-6">
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
                                Type your idea below or pick a quick start prompt!
                            </p>

                            <div className="space-y-8">
                                <input
                                    type="text"
                                    placeholder="e.g. A brave little crab who lost his shell..."
                                    className="w-full text-2xl md:text-3xl font-bold placeholder:text-orange-200 border-b-4 border-orange-100 py-4 focus:outline-none focus:border-orange-500 transition-colors text-center bg-transparent"
                                    value={formData.topic}
                                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    autoFocus
                                />

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Quick Start Ideas:</p>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {PREBUILT_PROMPTS.map(prompt => (
                                            <button
                                                key={prompt}
                                                onClick={() => setFormData({ ...formData, topic: prompt })}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${formData.topic === prompt
                                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg'
                                                    : 'bg-white border-orange-100 text-orange-900/60 hover:border-orange-200'
                                                    }`}
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
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

                    {/* STEP 3: STYLE (VIBE v2) */}
                    {step === 2 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-orange-50 text-center"
                        >
                            <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-500 mx-auto mb-8">
                                <Sparkles size={40} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4 text-orange-950">Pick a vibe!</h2>
                            <p className="text-lg text-orange-900/60 mb-10">How should your story feel today?</p>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {v2Content.vibes.map((vibe) => {
                                    const Icon = STYLE_ICONS[vibe.icon] || Star;
                                    return (
                                        <button
                                            key={vibe.id}
                                            onClick={() => setFormData({ ...formData, style: vibe.id })}
                                            className={`relative group p-4 rounded-3xl border-4 transition-all hover:scale-105 active:scale-95 text-center flex flex-col items-center ${formData.style === vibe.id
                                                ? 'border-orange-500 bg-orange-50 shadow-lg'
                                                : 'border-orange-50 bg-white hover:border-orange-200'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 mb-3 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl`}>
                                                <Icon className={formData.style === vibe.id ? 'text-orange-500' : 'text-orange-200'} size={24} />
                                            </div>
                                            <h3 className="text-sm font-black text-orange-950 mb-1 leading-tight">{vibe.label}</h3>
                                            <p className="text-[10px] text-orange-900/40 font-bold uppercase">{vibe.emoji}</p>

                                            {formData.style === vibe.id && (
                                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 shadow-md">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: NARRATOR (NEW) */}
                    {step === 3 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-orange-50 text-center"
                        >
                            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-8">
                                <Mic size={40} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4 text-orange-950">Who's telling it?</h2>
                            <p className="text-lg text-orange-900/60 mb-10">Pick your favorite island narrator!</p>

                            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                                <button
                                    onClick={() => setFormData({ ...formData, narrator: 'roti' })}
                                    className={`relative group p-6 rounded-[2rem] border-4 transition-all hover:scale-105 active:scale-95 text-center flex flex-col items-center ${formData.narrator === 'roti'
                                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                                        : 'border-orange-50 bg-white hover:border-orange-200'
                                        }`}
                                >
                                    <div className="w-24 h-24 mb-4 rounded-3xl bg-orange-100 flex items-center justify-center text-4xl overflow-hidden border-2 border-white shadow-sm">
                                        <img src="/images/roti-new.jpg" alt="Roti" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-black text-orange-950 mb-1">R.O.T.I.</h3>
                                    <p className="text-xs text-orange-900/40 font-bold uppercase">The Learning Buddy</p>

                                    {formData.narrator === 'roti' && (
                                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-2 shadow-md">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={() => setFormData({ ...formData, narrator: 'tanty_spice' })}
                                    className={`relative group p-6 rounded-[2rem] border-4 transition-all hover:scale-105 active:scale-95 text-center flex flex-col items-center ${formData.narrator === 'tanty_spice'
                                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                                        : 'border-orange-50 bg-white hover:border-orange-200'
                                        }`}
                                >
                                    <div className="w-24 h-24 mb-4 rounded-3xl bg-pink-100 flex items-center justify-center text-4xl overflow-hidden border-2 border-white shadow-sm">
                                        <img src="/images/tanty_spice_avatar.jpg" alt="Tanty Spice" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-black text-orange-950 mb-1">Tanty Spice</h3>
                                    <p className="text-xs text-orange-900/40 font-bold uppercase">Island Wisdom</p>

                                    {formData.narrator === 'tanty_spice' && (
                                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-2 shadow-md">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    )}
                                </button>
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
            </main>

            {/* ═══ Loading Overlay (v2) ═══ */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-orange-50 flex items-center justify-center p-6"
                    >
                        <div className="text-center max-w-lg w-full">
                            {/* Animated R.O.T.I. Building Book */}
                            <div className="relative w-48 h-48 mx-auto mb-12">
                                <motion.div
                                    animate={{
                                        rotateY: [0, 180, 360],
                                        y: [0, -20, 0]
                                    }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="w-full h-full bg-orange-500 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-white text-6xl"
                                >
                                    📖
                                </motion.div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl"
                                >
                                    ✨
                                </motion.div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={loadingStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-8"
                                >
                                    <h2 className="text-3xl font-black text-orange-950 mb-2">
                                        {v2Content.loading_steps[loadingStep].label.replace("R.O.T.I.’s", (formData.narrator === 'tanty_spice' ? "Tanty Spice's" : "R.O.T.I.'s"))}
                                    </h2>
                                    <div className="flex justify-center gap-2">
                                        {v2Content.loading_steps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-2 rounded-full transition-all duration-500 ${i <= loadingStep ? 'w-8 bg-orange-500' : 'w-2 bg-orange-200'}`}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <motion.div
                                key={funFactIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border-2 border-orange-100"
                            >
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Island Fun Fact:</p>
                                <p className="text-xl font-bold text-orange-900 leading-snug">
                                    "{v2Content.fun_facts[funFactIndex]}"
                                </p>
                            </motion.div>
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
                            guide={formData.narrator === 'tanty_spice' ? 'tanty' : 'roti'}
                            onClose={() => setGeneratedStory(null)}
                            pages={generatedStory.pages}
                            storyId={storyId || undefined}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
