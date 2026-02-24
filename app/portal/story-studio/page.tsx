
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Wand2, BookOpen, Map, Sparkles, ArrowRight, ArrowLeft,
    Check, Star, Brain, ShieldCheck, Rocket, Loader2, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { selectStoryAction } from '@/app/actions/story-database-actions';
import { useUser } from '@/components/UserContext';

type WizardStep = 'tradition' | 'reading-level' | 'island' | 'creating';

interface Selection {
    tradition: string;
    level: string;
    island: string;
}

const TRADITIONS = [
    { id: 'anansi', name: 'Anansi the Spider', origin: 'West Africa → Jamaica', icon: '🕷️', color: 'bg-orange-500', desc: 'The clever trickster who always has a plan.' },
    { id: 'papa_bois', name: 'Papa Bois', origin: 'Trinidad & Tobago', icon: '🌿', color: 'bg-emerald-600', desc: 'The wise guardian of the forest and animals.' },
    { id: 'river_mumma', name: 'River Mumma', origin: 'Guyana & Jamaica', icon: '🧜‍♀️', color: 'bg-blue-500', desc: 'The golden-combed protector of the waters.' },
    { id: 'chickcharney', name: 'Chickcharney', origin: 'The Bahamas', icon: '🦉', color: 'bg-indigo-500', desc: 'The mysterious bird-spirits of Andros Island.' }
];

const LEVELS = [
    { id: 'emergent', name: 'Level 1: Seeds', desc: 'Simple words, short sentences, lots of pictures.', focus: 'Phonics: s, a, t, p, i, n', icon: <Brain className="text-pink-500" /> },
    { id: 'early', name: 'Level 2: Sprouts', desc: 'More words, playful rhymes, and fun tricky words.', focus: 'Phonics: ch, sh, th, ng', icon: <Rocket className="text-blue-500" /> },
    { id: 'transitional', name: 'Level 3: Saplings', desc: 'Longer stories with twists and challenges.', focus: 'Fluency & Inference', icon: <Star className="text-amber-500" /> }
];

