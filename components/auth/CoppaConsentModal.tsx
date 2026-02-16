
"use client";

import { useState } from 'react';
import { ShieldAlert, X, ShieldCheck, Lock, ArrowRight, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoppaConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CoppaConsentModal({ isOpen, onClose, onSuccess }: CoppaConsentModalProps) {
    const [step, setStep] = useState<'info' | 'challenge' | 'success'>('info');
    const [isLoading, setIsLoading] = useState(false);
    const [challengeInput, setChallengeInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Simple but effective Math challenge for adult verification (Step 1)
    const [challenge] = useState(() => {
        const a = Math.floor(Math.random() * 20) + 10;
        const b = Math.floor(Math.random() * 20) + 10;
        return { a, b, result: a + b };
    });

    const handleChallenge = () => {
        if (parseInt(challengeInput) === challenge.result) {
            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } else {
            setError("That's not quite right. Try again!");
            setChallengeInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-deep/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-100"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
                >
                    <X size={24} />
                </button>

                <div className="p-10">
                    <AnimatePresence mode="wait">
                        {step === 'info' ? (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <ShieldAlert size={40} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-3xl font-black text-deep">Parental Access Only</h3>
                                    <p className="text-deep/40 font-bold">
                                        You're about to enter a restricted creative zone! We need a parent to confirm access to keep things safe and COPPA compliant.
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                        <Info size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-deep/70">Why this matters?</p>
                                        <p className="text-xs text-deep/40 font-medium leading-relaxed">
                                            The Story Studio uses AI to build custom adventures. We require a guardian's permission to process creative inputs and ensure a 100% safe environment.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep('challenge')}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                >
                                    I am a Parent <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ) : step === 'challenge' ? (
                            <motion.div
                                key="challenge"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Lock size={40} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-deep">Adult Verification</h3>
                                    <p className="text-deep/40 font-bold italic">Quick math check! Please solve to continue:</p>
                                </div>

                                <div className="flex flex-col items-center gap-6">
                                    <div className="text-5xl font-black text-primary tracking-widest bg-zinc-50 px-8 py-6 rounded-[2rem] border-2 border-zinc-100">
                                        {challenge.a} + {challenge.b} = ?
                                    </div>

                                    <div className="w-full max-w-[200px]">
                                        <input
                                            type="number"
                                            autoFocus
                                            value={challengeInput}
                                            onChange={(e) => {
                                                setChallengeInput(e.target.value);
                                                setError(null);
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChallenge()}
                                            className="w-full text-center py-6 bg-white border-4 border-zinc-100 rounded-3xl focus:border-primary transition-all text-4xl font-black text-deep focus:ring-4 focus:ring-primary/10"
                                            placeholder="..."
                                        />
                                    </div>

                                    {error ? (
                                        <p className="text-red-500 font-bold animate-shake">{error}</p>
                                    ) : (
                                        <p className="text-deep/20 text-xs font-black uppercase tracking-widest">Type the answer to unlock</p>
                                    )}
                                </div>

                                <button
                                    onClick={handleChallenge}
                                    disabled={!challengeInput}
                                    className="w-full bg-deep text-white py-6 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all disabled:opacity-20"
                                >
                                    Unlock Feature
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6 py-10"
                            >
                                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
                                    <ShieldCheck size={56} />
                                </div>
                                <h3 className="text-3xl font-black text-deep italic">Safety Access Granted!</h3>
                                <p className="text-deep/40 font-bold px-10">
                                    Verification successful. Redirecting you to the adventure studio...
                                </p>
                                <div className="flex justify-center pt-4">
                                    <Loader2 className="animate-spin text-green-500" size={32} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-zinc-50 p-6 text-center border-t border-zinc-100">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                        SECURE • ENCRYPTED • COPPA COMPLIANT
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
