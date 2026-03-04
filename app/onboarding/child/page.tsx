"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronLeft, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createChild } from '@/lib/database';
import { useUser } from '@/components/UserContext';
import { getTantyVoice } from '@/app/actions/voice';

const ISLANDS = [
    // Popular / Big 4
    { id: 'jamaica',            name: 'Jamaica',                    flag: '🇯🇲', color: 'from-green-500 to-yellow-400',  fact: 'Island of Reggae & Wood!' },
    { id: 'trinidad',           name: 'Trinidad & Tobago',          flag: '🇹🇹', color: 'from-red-600 to-yellow-400',   fact: 'Home of Steelpan & Soca!' },
    { id: 'barbados',           name: 'Barbados',                   flag: '🇧🇧', color: 'from-blue-600 to-yellow-400',  fact: 'Land of Flying Fish!' },
    { id: 'guyana',             name: 'Guyana',                     flag: '🇬🇾', color: 'from-green-600 to-red-600',    fact: 'Land of Many Waters!' },
    // Greater Antilles
    { id: 'haiti',              name: 'Haiti',                      flag: '🇭🇹', color: 'from-blue-700 to-red-600',     fact: 'First Black Republic in the World!' },
    { id: 'dominican_republic', name: 'Dominican Republic',         flag: '🇩🇴', color: 'from-blue-600 to-red-600',     fact: 'Land of Merengue & Mountains!' },
    { id: 'cuba',               name: 'Cuba',                       flag: '🇨🇺', color: 'from-blue-600 to-red-600',     fact: 'Pearl of the Antilles!' },
    { id: 'puerto_rico',        name: 'Puerto Rico',                flag: '🇵🇷', color: 'from-red-600 to-blue-600',     fact: 'Island of Enchantment!' },
    // Eastern Caribbean
    { id: 'st_lucia',           name: 'St. Lucia',                  flag: '🇱🇨', color: 'from-sky-400 to-yellow-400',  fact: 'Home of the Piton Mountains!' },
    { id: 'grenada',            name: 'Grenada',                    flag: '🇬🇩', color: 'from-red-500 to-green-600',   fact: 'The Island of Spice!' },
    { id: 'antigua',            name: 'Antigua & Barbuda',          flag: '🇦🇬', color: 'from-red-500 to-blue-600',    fact: '365 Beautiful Beaches!' },
    { id: 'st_vincent',         name: 'St. Vincent & Grenadines',   flag: '🇻🇨', color: 'from-green-600 to-yellow-400', fact: 'Gems of the Caribbean!' },
    { id: 'dominica',           name: 'Dominica',                   flag: '🇩🇲', color: 'from-green-700 to-red-500',   fact: 'Nature Isle of the Caribbean!' },
    { id: 'st_kitts',           name: 'St. Kitts & Nevis',          flag: '🇰🇳', color: 'from-green-600 to-red-600',   fact: 'Cradle of the Caribbean!' },
    { id: 'montserrat',         name: 'Montserrat',                 flag: '🇲🇸', color: 'from-blue-600 to-green-500',  fact: 'Emerald Isle of the Caribbean!' },
    { id: 'anguilla',           name: 'Anguilla',                   flag: '🇦🇮', color: 'from-blue-500 to-sky-300',    fact: 'Longest Beaches in the Caribbean!' },
    // Bahamas & Northern
    { id: 'bahamas',            name: 'Bahamas',                    flag: '🇧🇸', color: 'from-cyan-400 to-yellow-300', fact: 'Crystal Clear Waters!' },
    { id: 'cayman',             name: 'Cayman Islands',             flag: '🇰🇾', color: 'from-blue-500 to-green-400',  fact: 'World\'s Best Diving!' },
    { id: 'turks_caicos',       name: 'Turks & Caicos',             flag: '🇹🇨', color: 'from-sky-300 to-yellow-300',  fact: 'Whitest Sands in the Caribbean!' },
    { id: 'bermuda',            name: 'Bermuda',                    flag: '🇧🇲', color: 'from-pink-400 to-blue-400',   fact: 'The Pink Sand Island!' },
    // Dutch Caribbean
    { id: 'aruba',              name: 'Aruba',                      flag: '🇦🇼', color: 'from-sky-400 to-yellow-300',  fact: 'One Happy Island!' },
    { id: 'curacao',            name: 'Curaçao',                    flag: '🇨🇼', color: 'from-blue-500 to-yellow-400', fact: 'Island of Colours!' },
    { id: 'bonaire',            name: 'Bonaire',                    flag: '🇧🇶', color: 'from-blue-400 to-yellow-400', fact: 'Diver\'s Paradise!' },
    // French Caribbean
    { id: 'martinique',         name: 'Martinique',                 flag: '🇲🇶', color: 'from-blue-700 to-red-500',   fact: 'Flower of the Caribbean!' },
    { id: 'guadeloupe',         name: 'Guadeloupe',                 flag: '🇬🇵', color: 'from-blue-700 to-red-500',   fact: 'The Butterfly Island!' },
    { id: 'st_martin',          name: 'St. Martin / Sint Maarten',  flag: '🇸🇽', color: 'from-red-500 to-blue-600',   fact: 'Two Nations, One Island!' },
    // Virgin Islands
    { id: 'bvi',                name: 'British Virgin Islands',     flag: '🇻🇬', color: 'from-blue-700 to-green-500', fact: 'Sailing Capital of the World!' },
    { id: 'usvi',               name: 'US Virgin Islands',          flag: '🇻🇮', color: 'from-blue-600 to-yellow-400', fact: 'America\'s Paradise!' },
    // Central/South America
    { id: 'belize',             name: 'Belize',                     flag: '🇧🇿', color: 'from-blue-700 to-red-500',   fact: 'Jewel of the Caribbean Coast!' },
    { id: 'suriname',           name: 'Suriname',                   flag: '🇸🇷', color: 'from-green-600 to-red-500',  fact: 'The Rainforest Republic!' },
    // Diaspora catch-all
    { id: 'mixed',              name: 'Island Explorer',            flag: '🌴', color: 'from-primary to-accent',      fact: 'Exploring all the islands!' },
];

