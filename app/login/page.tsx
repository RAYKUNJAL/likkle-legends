
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendMagicLinkAction, signInAction } from '@/app/actions/auth-actions';
import { createClient } from '@/lib/supabase/client';

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
        </svg>
    );
}

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

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setError(null);
        setIsLoading(true);
        try {
            const supabase = createClient();
            const redirectUrl = searchParams.get('redirect');
            const next = redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//') ? redirectUrl : '/portal';
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
                    queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : {}
                }
            });
            if (oauthError) throw oauthError;
        } catch (err: any) {
            setError(err.message || `${provider} sign-in failed. Please try another method.`);
            setIsLoading(false);
        }
    };

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

                {/* Social Auth */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-zinc-200 rounded-2xl font-black text-deep hover:border-primary hover:bg-zinc-50 transition-all disabled:opacity-50"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#1877F2] border-2 border-[#1877F2] rounded-2xl font-black text-white hover:bg-[#166FE5] transition-all disabled:opacity-50"
                    >
                        <FacebookIcon />
                        Continue with Facebook
                    </button>
                </div>

                <div className="flex items-center gap-4 my-2">
                    <div className="flex-1 h-px bg-zinc-100"></div>
                    <span className="text-xs font-black text-deep/30 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-zinc-100"></div>
                </div>

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

                        {loginMethod === 'password' && (
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
                                        required={loginMethod === 'password'}
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
