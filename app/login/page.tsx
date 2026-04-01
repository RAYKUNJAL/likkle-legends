
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendMagicLinkAction, signInAction } from '@/app/actions/auth-actions';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'password' | 'magiclink'>('password');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'auth-callback-failed') {
            setError("The magic link expired or was already used. Please request a new one.");
        }
    }, [searchParams]);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Server Action Login (robust cookie handling)
        const result = await signInAction(email, password);

        if (result.success) {
            // Smart Redirect
            const resultAny = result as any;
            let redirectUrl = searchParams.get('redirect');

            // Only allow relative paths to prevent open redirect attacks
            if (!redirectUrl || redirectUrl.startsWith('http') || redirectUrl.startsWith('//')) {
                if (resultAny.isAdmin) {
                    redirectUrl = '/admin';
                } else {
                    redirectUrl = '/portal';
                }
            }

            router.push(redirectUrl);
        } else {
            console.error('Login failed:', result.error);
            setError(result.error || 'Invalid email or password');
            setIsLoading(false);
        }
    };

    const handleMagicLinkLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address first.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await sendMagicLinkAction(email);
            if (result.success) {
                setIsMagicLinkSent(true);
            } else {
                setError(result.error || "Failed to send magic link. Please try again.");
            }
        } catch (err: any) {
            console.error('Magic link failed:', err);
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isMagicLinkSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md space-y-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-border text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-green-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-deep">Check your email!</h2>
                    <p className="text-deep/60">
                        We've sent a branded login link to <span className="font-bold text-deep">{email}</span>.
                        Click the link in the email to sign in instantly.
                    </p>
                    <div className="pt-6">
                        <button
                            onClick={() => setIsMagicLinkSent(false)}
                            className="text-primary font-bold hover:underline"
                        >
                            Back to login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-border">
                <div className="text-center">
                    <Link href="/" className="inline-block relative w-48 h-12 mb-8">
                        <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                    </Link>
                    <h2 className="text-3xl font-bold text-deep">Welcome Back!</h2>
                    <p className="text-deep/50 mt-2 italic">Log in to your cultural gateway.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex p-1 bg-zinc-100 rounded-2xl mb-6">
                    <button
                        onClick={() => setLoginMethod('password')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${loginMethod === 'password' ? 'bg-white shadow-sm text-primary' : 'text-deep/40 hover:text-deep/60'}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => setLoginMethod('magiclink')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${loginMethod === 'magiclink' ? 'bg-white shadow-sm text-primary' : 'text-deep/40 hover:text-deep/60'}`}
                    >
                        Magic
                    </button>
                </div>

                <form className="space-y-6" onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleMagicLinkLogin}>
                        <div className="space-y-2">
                            <label htmlFor="email-login" className="text-sm font-bold text-deep/60 ml-4 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={20} />
                                <input
                                    id="email-login"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="legend@island.com"
                                    className="w-full bg-zinc-50 border-2 border-border focus:border-primary rounded-3xl py-4 pl-14 pr-6 text-sm focus:outline-none transition-all"
                                    required
                                    aria-required="true"
                                />
                            </div>
                        </div>

                        {loginMethod === 'password' && (
                            <div className="space-y-2">
                                <label htmlFor="password-login" className="text-sm font-bold text-deep/60 ml-4 uppercase tracking-widest">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={20} />
                                    <input
                                        id="password-login"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-zinc-50 border-2 border-border focus:border-primary rounded-3xl py-4 pl-14 pr-12 text-sm focus:outline-none transition-all"
                                        required={loginMethod === 'password'}
                                        aria-required="true"
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
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full py-5 text-lg group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    {loginMethod === 'password' ? 'Login to Universe' : 'Send Magic Link'}
                                    {loginMethod === 'password' ? <ArrowRight className="group-hover:translate-x-1 transition-transform" /> : <Sparkles className="group-hover:scale-110 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>

                <div className="text-center space-y-4 pt-4">
                    {loginMethod === 'password' && (
                        <Link href="/forgot-password" className={`text-sm font-bold text-primary hover:underline block ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                            Forgot password?
                        </Link>
                    )}
                    <div className="text-sm text-deep/40">
                        Don't have an account? <Link href="/signup" className="text-secondary font-bold hover:underline">Start your adventure</Link>
                    </div>
                    <div className="pt-2 border-t border-zinc-100">
                        <Link href="/admin" className="text-xs text-deep/25 hover:text-deep/50 font-bold uppercase tracking-widest transition-colors">
                            Admin Panel
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
