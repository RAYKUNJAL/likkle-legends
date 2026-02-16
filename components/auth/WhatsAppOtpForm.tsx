
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Phone, ArrowRight, Loader2, CheckCircle2, AlertCircle, RefreshCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendWhatsAppOtpAction, verifyWhatsAppOtpAction } from '@/app/actions/identity-actions';

interface WhatsAppOtpFormProps {
    onSuccess?: (result: any) => void;
    isSignup?: boolean;
    initialData?: {
        childName?: string;
        email?: string;
        plan?: string;
        referral?: string;
    };
}

export default function WhatsAppOtpForm({ onSuccess, isSignup, initialData }: WhatsAppOtpFormProps) {
    const router = useRouter();
    const [step, setStep] = useState<'phone' | 'otp' | 'finalize'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [extraData, setExtraData] = useState({
        childName: initialData?.childName || '',
        email: initialData?.email || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleSendOtp = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Normalize phone number (ensure + at start)
        let normalizedPhone = phone.trim();
        if (!normalizedPhone.startsWith('+')) {
            normalizedPhone = '+' + normalizedPhone.replace(/\D/g, '');
        }

        const result = await sendWhatsAppOtpAction(normalizedPhone);

        if (result.success) {
            setPhone(normalizedPhone);
            setStep('otp');
            startCooldown();
        } else {
            setError(result.error || "Failed to send WhatsApp message. Please check the number.");
        }
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const result = await verifyWhatsAppOtpAction(phone, otp, isSignup ? {
            childName: extraData.childName,
            email: extraData.email,
            plan: initialData?.plan,
            referral: initialData?.referral
        } : undefined);

        if (result.success) {
            if (result.needsSignup) {
                setStep('finalize');
            } else if (result.magicLink) {
                onSuccess?.(result);
                router.push(result.magicLink);
            }
        } else {
            setError(result.error || "Invalid verification code.");
        }
        setIsLoading(false);
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!extraData.childName || !extraData.email) {
            setError("Please fill in both fields.");
            setIsLoading(false);
            return;
        }

        const result = await verifyWhatsAppOtpAction(phone, otp, {
            childName: extraData.childName,
            email: extraData.email,
            plan: initialData?.plan,
            referral: initialData?.referral
        });

        if (result.success && result.magicLink) {
            onSuccess?.(result);
            router.push(result.magicLink);
        } else {
            setError(result.error || "Failed to finalize account.");
        }
        setIsLoading(false);
    };

    const startCooldown = () => {
        setResendCooldown(60);
        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {step === 'phone' ? (
                    <motion.form
                        key="phone-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleSendOtp}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2 mb-8">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                <MessageSquare fill="currentColor" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-deep">{isSignup ? 'Sign up' : 'Sign in'} with WhatsApp</h3>
                            <p className="text-deep/40 font-bold">We'll send you a quick code to verify it's you.</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-xs font-black text-deep/30 uppercase tracking-[0.2em] mb-3 px-1">WhatsApp Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                                    <Phone size={20} />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (868) 000-0000"
                                    className="block w-full pl-14 pr-5 py-5 bg-zinc-50 border-none rounded-3xl focus:ring-4 focus:ring-emerald-500/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg shadow-inner"
                                    required
                                />
                            </div>
                            <p className="mt-3 text-[10px] text-deep/30 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                                Includes country code (e.g. +1 for Trinidad, Jamaica, US/Canada)
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Send Code <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-deep/30 font-bold leading-relaxed">
                            Message and data rates may apply. WhatsApp is private and secure. 🛡️
                        </p>
                    </motion.form>
                ) : step === 'otp' ? (
                    <motion.form
                        key="otp-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2 mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-deep">Check your WhatsApp</h3>
                            <p className="text-deep/40 font-bold">
                                We sent a 6-digit code to <br />
                                <span className="text-deep/80 whitespace-nowrap">{phone}</span>
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="flex justify-center">
                            <input
                                type="text"
                                inputMode="numeric"
                                autoFocus
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full max-w-[240px] tracking-[0.5em] text-center py-6 bg-zinc-50 border-none rounded-3xl focus:ring-4 focus:ring-blue-500/10 transition-all text-4xl font-black text-deep placeholder:text-deep/10 shadow-inner"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.length < 6}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm & Sign In'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => resendCooldown === 0 && handleSendOtp({ preventDefault: () => { } } as any)}
                                disabled={resendCooldown > 0 || isLoading}
                                className="text-deep/40 hover:text-primary font-bold transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto text-sm"
                            >
                                <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('phone')}
                                className="mt-6 text-[10px] font-black uppercase tracking-widest text-deep/20 hover:text-deep/60 transition-colors"
                            >
                                Wrong number? Change it here
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.form
                        key="finalize-step"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        onSubmit={handleFinalize}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2 mb-8">
                            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-deep">Final bit of magic</h3>
                            <p className="text-deep/40 font-bold">Help us island-hop to your dashboard!</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-2 px-1">Child's Name</label>
                                <input
                                    type="text"
                                    value={extraData.childName}
                                    onChange={(e) => setExtraData(prev => ({ ...prev, childName: e.target.value }))}
                                    placeholder="Kai..."
                                    className="w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-deep"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                <input
                                    type="email"
                                    value={extraData.email}
                                    onChange={(e) => setExtraData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="legend@island.com"
                                    className="w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-deep"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Enter the Universe'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
