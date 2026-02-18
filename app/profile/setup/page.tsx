
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { setupFamilyProfile, FamilySetupData, ChildSetupData } from '@/app/actions/profile-setup';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Check, Globe, Heart, Star, User, BookOpen } from 'lucide-react';

const ISLANDS = [
    { id: 'Jamaica', name: 'Jamaica', flag: '🇯🇲' },
    { id: 'Trinidad and Tobago', name: 'Trinidad & Tobago', flag: '🇹🇹' },
    { id: 'Barbados', name: 'Barbados', flag: '🇧🇧' },
    { id: 'Guyana', name: 'Guyana', flag: '🇬🇾' },
    { id: 'Saint Lucia', name: 'St. Lucia', flag: '🇱🇨' },
    { id: 'Grenada', name: 'Grenada', flag: '🇬🇩' },
];

const LANGUAGE_STYLES = [
    { id: 'neutral', name: 'Standard English', desc: 'Clear, simple English suitable for all readers.' },
    { id: 'caribbean_light', name: 'Caribbean Light', desc: 'Standard English with authentic island cadence and rhythm.' },
    { id: 'creole_sprinkles', name: 'Creole Sprinkles', desc: 'English narrative with fun local phrases (dialects) in dialogue.' },
];

const CHARACTERS = [
    { id: 'dilly_doubles', name: 'Dilly Doubles', role: 'Joy & Culture', color: 'bg-yellow-100' },
    { id: 'scorcha_pepper', name: 'Scorcha Pepper', role: 'Energy & Challenge', color: 'bg-red-100' }, // New!
    { id: 'benny_shadowbeni', name: 'Benny Shadowbeny', role: 'Nature', color: 'bg-green-100' },
    { id: 'mango_moko', name: 'Mango Moko', role: 'Adventure', color: 'bg-orange-100' },
    { id: 'steelpan_sam', name: 'Steelpan Sam', role: 'Music', color: 'bg-blue-100' },
];

export default function FamilySetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [familyForm, setFamilyForm] = useState<FamilySetupData>({
        home_islands: [],
        language_flavour: 'caribbean_light', // Default
        max_story_length_pages: 8,
        allow_scary_folklore: false,
        allow_trickster_folklore: true,
    });

    const [childForm, setChildForm] = useState<ChildSetupData>({
        child_name: '',
        child_age: 5,
        reading_level: 'emerging',
        attention_span: 'medium',
        favourite_topics: [],
        favourite_characters: [],
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleIsland = (island: string) => {
        const current = familyForm.home_islands;
        if (current.includes(island)) {
            setFamilyForm({ ...familyForm, home_islands: current.filter(i => i !== island) });
        } else {
            if (current.length < 2) {
                setFamilyForm({ ...familyForm, home_islands: [...current, island] });
            }
        }
    };

    const toggleCharacter = (charId: string) => {
        const current = childForm.favourite_characters;
        if (current.includes(charId)) {
            setChildForm({ ...childForm, favourite_characters: current.filter(c => c !== charId) });
        } else {
            if (current.length < 3) {
                setChildForm({ ...childForm, favourite_characters: [...current, charId] });
            }
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            // We'll use the server action directly
            const result = await setupFamilyProfile(familyForm, childForm);

            if (result.success) {
                router.push('/dashboard'); // Or '/story-studio'
            } else {
                setError(result.error || 'Failed to finish setup.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6 font-fredoka">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Left Panel: Progress / Info */}
                <div className="w-full md:w-1/3 bg-primary p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-2">Setup Your <br /> Adventures</h2>
                        <p className="opacity-80 text-sm">Let’s customize your storytelling experience!</p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className={`flex items-center gap-3 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step > 1 ? 'bg-green-400 text-white' : 'bg-white text-primary'}`}>
                                {step > 1 ? <Check size={16} /> : '1'}
                            </div>
                            <span className="font-bold">Family Vibes</span>
                        </div>
                        <div className={`flex items-center gap-3 transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step > 2 ? 'bg-green-400 text-white' : 'bg-white text-primary'}`}>
                                {step > 2 ? <Check size={16} /> : '2'}
                            </div>
                            <span className="font-bold">Meet the Reader</span>
                        </div>
                        <div className={`flex items-center gap-3 transition-opacity ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step > 3 ? 'bg-green-400 text-white' : 'bg-white text-primary'}`}>
                                {step > 3 ? <Check size={16} /> : '3'}
                            </div>
                            <span className="font-bold">Review</span>
                        </div>
                    </div>

                    {/* Decorative Blob */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                </div>

                {/* Right Panel: Form */}
                <div className="flex-1 p-8 md:p-12 relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h3 className="text-2xl font-black text-blue-900">Cultural Setup</h3>

                                {/* Islands */}
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 block">Where is home? (Pick up to 2)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {ISLANDS.map(island => (
                                            <button
                                                key={island.id}
                                                onClick={() => toggleIsland(island.name)}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${familyForm.home_islands.includes(island.name) ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-gray-100 hover:bg-gray-50'}`}
                                            >
                                                <div className="text-2xl mb-1">{island.flag}</div>
                                                <div className="text-xs font-bold text-gray-700">{island.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 block">Story Voice</label>
                                    <div className="space-y-3">
                                        {LANGUAGE_STYLES.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setFamilyForm({ ...familyForm, language_flavour: style.id as any })}
                                                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left ${familyForm.language_flavour === style.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${familyForm.language_flavour === style.id ? 'border-primary' : 'border-gray-300'}`}>
                                                    {familyForm.language_flavour === style.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-blue-900">{style.name}</div>
                                                    <div className="text-xs text-gray-500">{style.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h3 className="text-2xl font-black text-blue-900">Who is Reading?</h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">Name</label>
                                        <input
                                            type="text"
                                            value={childForm.child_name}
                                            onChange={(e) => setChildForm({ ...childForm, child_name: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-lg"
                                            placeholder="Child's Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">Age</label>
                                        <input
                                            type="number"
                                            value={childForm.child_age}
                                            onChange={(e) => setChildForm({ ...childForm, child_age: parseInt(e.target.value) || 5 })}
                                            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-lg"
                                            min={2} max={12}
                                        />
                                    </div>
                                </div>

                                {/* Characters */}
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 block">Favourite Characters (Pick 1-3)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CHARACTERS.map(char => (
                                            <button
                                                key={char.id}
                                                onClick={() => toggleCharacter(char.id)}
                                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${childForm.favourite_characters.includes(char.id) ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-gray-100 hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full ${char.color} flex items-center justify-center text-lg`}>
                                                    {/* Ideally show small image, using emoji for now or simple initial */}
                                                    {char.name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-blue-900">{char.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase">{char.role}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 text-center py-10"
                            >
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary text-4xl animate-pulse">
                                    🚀
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black text-blue-900 mb-4">All Set!</h3>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        We've configured your storyteller with <strong>{familyForm.home_islands.join(', ') || 'Global'}</strong> vibes and a <strong>{LANGUAGE_STYLES.find(s => s.id === familyForm.language_flavour)?.name}</strong> voice.
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        {childForm.child_name}'s adventure profile is ready.
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                                        Error: {error}
                                    </div>
                                )}

                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="absolute bottom-8 left-0 right-0 px-8 md:px-12 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            className={`flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                            <ChevronLeft size={20} /> Back
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={(step === 1 && familyForm.home_islands.length === 0) || (step === 2 && !childForm.child_name)}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-green-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-200 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? 'Saving...' : 'Start Creating!'} <Sparkles size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
