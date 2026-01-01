"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { createChild } from '@/lib/database';
import { useUser } from '@/components/UserContext';

// Island options with flags
const ISLANDS = [
    { id: 'jamaica', name: 'Jamaica', flag: '🇯🇲', color: 'from-green-500 to-yellow-400' },
    { id: 'trinidad', name: 'Trinidad & Tobago', flag: '🇹🇹', color: 'from-red-500 to-black' },
    { id: 'barbados', name: 'Barbados', flag: '🇧🇧', color: 'from-blue-500 to-yellow-400' },
    { id: 'guyana', name: 'Guyana', flag: '🇬🇾', color: 'from-green-500 to-red-500' },
    { id: 'st_lucia', name: 'St. Lucia', flag: '🇱🇨', color: 'from-cyan-400 to-yellow-400' },
    { id: 'grenada', name: 'Grenada', flag: '🇬🇩', color: 'from-red-500 to-green-500' },
    { id: 'bahamas', name: 'Bahamas', flag: '🇧🇸', color: 'from-cyan-400 to-yellow-400' },
    { id: 'haiti', name: 'Haiti', flag: '🇭🇹', color: 'from-blue-600 to-red-600' },
    { id: 'dominica', name: 'Dominica', flag: '🇩🇲', color: 'from-green-600 to-yellow-400' },
    { id: 'antigua', name: 'Antigua & Barbuda', flag: '🇦🇬', color: 'from-red-500 to-blue-500' },
    { id: 'st_vincent', name: 'St. Vincent', flag: '🇻🇨', color: 'from-blue-500 to-green-500' },
    { id: 'mixed', name: 'Island Explorer', flag: '🌴', color: 'from-primary to-accent' },
];

const AVATARS = [
    { id: 'turtle', emoji: '🐢', name: 'Turtle' },
    { id: 'parrot', emoji: '🦜', name: 'Parrot' },
    { id: 'dolphin', emoji: '🐬', name: 'Dolphin' },
    { id: 'butterfly', emoji: '🦋', name: 'Butterfly' },
    { id: 'fish', emoji: '🐠', name: 'Fish' },
    { id: 'crab', emoji: '🦀', name: 'Crab' },
    { id: 'hummingbird', emoji: '🐦', name: 'Hummingbird' },
    { id: 'starfish', emoji: '⭐', name: 'Starfish' },
];

