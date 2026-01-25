"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Successful login
            router.push('/portal');
            router.refresh();
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-border">
                <div className="text-center">
                    <Link href="/" className="inline-block relative w-48 h-12 mb-8">
                        <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                    </Link>
                    <h2 className="text-3xl font-bold text-deep">Welcome Back!</h2>
                    <p className="text-deep/50 mt-2">Log in to your cultural gateway.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-deep/60 ml-4 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="legend@island.com"
                                className="w-full bg-zinc-50 border-2 border-border focus:border-primary rounded-3xl py-4 pl-14 pr-6 text-sm focus:outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-deep/60 ml-4 uppercase tracking-widest">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-50 border-2 border-border focus:border-primary rounded-3xl py-4 pl-14 pr-12 text-sm focus:outline-none transition-all"
                                required
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full py-5 text-lg group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Login to Universe <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center space-y-4 pt-4">
                    <Link href="#" className="text-sm font-bold text-primary hover:underline">Forgot password?</Link>
                    <div className="text-sm text-deep/40">
                        Don't have an account? <Link href="/signup" className="text-secondary font-bold hover:underline">Start your adventure</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
