"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, User, Sparkles, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { signupAction } from '@/app/actions/auth-actions';
import { trackEvent } from '@/lib/analytics';
import { MessageSquare } from 'lucide-react';
import WhatsAppOtpForm from '@/components/auth/WhatsAppOtpForm';
import { createClient } from '@/lib/supabase/client';

// Signup Form Component
function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Helpers
    const getParam = (key: string, fallback: string) => {
        try {
            let value = searchParams?.get(key);
            if (!value) return fallback;
            // Remove zero-width spaces and other invisible Unicode characters
            value = value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            return value || fallback;
        } catch {
            return fallback;
        }
    };

    const plan = getParam('plan', 'mail_club');
    // Support both ?ref= (from invite links) and ?referral= (legacy)
    const referral = getParam('ref', '') || getParam('referral', 'direct');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugMsg, setDebugMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [signupMethod, setSignupMethod] = useState<'email' | 'whatsapp'>('email');

    const [formData, setFormData] = useState({
        childName: getParam('childName', ''),
        email: '',
        password: '',
        agreed: false
    });

    useEffect(() => {
        trackEvent('signup_viewed', { plan });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setDebugMsg(null);
        setIsLoading(true);

        try {
            // 1. Validation
            if (!formData.agreed) throw new Error("Please agree to the Terms and Privacy Policy.");
            if (!formData.email || !formData.password || !formData.childName) throw new Error("Please fill in all fields.");
            if (formData.password.length < 6) throw new Error("Password must be at least 6 characters.");

            // 2. Call Branded Signup Action
            const result = await signupAction({
                email: formData.email,
                password: formData.password,
                childName: formData.childName,
                plan: plan,
                referral: referral
            });

            if (!result.success) {
                if (result.error?.includes('already registered')) {
                    throw new Error("This email is already registered. Please log in.");
                }
                throw new Error(result.error || "Could not create account.");
            }

            const userId = result.userId;
            trackEvent('signup_initiated', { userId, plan });

            // Defensive: ensure a session exists client-side
            try {
                const supabase = createClient();
                await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });
            } catch (e) {
                console.warn('Client sign-in after signup failed', e);
            }

            // Require a real client session before onboarding.
            // This avoids pushing users into protected onboarding pages without auth.
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const hasClientSession = !!session?.user;

            // 3. Handle State
            if (result.emailSent) {
                setIsEmailSent(true);
            } else {
                const nextPath = `/onboarding/welcome?uid=${userId}&childName=${encodeURIComponent(formData.childName)}`;
                if (result.requiresLogin || !hasClientSession) {
                    router.push(`/login?redirect=${encodeURIComponent(nextPath)}`);
                    return;
                }

                // Determine redirect based on plan
                const FREE_PLANS = ['free', 'mail_club', 'free_trial'];
                const isFreePlan = FREE_PLANS.includes(plan);

                if (isFreePlan) {
                    // Free plan → skip checkout, go straight to onboarding
                    router.push(`/onboarding/welcome?uid=${userId}&childName=${encodeURIComponent(formData.childName)}`);
                } else {
                    // Paid plan → go to checkout
                    const planToTier: Record<string, string> = {
                        'starter_mailer': 'starter_mailer',
                        'legends_plus': 'legends_plus',
                        'annual_plus': 'legends_plus',
                        'family_legacy': 'family_legacy',
                        'legends_plus_annual': 'legends_plus',
                    };
                    const normalizedPlan = planToTier[plan] || 'legends_plus';
                    const cycle = (plan === 'annual_plus' || plan === 'legends_plus_annual') ? 'year' : 'month';
                    router.push(`/checkout?plan=${normalizedPlan}&cycle=${cycle}&uid=${userId}&childName=${encodeURIComponent(formData.childName)}`);
                }
            }

        } catch (err: any) {
            console.error("Critical Signup Failure:", err);
            setError(err.message || "An unexpected error occurred.");
            setDebugMsg(err.toString());
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-center py-12 px-4 font-sans text-center">
                <div className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border border-zinc-100">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <Mail size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-deep mb-4">Check your email!</h2>
                    <p className="text-deep/50 font-bold mb-8">
                        We've sent a magic link to <span className="text-primary">{formData.email}</span>.
                        Click it to confirm your account and start the adventure!
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-zinc-100 text-deep font-black rounded-2xl hover:bg-zinc-200 transition-all"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex justify-center mb-10 group">
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-zinc-100 group-hover:border-primary transition-all">
                        <ArrowLeft size={18} className="text-zinc-400 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                        <span className="font-bold text-deep/60 group-hover:text-deep">Back to home</span>
                    </div>
                </Link>
                <div className="text-center">
                    <div className="relative h-16 w-48 mx-auto mb-8">
                        <Image
                            src="/images/logo.png"
                            alt="Likkle Legends"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-4xl font-black text-deep tracking-tight">Create your account</h2>
                    <p className="mt-4 text-lg text-deep/40 font-bold">
                        Start your child's Caribbean adventure today.
                    </p>
                </div>
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10 px-4">
                <div className="bg-white py-12 px-10 shadow-2xl shadow-zinc-200/50 rounded-[3.5rem] border border-zinc-100 relative overflow-hidden">
                    <div className="flex p-1 bg-zinc-100 rounded-2xl mb-8">
                        <button
                            onClick={() => setSignupMethod('email')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${signupMethod === 'email' ? 'bg-white shadow-sm text-primary' : 'text-deep/40'}`}
                        >
                            Email & Password
                        </button>
                        <button
                            onClick={() => setSignupMethod('whatsapp')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${signupMethod === 'whatsapp' ? 'bg-white shadow-sm text-emerald-600' : 'text-deep/40'}`}
                        >
                            <MessageSquare size={16} fill={signupMethod === 'whatsapp' ? 'currentColor' : 'none'} />
                            WhatsApp OTP
                        </button>
                    </div>

                    {signupMethod === 'whatsapp' ? (
                        <WhatsAppOtpForm
                            isSignup
                            initialData={{
                                childName: formData.childName,
                                plan: plan,
                                referral: referral
                            }}
                        />
                    ) : (
                        <form className="space-y-8" onSubmit={handleSignup}>
                            <div>
                                <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Child's Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        name="childName"
                                        value={formData.childName}
                                        onChange={handleChange}
                                        placeholder="Kai..."
                                        className="block w-full pl-14 pr-5 py-5 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@heritage.com"
                                        className="block w-full pl-14 pr-5 py-5 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Create Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="block w-full pl-14 pr-12 py-5 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-zinc-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 px-1">
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    id="coppa-consent"
                                    checked={formData.agreed}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 rounded border-zinc-200 text-primary focus:ring-primary/20"
                                    required
                                />
                                <label htmlFor="coppa-consent" className="text-sm text-deep/50 leading-tight">
                                    I confirm I am a parent or legal guardian and agree to the{' '}
                                    <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
                                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                                </label>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <p className="text-sm font-bold">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-6 px-10 border border-transparent rounded-[2rem] shadow-xl shadow-primary/20 text-xl font-black text-white bg-primary hover:scale-[1.02] active:scale-95 transition-all focus:outline-none ring-offset-4 focus:ring-4 focus:ring-primary/40 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        Start Adventure <Sparkles size={24} className="ml-3 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-10 border-t border-zinc-50">
                        <p className="text-center text-deep/40 font-bold">
                            Already part of the club?{' '}
                            <Link href="/login" className="text-primary hover:underline font-black">
                                Log in here
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-10 text-center text-xs text-deep/20 font-bold uppercase tracking-widest">
                    Safe for kids. Trusted by parents. 🛡️
                </p>
            </div>
        </div>
    );
}

// Main Page with Suspense Boundary
export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
}
