"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, User, Sparkles, Loader2, AlertCircle, Eye, EyeOff, MapPin, Baby, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState, Suspense, type ReactNode } from 'react';
import { signupAction } from '@/app/actions/auth-actions';
import { trackEvent } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/client';
import { CARIBBEAN_ISLANDS } from '@/lib/islands';

const ISLANDS = [
    ...CARIBBEAN_ISLANDS.map((island) => ({
        id: island.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        name: island.name,
        flag: island.flag,
    })),
    { id: 'mixed', name: 'Island Explorer', flag: '🌴' },
];

const ISLAND_ALIASES: Record<string, string> = {
    trinidad: 'trinidad_and_tobago',
    tobago: 'trinidad_and_tobago',
    antigua: 'antigua_and_barbuda',
    st_lucia: 'saint_lucia',
    st_vincent: 'saint_vincent_and_the_grenadines',
    st_kitts: 'saint_kitts_and_nevis',
    curacao: 'curacao',
};

function cleanParam(searchParams: ReturnType<typeof useSearchParams>, key: string, fallback = '') {
    try {
        const value = searchParams?.get(key);
        return value ? value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() : fallback;
    } catch (_e) {
        return fallback;
    }
}


function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = cleanParam(searchParams, 'plan', 'mail_club');
    const referral = cleanParam(searchParams, 'ref') || cleanParam(searchParams, 'referral', 'direct');
    const rawInitialIsland = cleanParam(searchParams, 'island', 'mixed');
    const initialIsland = ISLAND_ALIASES[rawInitialIsland] || rawInitialIsland;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        parentName: cleanParam(searchParams, 'parentName'),
        childName: cleanParam(searchParams, 'childName'),
        childAge: Number(cleanParam(searchParams, 'age', '5')) || 5,
        island: ISLANDS.some((island) => island.id === initialIsland) ? initialIsland : 'mixed',
        email: cleanParam(searchParams, 'email'),
        password: '',
        agreed: false,
    });

    const selectedIsland = useMemo(
        () => ISLANDS.find((island) => island.id === formData.island) || ISLANDS[ISLANDS.length - 1],
        [formData.island]
    );

    useEffect(() => {
        trackEvent('signup_viewed', { plan, island: formData.island });
    }, [plan, formData.island]);

    const updateField = (field: keyof typeof formData, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const redirectAfterSignup = async (email: string, password: string, userId?: string) => {
        const supabase = createClient();
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

        if (signInErr) {
            const nextPath = userId ? `/onboarding/child?uid=${encodeURIComponent(userId)}` : '/onboarding/child';
            router.push(`/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(nextPath)}`);
            return;
        }

        router.push('/onboarding/child');
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!formData.agreed) throw new Error('Please confirm you are the parent or legal guardian.');
            if (!formData.parentName.trim()) throw new Error('Please enter your name.');
            if (!formData.childName.trim()) throw new Error("Please enter your child's name.");
            if (!formData.email.includes('@')) throw new Error('Please enter a valid email address.');
            if (formData.password.length < 6) throw new Error('Password must be at least 6 characters.');
            if (!formData.island) throw new Error('Please choose an island heritage.');

            const result = await signupAction({
                email: formData.email,
                password: formData.password,
                parentName: formData.parentName,
                childName: formData.childName,
                childAge: formData.childAge,
                island: formData.island,
                plan,
                referral,
            });

            if (!result.success) {
                if (result.error?.toLowerCase().includes('registered')) {
                    throw new Error('This email is already registered. Log in and continue to the portal.');
                }
                throw new Error(result.error || 'Could not create account. Please try again.');
            }

            trackEvent('signup_completed', {
                userId: result.userId,
                childId: result.childId,
                plan,
                island: formData.island,
            });

            const freePlans = ['free', 'mail_club', 'free_trial'];
            if (freePlans.includes(plan)) {
                await redirectAfterSignup(formData.email, formData.password, result.userId);
                return;
            }

            const planToTier: Record<string, string> = {
                starter_mailer: 'starter_mailer',
                digital_explorer: 'digital_explorer',
                legends_plus: 'legends_plus',
                annual_plus: 'legends_plus',
                family_legacy: 'family_legacy',
                legends_plus_annual: 'legends_plus',
            };
            const normalizedPlan = planToTier[plan] || 'legends_plus';
            const cycle = (plan === 'annual_plus' || plan === 'legends_plus_annual') ? 'year' : 'month';
            router.push(`/checkout?plan=${normalizedPlan}&cycle=${cycle}&uid=${result.userId || ''}&childName=${encodeURIComponent(formData.childName)}`);
        } catch (err: any) {
            console.error('Signup Error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFDF7] font-sans text-deep">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
                <section className="relative flex flex-1 flex-col justify-center overflow-hidden px-6 py-10 lg:px-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,210,63,0.18),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(58,190,249,0.16),transparent_34%)]" />
                    <div className="relative z-10 max-w-xl">
                        <Link href="/" className="mb-10 inline-flex items-center gap-2 rounded-2xl border border-zinc-100 bg-white px-5 py-3 font-bold text-deep/60 shadow-sm hover:border-primary hover:text-deep">
                            <ArrowLeft size={18} /> Back to home
                        </Link>

                        <div className="relative mb-8 h-16 w-52">
                            <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" priority />
                        </div>

                        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary">
                            <ShieldCheck size={16} /> Parent setup first
                        </p>
                        <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-6xl">
                            Start your child&apos;s Caribbean learning adventure.
                        </h1>
                        <p className="mt-6 text-lg font-semibold leading-relaxed text-deep/55">
                            Create your parent account, add your first child, and open a warm island-powered learning home built for ages 3 to 9.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            {['No credit card for free plan', 'Parent-approved setup', 'Choose your island heritage'].map((item) => (
                                <div key={item} className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-black text-deep/60 shadow-sm">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex flex-1 items-center justify-center px-4 py-10 lg:px-10">
                    <div className="w-full max-w-xl rounded-[2.5rem] border border-zinc-100 bg-white p-6 shadow-2xl shadow-zinc-200/70 sm:p-10">
                        <div className="mb-8 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">Start the Adventure</h2>
                                <p className="mt-2 font-bold text-deep/40">Set up your family in under a minute.</p>
                            </div>
                            <div className="rounded-2xl bg-primary/10 px-4 py-3 text-center">
                                <div className="text-3xl">{selectedIsland.flag}</div>
                                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary">{selectedIsland.name}</p>
                            </div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSignup}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field icon={<User size={18} />} label="Parent Name">
                                    <input value={formData.parentName} onChange={(e) => updateField('parentName', e.target.value)} placeholder="Ray" className="field-input" required />
                                </Field>
                                <Field icon={<Baby size={18} />} label="Child Name">
                                    <input value={formData.childName} onChange={(e) => updateField('childName', e.target.value)} placeholder="Kai" className="field-input" required />
                                </Field>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                                <Field icon={<Sparkles size={18} />} label="Age">
                                    <select value={formData.childAge} onChange={(e) => updateField('childAge', Number(e.target.value))} className="field-input" aria-label="Child age">
                                        {[3, 4, 5, 6, 7, 8, 9].map((age) => <option key={age} value={age}>{age}</option>)}
                                    </select>
                                </Field>
                                <Field icon={<MapPin size={18} />} label="Island Heritage">
                                    <select value={formData.island} onChange={(e) => updateField('island', e.target.value)} className="field-input" aria-label="Island heritage">
                                        {ISLANDS.map((island) => (
                                            <option key={island.id} value={island.id}>{island.flag} {island.name}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <Field icon={<Mail size={18} />} label="Email Address">
                                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@heritage.com" className="field-input" required />
                            </Field>

                            <Field icon={<Lock size={18} />} label="Password">
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="6+ characters" className="field-input pr-12" minLength={6} required />
                                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-deep/30 hover:text-primary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </Field>

                            <label className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-4 text-sm font-semibold leading-snug text-deep/55">
                                <input type="checkbox" checked={formData.agreed} onChange={(e) => updateField('agreed', e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-zinc-200 text-primary focus:ring-primary/20" required />
                                <span>I am the parent or legal guardian and agree to the <Link href="/terms" className="font-black text-primary hover:underline">Terms</Link> and <Link href="/privacy" className="font-black text-primary hover:underline">Privacy Policy</Link>.</span>
                            </label>

                            {error && (
                                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <p className="text-sm font-bold">{error}</p>
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-primary px-8 py-5 text-xl font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70">
                                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Create Account & Enter Portal <Sparkles size={24} /></>}
                            </button>
                        </form>

                        <p className="mt-8 text-center font-bold text-deep/40">
                            Already have an account? <Link href="/login" className="font-black text-primary hover:underline">Log in</Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 flex items-center gap-2 px-1 text-xs font-black uppercase tracking-widest text-deep/35">
                {icon} {label}
            </span>
            {children}
        </label>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
            <SignupForm />
        </Suspense>
    );
}