export default function ChildOnboardingPage() {
    const router = useRouter();
    const { user, refreshChildren } = useUser();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        age: 5,
        age_track: 'mini' as 'mini' | 'big',
        primary_island: '',
        secondary_island: '',
        avatar_id: 'turtle',
    });

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user?.id) return;

        setIsSubmitting(true);
        try {
            await createChild(user.id, {
                first_name: formData.first_name,
                age: formData.age,
                age_track: formData.age < 6 ? 'mini' : 'big',
                primary_island: formData.primary_island,
                secondary_island: formData.secondary_island || undefined,
            });

            await refreshChildren();
            router.push('/portal?welcome=true');
        } catch (error) {
            console.error('Failed to create child:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.first_name.trim().length > 0;
            case 2: return formData.age >= 4 && formData.age <= 8;
            case 3: return formData.primary_island.length > 0;
            case 4: return formData.avatar_id.length > 0;
            default: return true;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${step === s
                                    ? 'bg-primary text-white'
                                    : step > s

                                        ? 'bg-green-500 text-white'
                                        : 'bg-white text-gray-400'
                                    }`}
                            >
                                {step > s ? <Check size={24} /> : s}
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-white rounded-full">
                        <div
                            className="h-2 bg-primary rounded-full transition-all"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[3rem] shadow-xl p-8 md:p-12">
                    {/* Step 1: Name */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="text-6xl mb-6">👋</div>
                            <h1 className="text-3xl font-black text-gray-900 mb-3">
                                What's your little legend's name?
                            </h1>
                            <p className="text-gray-500 mb-8">
                                We'll use their name to personalize their stories and letters
                            </p>

                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                placeholder="Enter first name..."
                                className="w-full max-w-md mx-auto px-6 py-4 text-2xl text-center border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary transition-colors"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Step 2: Age */}
                    {step === 2 && (
                        <div className="text-center">
                            <div className="text-6xl mb-6">🎂</div>
                            <h1 className="text-3xl font-black text-gray-900 mb-3">
                                How old is {formData.first_name}?
                            </h1>
                            <p className="text-gray-500 mb-8">
                                We'll match the content to their age group
                            </p>

                            <div className="flex justify-center gap-4 flex-wrap max-w-lg mx-auto">
                                {[4, 5, 6, 7, 8].map((age) => (
                                    <button
                                        key={age}
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            age,
                                            age_track: age < 6 ? 'mini' : 'big'
                                        }))}
                                        className={`w-20 h-20 rounded-2xl text-3xl font-black transition-all ${formData.age === age
                                            ? 'bg-primary text-white scale-110 shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {age}
                                    </button>
                                ))}
                            </div>

                            <p className="mt-6 text-sm text-gray-400">
                                {formData.age < 6 ? '🌱 Mini Legends (4-5 years)' : '🌟 Big Legends (6-8 years)'}
                            </p>
                        </div>
                    )}

                    {/* Step 3: Island */}
                    {step === 3 && (
                        <div className="text-center">
                            <div className="text-6xl mb-6">🏝️</div>
                            <h1 className="text-3xl font-black text-gray-900 mb-3">
                                Select {formData.first_name}'s heritage island
                            </h1>
                            <p className="text-gray-500 mb-8">
                                We'll feature stories and culture from this island
                            </p>

                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-xl mx-auto">
                                {ISLANDS.map((island) => (
                                    <button
                                        key={island.id}
                                        onClick={() => setFormData(prev => ({ ...prev, primary_island: island.id }))}
                                        className={`p-4 rounded-2xl transition-all ${formData.primary_island === island.id
                                            ? 'bg-primary text-white scale-105 shadow-lg'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="text-3xl mb-1">{island.flag}</div>
                                        <p className={`text-xs font-bold ${formData.primary_island === island.id ? 'text-white' : 'text-gray-600'
                                            }`}>
                                            {island.name}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {formData.primary_island && formData.primary_island !== 'mixed' && (
                                <div className="mt-6">
                                    <p className="text-sm text-gray-400 mb-2">Optional: Add a second heritage island</p>
                                    <select
                                        value={formData.secondary_island}
                                        onChange={(e) => setFormData(prev => ({ ...prev, secondary_island: e.target.value }))}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm"
                                        aria-label="Secondary Island"
                                    >
                                        <option value="">None</option>
                                        {ISLANDS.filter(i => i.id !== formData.primary_island && i.id !== 'mixed').map((island) => (
                                            <option key={island.id} value={island.id}>
                                                {island.flag} {island.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Avatar */}
                    {step === 4 && (
                        <div className="text-center">
                            <div className="text-6xl mb-6">✨</div>
                            <h1 className="text-3xl font-black text-gray-900 mb-3">
                                Choose {formData.first_name}'s avatar
                            </h1>
                            <p className="text-gray-500 mb-8">
                                This will be their profile icon in the app
                            </p>

                            <div className="flex justify-center gap-4 flex-wrap max-w-md mx-auto mb-8">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setFormData(prev => ({ ...prev, avatar_id: avatar.id }))}
                                        className={`w-20 h-20 rounded-2xl text-4xl transition-all ${formData.avatar_id === avatar.id
                                            ? 'bg-primary scale-110 shadow-lg ring-4 ring-primary/30'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {avatar.emoji}
                                    </button>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 max-w-md mx-auto">
                                <h3 className="font-bold text-gray-900 mb-3">Profile Summary</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                                        {AVATARS.find(a => a.id === formData.avatar_id)?.emoji}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-lg text-gray-900">{formData.first_name}</p>
                                        <p className="text-sm text-gray-500">
                                            Age {formData.age} • {ISLANDS.find(i => i.id === formData.primary_island)?.name}
                                        </p>
                                        <p className="text-xs text-primary font-bold">
                                            {formData.age < 6 ? 'Mini Legend' : 'Big Legend'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-10">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                            >
                                <ChevronLeft size={20} />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!isStepValid() || isSubmitting}
                                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    'Creating Profile...'
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Start Adventure!
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
