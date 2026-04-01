
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { forgotPasswordAction } from '@/app/actions/auth-actions';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await forgotPasswordAction(email);
            if (result.success) {
                setIsSent(true);
            } else {
                setError(result.error || "Failed to send reset link.");
            }
        } catch (err: any) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-4 font-sans">
                <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-zinc-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-deep mb-4">Check your email!</h2>
                    <p className="text-deep/50 font-bold mb-8">
                        We've sent a password reset link to <span className="text-primary">{email}</span>.
                        If it's in our village records, you'll see it soon!
                    </p>
                    <Link href="/login" className="block w-full py-4 bg-zinc-100 text-deep font-black rounded-2xl hover:bg-zinc-200 transition-all">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-4 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-zinc-100 relative z-10">
                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-deep/40 hover:text-primary transition-colors mb-8 font-bold text-sm">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                    <div className="relative h-12 w-48 mx-auto mb-8">
                        <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                    </div>
                    <h2 className="text-3xl font-black text-deep">Lost your magic key?</h2>
                    <p className="text-deep/50 mt-2 font-bold">We'll help you get back into the village.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label htmlFor="forgot-email" className="text-xs font-black text-deep/30 uppercase tracking-widest px-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/20" size={20} />
                            <input
                                id="forgot-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="legend@island.com"
                                className="w-full bg-zinc-50 border-none focus:ring-4 focus:ring-primary/10 rounded-2xl py-5 pl-14 pr-6 text-lg text-deep font-bold placeholder:text-deep/20 focus:outline-none transition-all"
                                required
                                aria-required="true"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 bg-primary text-white text-xl font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Send Magic Link <Sparkles size={24} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
