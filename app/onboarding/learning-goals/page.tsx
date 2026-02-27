"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, BookOpen, Gamepad2, Music, Leaf, Users, Clock, Target, Star } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// ─── Character branding ───────────────────────────────────────────────────────

const CHARACTERS = {
    roti: {
        name: 'R.O.T.I.',
        role: 'Your Curriculum Coach',
        tagline: 'Brains on — sunshine mode!',
        avatarUrl: '/images/roti-new.jpg',
        color: 'from-emerald-500 to-emerald-600',
        ring: 'ring-emerald-400',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
    },
    tanty_spice: {
        name: 'Tanty Spice',
        role: 'Your Story Guide',
        tagline: 'Come nuh, sit down wid me.',
        avatarUrl: '/images/tanty_spice_avatar.jpg',
        color: 'from-orange-500 to-amber-500',
        ring: 'ring-orange-400',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
    },
    dilly_doubles: {
        name: 'Dilly Doubles',
        role: 'Your Hype-Man',
        tagline: 'Lesss gooo, Legend!',
        avatarUrl: '/images/dilly-doubles.jpg',
        color: 'from-blue-500 to-sky-500',
        ring: 'ring-blue-400',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
    },
    benny: {
        name: 'Benny of Shadows',
        role: 'Your Quiet Explorer',
        tagline: 'Shhh... listen to the island.',
        avatarUrl: '/images/logo.png',
        color: 'from-violet-500 to-purple-600',
        ring: 'ring-violet-400',
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        border: 'border-violet-200',
    },
} as const;

type CharacterKey = keyof typeof CHARACTERS;

// ─── Quiz data ────────────────────────────────────────────────────────────────

interface QuizResults {
    focusAreas: string[];
    learningStyle: string;
    dailyMinutes: number;
    primaryGoal: string;
    preferredCharacter: CharacterKey;
}

// ─── Inner component (needs Suspense) ────────────────────────────────────────

function LearningGoalsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const childId = searchParams.get('childId') || '';

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [results, setResults] = useState<QuizResults>({
        focusAreas: [],
        learningStyle: '',
        dailyMinutes: 30,
        primaryGoal: '',
        preferredCharacter: 'roti',
    });

    const totalSteps = 5;

    const toggleFocus = (area: string) => {
        setResults(prev => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(area)
                ? prev.focusAreas.filter(f => f !== area)
                : prev.focusAreas.length < 3
                    ? [...prev.focusAreas, area]
                    : prev.focusAreas,
        }));
    };

    const canProceed = () => {
        if (step === 1) return results.focusAreas.length > 0;
        if (step === 2) return !!results.learningStyle;
        if (step === 3) return !!results.dailyMinutes;
        if (step === 4) return !!results.primaryGoal;
        if (step === 5) return !!results.preferredCharacter;
        return false;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (childId && token) {
                await fetch(`/api/children/${childId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        metadata: { ...results },
                        favorite_character: results.preferredCharacter,
                    }),
                });
            }

            router.push(`/onboarding/plan-preview?childId=${childId}&character=${results.preferredCharacter}`);
        } catch (err) {
            console.error('Failed to save quiz results:', err);
            router.push(`/onboarding/plan-preview?childId=${childId}&character=${results.preferredCharacter}`);
        }
    };

    const selectedChar = CHARACTERS[results.preferredCharacter];

    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />

            {/* Logo + Progress */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                        </div>
                        <span className="font-black text-deep text-sm uppercase tracking-widest">Likkle Legends</span>
                    </div>
                    <span className="text-xs font-bold text-deep/40 uppercase tracking-widest">Step {step}/{totalSteps}</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
            </div>

            {/* Card */}
            <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-zinc-200/50 p-10 md:p-12 border border-zinc-100 relative overflow-hidden">

                <AnimatePresence mode="wait">
                    {/* STEP 1: Focus Areas */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs font-black text-deep/30 uppercase tracking-widest">Learning Focus</p>
                            </div>
                            <h2 className="text-3xl font-black text-deep mb-2 tracking-tight">What should we focus on?</h2>
                            <p className="text-deep/40 font-medium mb-8">Pick up to 3 areas. We'll build the plan around them.</p>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'literacy', label: 'Reading & Literacy', emoji: '📖', desc: 'Phonics, stories, comprehension' },
                                    { id: 'math', label: 'Math & Numbers', emoji: '🔢', desc: 'Counting, shapes, problem-solving' },
                                    { id: 'science', label: 'Science & Nature', emoji: '🌿', desc: 'Exploration, experiments, nature' },
                                    { id: 'culture', label: 'Music & Culture', emoji: '🎵', desc: 'Caribbean heritage, arts, music' },
                                    { id: 'social', label: 'Social Skills', emoji: '🤝', desc: 'Values, emotions, community' },
                                ].map(area => (
                                    <button
                                        key={area.id}
                                        onClick={() => toggleFocus(area.id)}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${results.focusAreas.includes(area.id)
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{area.emoji}</div>
                                        <p className="font-black text-deep text-sm">{area.label}</p>
                                        <p className="text-deep/40 text-xs mt-1 font-medium">{area.desc}</p>
                                        {results.focusAreas.includes(area.id) && (
                                            <div className="mt-2 text-primary font-black text-xs">✓ Selected</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-xs text-deep/30 mt-4 font-medium">{results.focusAreas.length}/3 selected</p>
                        </motion.div>
                    )}

                    {/* STEP 2: Learning Style */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs font-black text-deep/30 uppercase tracking-widest">Learning Style</p>
                            </div>
                            <h2 className="text-3xl font-black text-deep mb-2 tracking-tight">How does your child learn best?</h2>
                            <p className="text-deep/40 font-medium mb-8">This shapes how we present activities.</p>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'story', label: 'Story-Driven', emoji: '📚', desc: 'Learns through narratives and characters', character: 'tanty_spice' },
                                    { id: 'games', label: 'Game-Based', emoji: '🎮', desc: 'Learns through play and challenges', character: 'dilly_doubles' },
                                    { id: 'hands_on', label: 'Hands-On', emoji: '✏️', desc: 'Worksheets, crafts, printables', character: 'benny' },
                                    { id: 'audio', label: 'Audio & Music', emoji: '🎶', desc: 'Songs, listening, rhythm', character: 'roti' },
                                ].map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setResults(prev => ({ ...prev, learningStyle: style.id }))}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${results.learningStyle === style.id
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{style.emoji}</div>
                                        <p className="font-black text-deep text-sm">{style.label}</p>
                                        <p className="text-deep/40 text-xs mt-1 font-medium">{style.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Daily Time */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs font-black text-deep/30 uppercase tracking-widest">Daily Time</p>
                            </div>
                            <h2 className="text-3xl font-black text-deep mb-2 tracking-tight">How long each day?</h2>
                            <p className="text-deep/40 font-medium mb-8">We'll build the right-sized activities for your schedule.</p>

                            <div className="flex flex-col gap-4">
                                {[
                                    { minutes: 15, label: '15 Minutes', emoji: '⚡', desc: 'Quick snack sessions — perfect for busy days' },
                                    { minutes: 30, label: '30 Minutes', emoji: '🌟', desc: 'Standard learning session — our most popular choice' },
                                    { minutes: 45, label: '45+ Minutes', emoji: '🏆', desc: 'Deep dive days — for when there\'s time to explore' },
                                ].map(option => (
                                    <button
                                        key={option.minutes}
                                        onClick={() => setResults(prev => ({ ...prev, dailyMinutes: option.minutes }))}
                                        className={`p-6 rounded-2xl border-2 text-left flex items-center gap-5 transition-all hover:scale-[1.01] ${results.dailyMinutes === option.minutes
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                            }`}
                                    >
                                        <div className="text-4xl">{option.emoji}</div>
                                        <div>
                                            <p className="font-black text-deep text-lg">{option.label}</p>
                                            <p className="text-deep/40 text-sm font-medium">{option.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Primary Goal */}
                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Star className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs font-black text-deep/30 uppercase tracking-widest">Primary Goal</p>
                            </div>
                            <h2 className="text-3xl font-black text-deep mb-2 tracking-tight">What's the #1 goal?</h2>
                            <p className="text-deep/40 font-medium mb-8">Your plan will be anchored around this mission.</p>

                            <div className="flex flex-col gap-4">
                                {[
                                    { id: 'confidence', label: 'Build confidence & love of learning', emoji: '💛', desc: 'Make learning feel safe, fun, and magical' },
                                    { id: 'grade_level', label: 'Stay on grade level', emoji: '📊', desc: 'Cover key curriculum standards for their age' },
                                    { id: 'advance', label: 'Advance ahead of grade', emoji: '🚀', desc: 'Challenge them and stretch their capabilities' },
                                    { id: 'culture', label: 'Caribbean cultural enrichment', emoji: '🏝️', desc: 'Deep dive into heritage, identity, and island history' },
                                ].map(goal => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setResults(prev => ({ ...prev, primaryGoal: goal.id }))}
                                        className={`p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all hover:scale-[1.01] ${results.primaryGoal === goal.id
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                            }`}
                                    >
                                        <div className="text-3xl">{goal.emoji}</div>
                                        <div>
                                            <p className="font-black text-deep">{goal.label}</p>
                                            <p className="text-deep/40 text-sm font-medium">{goal.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: Choose Character Guide */}
                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs font-black text-deep/30 uppercase tracking-widest">Choose Your Guide</p>
                            </div>
                            <h2 className="text-3xl font-black text-deep mb-2 tracking-tight">Who will guide your Legend?</h2>
                            <p className="text-deep/40 font-medium mb-8">Your child's primary learning buddy across all activities.</p>

                            <div className="grid grid-cols-2 gap-4">
                                {(Object.entries(CHARACTERS) as [CharacterKey, typeof CHARACTERS[CharacterKey]][]).map(([key, char]) => (
                                    <button
                                        key={key}
                                        onClick={() => setResults(prev => ({ ...prev, preferredCharacter: key }))}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] relative overflow-hidden ${results.preferredCharacter === key
                                            ? `border-primary bg-primary/5 shadow-lg ring-2 ring-primary/30`
                                            : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 shadow-md">
                                            <Image src={char.avatarUrl} alt={char.name} width={64} height={64} className="object-cover w-full h-full" />
                                        </div>
                                        <p className="font-black text-deep text-sm">{char.name}</p>
                                        <p className="text-deep/40 text-xs font-medium">{char.role}</p>
                                        <p className="text-xs italic text-deep/30 mt-1">"{char.tagline}"</p>
                                        {results.preferredCharacter === key && (
                                            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-black">✓</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10">
                    <button
                        onClick={() => setStep(s => s - 1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-deep/40 hover:text-deep hover:bg-zinc-100'}`}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-base shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Continue <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || isSubmitting}
                            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-10 py-4 rounded-2xl font-black text-base shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
                        >
                            {isSubmitting ? 'Building...' : (
                                <><Sparkles size={20} /> Build My Plan</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Character cheerleader at bottom */}
            {step === 5 && results.preferredCharacter && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-md border border-zinc-100"
                >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        <Image src={selectedChar.avatarUrl} alt={selectedChar.name} width={48} height={48} className="object-cover w-full h-full" />
                    </div>
                    <p className="text-sm font-bold text-deep">
                        <span className="text-primary">{selectedChar.name}:</span> "{selectedChar.tagline} Let's build something amazing together!"
                    </p>
                </motion.div>
            )}
        </div>
    );
}

export default function LearningGoalsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
                <Sparkles className="animate-pulse text-primary" size={48} />
            </div>
        }>
            <LearningGoalsContent />
        </Suspense>
    );
}
