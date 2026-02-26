"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess(true);
                setTimeout(() => router.push('/portal'), 2500);
            }
        } catch (err: any) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-4 font-sans">
                <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-zinc-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-deep mb-4">Password Updated!</h2>
                    <p className="text-deep/50 font-bold">Taking you to the portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-4 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />

            <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-zinc-100 relative z-10">
                <div className="text-center mb-10">
                    <div className="relative h-12 w-48 mx-auto mb-8">
                        <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                    </div>
                    <h2 className="text-3xl font-black text-deep">Set a new password</h2>
                    <p className="text-deep/50 mt-2 font-bold">Choose something strong for the village.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100 mb-6">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-deep/30 uppercase tracking-widest px-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/20" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-50 border-none focus:ring-4 focus:ring-primary/10 rounded-2xl py-5 pl-14 pr-12 text-lg text-deep font-bold placeholder:text-deep/20 focus:outline-none transition-all"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-deep/30 hover:text-primary transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-deep/30 uppercase tracking-widest px-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/20" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-50 border-none focus:ring-4 focus:ring-primary/10 rounded-2xl py-5 pl-14 pr-12 text-lg text-deep font-bold placeholder:text-deep/20 focus:outline-none transition-all"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 bg-primary text-white text-xl font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Update Password'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-sm font-bold text-deep/40 hover:text-primary transition-colors">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
