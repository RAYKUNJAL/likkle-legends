'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, Check, Sparkles, User, Globe, Heart, Rocket, Star } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { signupAction } from '@/app/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface OnboardingFlowProps {
    plan: string;
    referral: string;
}

export default function OnboardingFlow({ plan, referral }: OnboardingFlowProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        country: 'US',
        consentMarketing: false,
        childAgeBand: '',
        islandInterests: [] as string[],
        learningGoals: [] as string[],
        starterCharacter: ''
    });

    const updateData = (fields: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...fields }));
    };

    const nextStep = () => {
        trackEvent('ll_onboarding_step', { step_id: step, next_step: step + 1 });
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleAccountCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (formData.password.length < 6) throw new Error("Password must be at least 6 characters.");

            // For the sake of the multi-step demo/flow, we might delay the actual account creation 
            // until the end, OR create it now and associate metadata later.
            // Spec says step 1 is account creation.
            const result = await signupAction({
                email: formData.email,
                password: formData.password,
                childName: 'Legend', // Placeholder until metadata is updated
                plan,
                referral
            });

            if (!result.success) throw new Error(result.error);
            try {
                const supabase = createClient();
                await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });
            } catch (e) {
                console.warn('Client sign-in after onboarding signup failed', e);
            }
            if (result.requiresLogin) {
                router.push('/login?redirect=/portal');
                return;
            }

            trackEvent('ll_start_free', { country: formData.country });
            nextStep();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { id: 1, title: "Create your parent account" },
        { id: 2, title: "How old is your child?" },
        { id: 3, title: "Which islands should we celebrate?" },
        { id: 4, title: "What should we focus on first?" },
        { id: 5, title: "Pick your child's first guide" },
        { id: 6, title: "Welcome to Likkle Legends" }
    ];

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12 flex items-center justify-between gap-2">
                {steps.map((s, idx) => (
                    <div
                        key={s.id}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-emerald-500' : 'bg-zinc-100'
                            }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-3xl font-black text-deep mb-2">{steps[0].title}</h2>
                        <p className="text-deep/50 font-bold mb-8 text-sm uppercase tracking-widest">Step 1 of 6</p>

                        <form onSubmit={handleAccountCreate} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => updateData({ email: e.target.value })}
                                    className="w-full p-5 bg-zinc-50 border-none rounded-2xl font-bold text-deep"
                                    placeholder="you@heritage.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Create Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => updateData({ password: e.target.value })}
                                    className="w-full p-5 bg-zinc-50 border-none rounded-2xl font-bold text-deep"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="marketing"
                                    checked={formData.consentMarketing}
                                    onChange={e => updateData({ consentMarketing: e.target.checked })}
                                    className="mt-1 w-5 h-5 rounded border-zinc-200 text-emerald-500 focus:ring-emerald-500/20"
                                />
                                <label htmlFor="marketing" className="text-sm font-bold text-deep/60 leading-tight">
                                    Yes, send me updates and learning tips (you can unsubscribe anytime).
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-3xl font-black text-deep mb-2">{steps[1].title}</h2>
                        <p className="text-deep/50 font-bold mb-8 text-sm uppercase tracking-widest">Step 2 of 6</p>

                        <div className="grid grid-cols-1 gap-4">
                            {['4-5', '6-7', '8-9'].map(band => (
                                <button
                                    key={band}
                                    onClick={() => { updateData({ childAgeBand: band }); nextStep(); }}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${formData.childAgeBand === band ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-100 hover:border-zinc-200'
                                        }`}
                                >
                                    <span className="text-xl font-black text-deep">{band} years old</span>
                                    {formData.childAgeBand === band && <Check className="text-emerald-500 w-6 h-6" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-3xl font-black text-deep mb-2">{steps[2].title}</h2>
                        <p className="text-deep/50 font-bold mb-8 text-sm uppercase tracking-widest">Step 3 of 6</p>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {['Jamaica', 'Trinidad & Tobago', 'Barbados', 'Haiti', 'Guyana', 'St. Lucia', 'Grenada', 'Other'].map(island => (
                                <button
                                    key={island}
                                    onClick={() => {
                                        const exists = formData.islandInterests.includes(island);
                                        if (exists) updateData({ islandInterests: formData.islandInterests.filter(i => i !== island) });
                                        else if (formData.islandInterests.length < 3) updateData({ islandInterests: [...formData.islandInterests, island] });
                                    }}
                                    className={`p-4 rounded-xl border-2 text-sm font-bold transition-all text-center ${formData.islandInterests.includes(island) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-deep/60 hover:border-zinc-200'
                                        }`}
                                >
                                    {island}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={nextStep}
                            disabled={formData.islandInterests.length === 0}
                            className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                        >
                            Next: Learning Goals
                        </button>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-3xl font-black text-deep mb-2">{steps[3].title}</h2>
                        <p className="text-deep/50 font-bold mb-8 text-sm uppercase tracking-widest">Step 4 of 6</p>

                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {['Reading', 'Numbers & Math', 'Confidence / SEL', 'Culture & Identity', 'Music & Rhythm'].map(goal => (
                                <button
                                    key={goal}
                                    onClick={() => {
                                        const exists = formData.learningGoals.includes(goal);
                                        if (exists) updateData({ learningGoals: formData.learningGoals.filter(i => i !== goal) });
                                        else updateData({ learningGoals: [...formData.learningGoals, goal] });
                                    }}
                                    className={`p-5 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${formData.learningGoals.includes(goal) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-deep/60 hover:border-zinc-200'
                                        }`}
                                >
                                    {goal}
                                    {formData.learningGoals.includes(goal) && <Check className="w-5 h-5 text-emerald-500" />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={nextStep}
                            disabled={formData.learningGoals.length === 0}
                            className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                        >
                            Next: Pick Your Guide
                        </button>
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className="text-3xl font-black text-deep mb-2">{steps[4].title}</h2>
                        <p className="text-deep/50 font-bold mb-8 text-sm uppercase tracking-widest">Step 5 of 6</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {[
                                { id: 'roti', name: 'R.O.T.I.', icon: Rocket, color: 'text-emerald-500' },
                                { id: 'tanti', name: 'Tanti Spice', icon: Heart, color: 'text-amber-500' },
                                { id: 'dilly', name: 'Dilly Doubles', icon: Sparkles, color: 'text-blue-500' }
                            ].map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => { updateData({ starterCharacter: char.id }); nextStep(); }}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${formData.starterCharacter === char.id ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-100 hover:border-zinc-200'
                                        }`}
                                >
                                    <char.icon className={`w-12 h-12 ${char.color}`} />
                                    <span className="font-black text-deep text-sm">{char.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 6 && (
                    <motion.div
                        key="step6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Star className="w-12 h-12 text-emerald-500 fill-emerald-500" />
                        </div>
                        <h2 className="text-4xl font-black text-deep mb-4">{steps[5].title}</h2>
                        <p className="text-deep/60 font-medium mb-10 leading-relaxed max-w-sm mx-auto">
                            The adventure begins! We've saved your preferences. {formData.country === 'US' ? 'Check out the $10 Intro Envelope or explore the island world free.' : 'Unlock the full digital library or start exploring free.'}
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => router.push('/portal')}
                                className="w-full py-5 bg-white text-deep border-2 border-emerald-100 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-sm"
                            >
                                Explore Free Forever
                            </button>
                            <button
                                onClick={() => router.push(formData.country === 'US' ? '/checkout?sku=INTRO_ENVELOPE_USA' : '/checkout?sku=DIGITAL_STARTER_GLOBAL')}
                                className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                            >
                                {formData.country === 'US' ? 'Get the $10 Intro Envelope' : 'Unlock Full Digital Access'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {step > 1 && step < 6 && (
                <button
                    onClick={prevStep}
                    className="mt-12 flex items-center gap-2 text-sm font-bold text-deep/30 hover:text-deep transition-colors mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            )}
        </div>
    );
}