const ISLANDS = [
    { id: 'JM', name: 'Jamaica', flag: '🇯🇲' },
    { id: 'TT', name: 'Trinidad & Tobago', flag: '🇹🇹' },
    { id: 'BB', name: 'Barbados', flag: '🇧🇧' },
    { id: 'BS', name: 'Bahamas', flag: '🇧🇸' },
    { id: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
    { id: 'GY', name: 'Guyana', flag: '🇬🇾' },
    { id: 'GD', name: 'Grenada', flag: '🇬🇩' },
    { id: 'KN', name: 'St. Kitts & Nevis', flag: '🇰🇳' },
    { id: 'VC', name: 'St. Vincent & Grenadines', flag: '🇻🇨' },
    { id: 'AG', name: 'Antigua & Barbuda', flag: '🇦🇬' },
    { id: 'DM', name: 'Dominica', flag: '🇩🇲' },
    { id: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
    { id: 'CU', name: 'Cuba', flag: '🇨🇺' },
    { id: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
    { id: 'HT', name: 'Haiti', flag: '🇭🇹' },
    { id: 'SR', name: 'Suriname', flag: '🇸🇷' }
];

export default function StoryStudioPage() {
    const router = useRouter();
    const { activeChild } = useUser();
    const [step, setStep] = useState<WizardStep>('tradition');
    const [selection, setSelection] = useState<Selection>({
        tradition: '',
        level: activeChild?.age_track === 'mini' ? 'emergent' : 'early',
        island: activeChild?.primary_island || 'JM'
    });


    const handleCreate = async () => {
        setStep('creating');

        try {
            const result = await selectStoryAction({
                tradition: selection.tradition,
                level: selection.level,
                island: selection.island,
                childAge: activeChild?.age || 6,
                childName: activeChild?.first_name || 'Little Legend'
            });

            if (result.success && result.story) {
                // Store in session storage for the dynamic reader to pick up
                sessionStorage.setItem('current_story_draft', JSON.stringify(result.story));
                router.push(`/portal/stories/dynamic/session`);
            } else {
                setStep('island');
                alert(result.error || "Tanty had a little ink spill! Let's try again.");
            }
        } catch (error) {
            console.error("Generation error:", error);
            setStep('island');
            alert("Something went wrong on the island path. Please try again!");
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-deep/40 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-zinc-100">
                        <Wand2 className="text-purple-500" size={20} />
                        <span className="font-black text-deep uppercase tracking-widest text-sm">Story Studio Wizard</span>
                    </div>
                    <div className="w-12 h-12" /> {/* Spacer */}
                </header>

                <AnimatePresence mode="wait">
                    {step === 'tradition' && (
                        <motion.section
                            key="tradition"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black text-deep italic">Select a Legend!</h1>
                                <p className="text-deep/40 font-bold">Choose which hero will star in your new adventure.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {TRADITIONS.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setSelection(prev => ({ ...prev, tradition: t.id }));
                                            setStep('reading-level');
                                        }}
                                        className={`group relative bg-white p-8 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-4 text-left ${selection.tradition === t.id ? 'border-primary ring-8 ring-primary/10' : 'border-transparent hover:border-zinc-100'}`}
                                    >
                                        <div className="flex items-start gap-6">
                                            <div className={`w-20 h-20 ${t.color} rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                                                {t.icon}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h3 className="text-2xl font-black text-deep">{t.name}</h3>
                                                <p className="text-deep/30 text-xs font-black uppercase tracking-widest">{t.origin}</p>
                                                <p className="text-sm text-deep/50 font-bold mt-2 leading-relaxed">{t.desc}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {step === 'reading-level' && (
                        <motion.section
                            key="level"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black text-deep italic">Reading Power!</h1>
                                <p className="text-deep/40 font-bold">How many word-treasures should we look for?</p>
                            </div>

                            <div className="space-y-4">
                                {LEVELS.map((l) => (
                                    <button
                                        key={l.id}
                                        onClick={() => {
                                            setSelection(prev => ({ ...prev, level: l.id }));
                                            setStep('island');
                                        }}
                                        className={`w-full group bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-4 flex items-center gap-6 text-left ${selection.level === l.id ? 'border-primary ring-8 ring-primary/10' : 'border-transparent hover:border-zinc-100'}`}
                                    >
                                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-inner">
                                            {l.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-deep">{l.name}</h3>
                                            <p className="text-sm text-deep/50 font-bold">{l.desc}</p>
                                            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1 rounded-full w-fit">
                                                {l.focus}
                                            </div>
                                        </div>
                                        {selection.level === l.id && <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"><Check size={24} /></div>}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setStep('tradition')} className="mx-auto flex items-center gap-2 text-deep/20 font-black uppercase tracking-widest text-xs hover:text-deep/50 transition-colors">
                                <ArrowLeft size={14} /> Back to Traditions
                            </button>
                        </motion.section>
                    )}

                    {step === 'island' && (
                        <motion.section
                            key="island"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h1 className="text-4xl md:text-5xl font-black text-deep italic">Island Setting</h1>
                                <p className="text-deep/40 font-bold">Where should we drop the anchor today?</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {ISLANDS.map((i) => (
                                    <button
                                        key={i.id}
                                        onClick={() => setSelection(prev => ({ ...prev, island: i.id }))}
                                        className={`aspect-square group bg-white p-6 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-4 flex flex-col items-center justify-center gap-4 ${selection.island === i.id ? 'border-primary ring-8 ring-primary/10' : 'border-transparent'}`}
                                    >
                                        <span className="text-6xl group-hover:scale-110 transition-transform">{i.flag}</span>
                                        <span className="font-black text-deep uppercase tracking-widest text-xs">{i.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-8">
                                <button
                                    onClick={handleCreate}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-8 rounded-[3rem] font-black text-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                                >
                                    Make Magic <Sparkles className="group-hover:rotate-12 transition-transform" size={40} />
                                </button>

                                <button onClick={() => setStep('reading-level')} className="mt-8 mx-auto flex items-center gap-2 text-deep/20 font-black uppercase tracking-widest text-xs hover:text-deep/50 transition-colors">
                                    <ArrowLeft size={14} /> Back to Reading Level
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {step === 'creating' && (
                        <motion.section
                            key="creating"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 text-center"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="w-64 h-64 border-8 border-dashed border-primary/20 rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center gap-4">
                                        <Sparkles className="text-primary animate-pulse" size={64} />
                                        <div className="flex gap-1">
                                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                                            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-sm">
                                <h2 className="text-3xl font-black text-deep italic">Tanty is fetching...</h2>
                                <p className="text-deep/40 font-bold leading-relaxed">
                                    Pulling the perfect story from our library just for you! ✨
                                </p>
                            </div>

                            <div className="flex items-center gap-3 bg-zinc-100 px-6 py-4 rounded-3xl border border-zinc-200">
                                <Music size={20} className="text-deep/30" />
                                <span className="text-xs font-black text-deep/30 uppercase tracking-[0.2em] italic animate-pulse">Humming an island melody...</span>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Footer Progress */}
                {step !== 'creating' && (
                    <footer className="pt-12 flex justify-center gap-3">
                        {['tradition', 'reading-level', 'island'].map((s, idx) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-primary' : 'w-4 bg-zinc-200'}`}
                            />
                        ))}
                    </footer>
                )}
            </div>
        </main>
    );
}
