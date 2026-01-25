"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useState, useEffect, Suspense } from 'react';
import { sendWelcomeEmailAction } from '@/app/actions/user-actions';
import { trackEvent } from '@/lib/analytics';

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
    const referral = getParam('referral', 'direct');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugMsg, setDebugMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        childName: getParam('childName', ''),
        email: '',
        password: '',
        agreed: false
    });

    // Cleanup session on mount
    useEffect(() => {
        const resetSession = async () => {
            await supabase.auth.signOut().catch(() => { });
        };
        resetSession();
        trackEvent('signup_viewed', { plan });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

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

            console.log("Starting signup flow for:", formData.email);

            // 2. Auth Signup
            // We pass metadata so the database trigger can populate fields immediately
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: 'Parent', // Default
                        child_name: formData.childName,
                        referral_source: referral,
                        chosen_plan: plan,
                        marketing_opt_in: true
                    }
                }
            });

            if (authError) {
                console.error("Auth Error:", authError);
                if (authError.message.includes('already registered')) {
                    throw new Error("This email is already registered. Please log in.");
                }
                throw authError;
            }

            if (!authData.user) {
                throw new Error("No user created. Please check your email for confirmation or try again.");
            }

            const userId = authData.user.id;
            console.log("User created:", userId);
            trackEvent('signup_auth_success', { userId, plan });

            // 3. Robust Profile Creation (Double Check)
            // Even if the DB trigger runs, we ensure the profile is correct via client-side check
            try {
                const tier = plan.includes('plus') ? 'legends_plus' : 'starter_mailer';

                // Try to select first to see if trigger worked
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', userId)
                    .single();

                if (existingProfile) {
                    console.log("Profile exists (trigger likely worked), updating...");
                    await supabase.from('profiles').update({
                        subscription_tier: tier,
                        parent_name: 'Parent',
                        marketing_opt_in: true,
                        // We don't overwrite child_name here as it's not on profiles table usually, 
                        // but we rely on the flow to create children later or triggered by DB
                    }).eq('id', userId);
                } else {
                    console.log("Profile missing, manually inserting...");
                    const { error: insertError } = await supabase.from('profiles').insert({
                        id: userId,
                        email: formData.email,
                        role: 'parent',
                        subscription_tier: tier,
                        subscription_status: 'inactive',
                        onboarding_completed: false,
                        parent_name: 'Parent',
                        marketing_opt_in: true
                    });

                    if (insertError) {
                        console.warn("Manual insertion warning (might be unnecessary):", insertError.message);
                        // Don't fail the whole flow if this fails - auth is successful
                    }
                }
            } catch (profileErr) {
                console.warn("Profile sync issue (non-fatal):", profileErr);
            }

            // 4. Welcome Email (Fire and Forget)
            try {
                // Using imported action safely
                sendWelcomeEmailAction(formData.email, 'Parent').catch(e => console.error("Email send bg error:", e));
            } catch (e) {
                console.warn("Could not dispatch welcome email:", e);
            }

            // 5. Success - Map plan to valid subscription tier record
            const planToTier: Record<string, string> = {
                'mail_club': 'starter_mailer',
                'starter_mailer': 'starter_mailer',
                'legends_plus': 'legends_plus',
                'annual_plus': 'legends_plus',
                'legends_plus_annual': 'legends_plus',
                'family_legacy': 'family_legacy'
            };

            const normalizedPlan = planToTier[plan] || 'legends_plus';
            const cycle = (plan === 'annual_plus' || plan === 'legends_plus_annual') ? 'year' : 'month';
            console.log("Redirecting to checkout with plan:", normalizedPlan, "cycle:", cycle);

            // Redirect
            router.push(`/checkout?plan=${normalizedPlan}&cycle=${cycle}&uid=${userId}&childName=${encodeURIComponent(formData.childName)}`);

        } catch (err: any) {
            console.error("Critical Signup Failure:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
            setDebugMsg(err.toString());
        } finally {
            setIsLoading(false);
        }
    };

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
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                            {debugMsg && process.env.NODE_ENV !== 'production' && (
                                <details className="text-xs text-left w-full mt-2 opacity-70">
                                    <summary>Debug Details</summary>
                                    <pre className="whitespace-pre-wrap mt-1">{debugMsg}</pre>
                                </details>
                            )}
                        </div>
                    )}

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
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="block w-full pl-14 pr-5 py-5 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg"
                                    required
                                    minLength={6}
                                />
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