const AVATARS = [
    { id: 'lion', emoji: '🦁', name: 'Likkle Lion', color: 'bg-orange-100' },
    { id: 'parrot', emoji: '🦜', name: 'Pretty Parrot', color: 'bg-green-100' },
    { id: 'dolphin', emoji: '🐬', name: 'Dashing Dolphin', color: 'bg-blue-100' },
    { id: 'butterfly', emoji: '🦋', name: 'Bright Butterfly', color: 'bg-pink-100' },
    { id: 'turtle', emoji: '🐢', name: 'Tough Turtle', color: 'bg-emerald-100' },
    { id: 'crab', emoji: '🦀', name: 'Cool Crab', color: 'bg-red-100' },
];

export default function ChildOnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <ChildOnboardingContent />
        </Suspense>
    );
}

function ChildOnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const uidFromUrl = searchParams.get('uid');
    const { user, isLoading: userLoading, refreshChildren } = useUser();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        age: 5,
        age_track: 'mini' as 'mini' | 'big',
        primary_island: '',
        avatar_id: 'lion',
    });

    const steps = [
        { id: 'name', title: "What's your name?", tanty: "Greetings, Likkle Legend! Tell Tanty your name so we can start our journey!" },
        { id: 'age', title: "How old are you?", tanty: "Wonderful! And how many birthdays have you celebrated?" },
        { id: 'island', title: "Where is your family from?", tanty: "Tell me which beautiful island your heart belongs to!" },
        { id: 'avatar', title: "Choose your Legend Icon!", tanty: "Pick a friend to go on adventures with you!" },
    ];

    const currentStepData = steps[step - 1];

    const handleNext = () => step < 4 && setStep(step + 1);
    const handleBack = () => step > 1 && setStep(step - 1);

    const speakTantyInstruction = async () => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        try {
            const res = await getTantyVoice(currentStepData.tanty);
            if (res.success && res.audio) {
                const audio = new Audio(res.audio.startsWith('data:') ? res.audio : `data:audio/mp3;base64,${res.audio}`);
                audio.onended = () => setIsSpeaking(false);
                await audio.play();
            } else {
                setIsSpeaking(false);
            }
        } catch (e) {
            setIsSpeaking(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitError(null);

        // If context is still loading, wait — don't redirect yet
        if (userLoading) {
            setSubmitError('Still loading your session — please try again in a moment.');
            return;
        }

        // Require authenticated session for child creation.
        // Never trust URL uid for write operations.
        let userId = user?.id;
        const redirectTarget = `/onboarding/child${uidFromUrl ? `?uid=${encodeURIComponent(uidFromUrl)}` : ''}`;
        if (!userId) {
            try {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                userId = session?.user?.id;
            } catch {
                // ignore
            }
        }

        if (!userId) {
            router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
            return;
        }

        setIsSubmitting(true);
        try {
            const child = await createChild(userId, {
                first_name: formData.first_name,
                age: formData.age,
                age_track: formData.age < 6 ? 'mini' : 'big',
                primary_island: formData.primary_island,
                avatar_id: formData.avatar_id,
            });
            await refreshChildren();
            router.push(`/onboarding/learning-goals?childId=${child.id}`);
        } catch (error: any) {
            console.error('Onboarding error:', error);
            setSubmitError(error?.message || 'Could not save your profile. Please try again.');
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        if (step === 1) return formData.first_name.length > 1;
        if (step === 3) return !!formData.primary_island;
        return true;
    };

    return (
        <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-200/50 to-transparent"></div>
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-10 left-10 text-6xl opacity-20"
            >
                ☁️
            </motion.div>
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-10 right-10 text-6xl opacity-20"
            >
                🌴
            </motion.div>

            {/* Tanty Spice Guide */}
            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10 mb-12">
                <div className="relative shrink-0">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-40 h-40 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-primary relative z-10"
                    >
                        <Image
                            src="/images/tanty_spice_avatar.jpg"
                            alt="Tanty Spice"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                    {isSpeaking && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -inset-4 border-4 border-primary rounded-full"
                        />
                    )}
                </div>

                <div className="flex-1 relative">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-xl relative"
                    >
                        {/* Speech bubble tail */}
                        <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-white rotate-45 hidden md:block" />

                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <p className="text-xl font-bold text-blue-900 leading-relaxed">
                                    "{currentStepData.tanty}"
                                </p>
                            </div>
                            <button
                                onClick={speakTantyInstruction}
                                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${isSpeaking ? 'bg-primary text-white scale-110' : 'bg-blue-50 text-blue-400 hover:bg-blue-100'}`}
                                aria-label="Listen to Tanty"
                            >
                                <Volume2 size={24} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Component Card */}
            <div className="w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 relative border-8 border-white/50">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                    >
                        <span className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 block">Adventure Setup: Step {step}/4</span>
                        <h2 className="text-4xl font-black text-blue-900 mb-10 tracking-tight">{currentStepData.title}</h2>

                        {/* Step 1: Name */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-7xl animate-bounce-slow">🎨</div>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="Type your name here..."
                                    className="w-full text-center text-4xl font-black text-blue-900 border-b-8 border-blue-50 focus:border-primary focus:outline-none py-4 placeholder:text-blue-100"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Step 2: Age */}
                        {step === 2 && (
                            <div className="flex justify-center flex-wrap gap-4">
                                {[4, 5, 6, 7, 8].map(age => (
                                    <button
                                        key={age}
                                        onClick={() => setFormData({ ...formData, age, age_track: age < 6 ? 'mini' : 'big' })}
                                        className={`w-24 h-24 rounded-3xl text-4xl font-black transition-all ${formData.age === age ? 'bg-primary text-white scale-110 shadow-xl' : 'bg-blue-50 text-blue-400 hover:bg-blue-100'}`}
                                    >
                                        {age}
                                    </button>
                                ))}
                                <div className="w-full mt-6">
                                    <p className="font-bold text-blue-300 uppercase tracking-widest text-xs">
                                        {formData.age < 6 ? '🌱 Mini Legend Track' : '🌟 Big Legend Track'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Island */}
                        {step === 3 && (
                            <div>
                                {formData.primary_island && (
                                    <p className="text-center text-sm font-black text-primary mb-3 animate-pulse">
                                        {ISLANDS.find(i => i.id === formData.primary_island)?.flag} {ISLANDS.find(i => i.id === formData.primary_island)?.fact}
                                    </p>
                                )}
                                <div className="max-h-72 overflow-y-auto pr-1 grid grid-cols-3 gap-3 scrollbar-thin">
                                    {ISLANDS.map(island => (
                                        <button
                                            key={island.id}
                                            onClick={() => setFormData({ ...formData, primary_island: island.id })}
                                            className={`p-3 rounded-2xl border-4 transition-all text-center ${formData.primary_island === island.id ? 'border-primary bg-primary/5 scale-105 shadow-md' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                                        >
                                            <div className="text-3xl mb-1">{island.flag}</div>
                                            <p className="text-[9px] font-black text-blue-900 uppercase leading-tight">{island.name}</p>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-xs text-blue-300 mt-2 font-medium">Scroll to see all 31 islands ↕</p>
                            </div>
                        )}

                        {/* Step 4: Avatar */}
                        {step === 4 && (
                            <div className="space-y-10">
                                <div className="flex justify-center flex-wrap gap-6">
                                    {AVATARS.map(avatar => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => setFormData({ ...formData, avatar_id: avatar.id })}
                                            className={`w-28 h-28 rounded-[2.5rem] text-5xl transition-all flex items-center justify-center ${formData.avatar_id === avatar.id ? 'bg-primary text-white scale-110 shadow-2xl ring-8 ring-primary/20' : `${avatar.color} text-gray-700 hover:scale-105`}`}
                                        >
                                            {avatar.emoji}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100">
                                    <h4 className="font-black text-blue-900 text-lg mb-1">Adventure Passport Ready!</h4>
                                    <p className="text-blue-700/60 font-medium">Likkle Legend: <span className="text-primary font-black uppercase text-sm">{formData.first_name}</span> from <span className="text-primary font-black uppercase text-sm">{formData.primary_island}</span>.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Error display */}
                {submitError && (
                    <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-bold text-center">
                        {submitError}
                    </div>
                )}

                {/* Footer Nav */}
                <div className="mt-8 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-blue-300 hover:text-blue-500 hover:bg-blue-50'}`}
                    >
                        <ChevronLeft size={20} /> Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-3"
                        >
                            Continue <ChevronRight size={24} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-primary to-accent text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-4"
                        >
                            {isSubmitting ? 'Setting up...' : (
                                <>
                                    <Sparkles size={24} />
                                    START ADVENTURE!
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
