'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
    Lock,
    ShieldCheck,
    Mail,
    User,
    Globe,
    CheckCircle2,
    ArrowRight,
    AlertCircle,
    Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SUBSCRIPTION_PLANS } from '@/lib/paypal';
import { supabase } from '@/lib/supabase-client';
import { fireConversionEvent } from '@/lib/analytics';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

// Intro Mailer = plan_mail_intro (PayPal plan id from NEXT_PUBLIC_PAYPAL_PLAN_STARTER).
const INTRO_PLAN = SUBSCRIPTION_PLANS.plan_mail_intro;
const INTRO_PRICE = INTRO_PLAN.price; // 9.99 / month

// Order bump: Printable Phonics Pack — one-time $9.
const PHONICS_PACK_PRICE = 9.0;
const PHONICS_PACK_NAME = 'Printable Phonics Pack';

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'TT', name: 'Trinidad & Tobago' },
    { code: 'BB', name: 'Barbados' },
    { code: 'GY', name: 'Guyana' },
    { code: 'LC', name: 'St. Lucia' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'AG', name: 'Antigua & Barbuda' },
    { code: 'DM', name: 'Dominica' },
    { code: 'GD', name: 'Grenada' },
    { code: 'KN', name: 'St. Kitts & Nevis' },
    { code: 'VC', name: 'St. Vincent & Grenadines' },
    { code: 'HT', name: 'Haiti' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'Other', name: 'Other / Not Listed' },
];

function validateEmail(email: string): string | null {
    if (!email.trim()) return 'Email is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Please enter a valid email address';
    return null;
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: searchParams.get('email') || '',
        firstName: '',
        lastName: '',
        country: 'US',
        addPhonicsPack: false,
    });
    const [emailTouched, setEmailTouched] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paypalReady, setPaypalReady] = useState(false);

    const dueToday = formData.addPhonicsPack ? PHONICS_PACK_PRICE : 0;

    // CRO: fire begin_checkout on mount.
    useEffect(() => {
        fireConversionEvent('begin_checkout', { tier: 'plan_mail_intro', source: 'offer_checkout' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        supabase.auth
            .getSession()
            .then(({ data }) => setHasSession(!!data.session))
            .catch(() => setHasSession(false));
    }, []);

    const emailValid = validateEmail(formData.email) === null;
    const formReady = emailValid && !!formData.firstName.trim() && !!formData.lastName.trim();

    const handleEmailBlur = () => {
        setEmailTouched(true);
        setEmailError(validateEmail(formData.email));
    };

    const togglePhonicsPack = () => {
        setFormData((prev) => ({ ...prev, addPhonicsPack: !prev.addPhonicsPack }));
    };

    const buildSignupHref = () => {
        const params = new URLSearchParams();
        params.set('plan', 'starter_mailer');
        if (formData.email) params.set('email', formData.email);
        if (formData.firstName) params.set('firstName', formData.firstName);
        return `/signup?${params.toString()}`;
    };

    // If user has no Supabase session, route through signup first so the
    // confirm endpoint (which requires auth) can run after account creation.
    const needsSignup = hasSession === false && !searchParams.get('uid');

    return (
        <PayPalScriptProvider
            key="offer-paypal-subscription"
            options={{
                clientId: PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'subscription',
                vault: true,
            }}
        >
            <main className="min-h-screen bg-[#FFFDF7] flex flex-col">
                {/* ── Minimal header: logo + secure checkout + 30-second promise ── */}
                <header className="w-full bg-white border-b border-zinc-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="relative w-40 h-10 sm:w-48 sm:h-12 shrink-0">
                            <Image
                                src="/images/logo.png"
                                alt="Likkle Legends"
                                fill
                                className="object-contain"
                                priority
                            />
                        </Link>
                        <div className="flex items-center gap-4 text-deep/60">
                            {/* 2026 CRO: 30-second checkout promise reduces a top
                                cart-abandonment fear ("this is going to be long"). */}
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-success">
                                ⏱️ 30-Second Checkout
                            </span>
                            <div className="flex items-center gap-2 text-deep/60">
                                <Lock size={16} className="text-success" />
                                <span className="text-xs font-black uppercase tracking-widest">
                                    Secure Checkout
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10">
                        {/* ── LEFT: Product summary + order bump + form ── */}
                        <section className="space-y-6">
                            {/* Product summary */}
                            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5 sm:p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h1 className="text-xl sm:text-2xl font-black text-deep tracking-tight">
                                            Intro Mailer
                                        </h1>
                                        <p className="text-sm text-deep/50 font-medium">
                                            {INTRO_PLAN.description}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-2xl font-black text-deep">
                                            ${INTRO_PRICE.toFixed(2)}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-deep/40">
                                            / month
                                        </p>
                                    </div>
                                </div>

                                <ul className="mt-5 space-y-2.5">
                                    {INTRO_PLAN.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm text-deep/70">
                                            <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                                            <span className="font-medium">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-deep/40">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/5 border border-success/10 rounded-full text-success/70">
                                        <ShieldCheck size={12} /> 7-Day Free Trial
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-deep/5 border border-deep/10 rounded-full text-deep/50">
                                        Free US Shipping
                                    </span>
                                </div>
                            </div>

                            {/* ── Order bump: Printable Phonics Pack ── */}
                            <button
                                type="button"
                                onClick={togglePhonicsPack}
                                aria-pressed={formData.addPhonicsPack}
                                className={`w-full text-left rounded-3xl border-2 transition-all overflow-hidden ${
                                    formData.addPhonicsPack
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-dashed border-zinc-200 bg-white hover:border-primary/40 hover:bg-primary/[0.02]'
                                }`}
                            >
                                <div className="p-5 sm:p-6 flex items-start gap-4">
                                    <div
                                        className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                            formData.addPhonicsPack
                                                ? 'bg-primary border-primary'
                                                : 'border-zinc-300 bg-white'
                                        }`}
                                    >
                                        {formData.addPhonicsPack && (
                                            <CheckCircle2 size={14} className="text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    <Sparkles size={10} /> Add-On
                                                </span>
                                                <h3 className="text-sm sm:text-base font-black text-deep">
                                                    {PHONICS_PACK_NAME}
                                                </h3>
                                            </div>
                                            <p className="text-lg font-black text-primary shrink-0">
                                                ${PHONICS_PACK_PRICE.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="mt-1.5 text-xs sm:text-sm text-deep/60 font-medium leading-relaxed">
                                            Add extra age-based sound, reading, and literacy activities
                                            you can use right away at home.
                                        </p>
                                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-deep/30">
                                            One-time payment · Instant download
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* ── Billing details ── */}
                            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5 sm:p-7 space-y-5">
                                <h2 className="text-sm font-black uppercase tracking-widest text-deep/50">
                                    Billing Details
                                </h2>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-deep/40">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail
                                            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                                emailError && emailTouched ? 'text-red-400' : 'text-deep/20'
                                            }`}
                                            size={18}
                                        />
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onBlur={handleEmailBlur}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value });
                                                if (emailTouched) setEmailError(validateEmail(e.target.value));
                                            }}
                                            className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl font-bold text-deep text-sm focus:outline-none transition-all ${
                                                emailError && emailTouched
                                                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                    : 'border-zinc-100 focus:border-primary/30'
                                            }`}
                                        />
                                    </div>
                                    {emailError && emailTouched && (
                                        <div className="flex items-center gap-2 pt-0.5">
                                            <AlertCircle size={12} className="text-red-500 shrink-0" />
                                            <p className="text-xs font-bold text-red-500">{emailError}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Name row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-deep/40">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-deep/20" size={18} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="First name"
                                                value={formData.firstName}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, firstName: e.target.value })
                                                }
                                                className="w-full pl-11 pr-3 py-3.5 bg-white border border-zinc-100 rounded-xl font-bold text-deep text-sm focus:outline-none focus:border-primary/30 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-deep/40">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Last name"
                                            value={formData.lastName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, lastName: e.target.value })
                                            }
                                            className="w-full px-4 py-3.5 bg-white border border-zinc-100 rounded-xl font-bold text-deep text-sm focus:outline-none focus:border-primary/30 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-deep/40">
                                        Country
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-deep/20 pointer-events-none" size={18} />
                                        <select
                                            value={formData.country}
                                            onChange={(e) =>
                                                setFormData({ ...formData, country: e.target.value })
                                            }
                                            className="w-full pl-11 pr-8 py-3.5 bg-white border border-zinc-100 rounded-xl font-bold text-deep text-sm focus:outline-none focus:border-primary/30 transition-all appearance-none cursor-pointer"
                                        >
                                            {COUNTRIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── RIGHT: Order summary + PayPal ── */}
                        <section className="lg:sticky lg:top-6 lg:self-start space-y-5">
                            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5 sm:p-7 space-y-5">
                                <h2 className="text-sm font-black uppercase tracking-widest text-deep/50">
                                    Order Summary
                                </h2>

                                <div className="space-y-3">
                                    {/* Main plan line */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black text-deep">Intro Mailer</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-deep/40">
                                                Monthly subscription
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-deep text-right">
                                            ${INTRO_PRICE.toFixed(2)}
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-deep/40">
                                                / month
                                            </span>
                                        </p>
                                    </div>

                                    {/* Bump line */}
                                    {formData.addPhonicsPack && (
                                        <div className="flex items-start justify-between gap-3 pt-2 border-t border-zinc-100">
                                            <div>
                                                <p className="text-sm font-black text-primary">
                                                    {PHONICS_PACK_NAME}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-deep/40">
                                                    One-time
                                                </p>
                                            </div>
                                            <p className="text-sm font-black text-primary">
                                                +${PHONICS_PACK_PRICE.toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="pt-3 border-t border-zinc-100 space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold text-deep/50">
                                        <span>Due today</span>
                                        <span>${dueToday.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-success">
                                        <span>7-day free trial</span>
                                        <span>−${INTRO_PRICE.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-1.5">
                                        <span className="text-sm font-black text-deep">Today</span>
                                        <span className="text-xl font-black text-success">
                                            ${dueToday.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-deep/40 font-medium pt-1">
                                        Then ${INTRO_PRICE.toFixed(2)}/month after your 7-day free trial.
                                        Cancel anytime.
                                    </p>
                                </div>

                                {/* ── PayPal button ── */}
                                <div className="pt-2 space-y-3">
                                    {needsSignup ? (
                                        <button
                                            type="button"
                                            onClick={() => router.push(buildSignupHref())}
                                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                        >
                                            Create Account to Continue
                                            <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <div className="relative min-h-[120px]">
                                            {!paypalReady && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                            <PayPalButtons
                                                style={{
                                                    layout: 'vertical',
                                                    shape: 'rect',
                                                    borderRadius: 12,
                                                    height: 48,
                                                    color: 'gold',
                                                    label: 'paypal',
                                                }}
                                                disabled={!formReady || isProcessing}
                                                onInit={() => setPaypalReady(true)}
                                                createSubscription={(_data, actions) => {
                                                    const targetPlanId =
                                                        process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER ||
                                                        INTRO_PLAN.paypalPlanId;

                                                    if (!targetPlanId) {
                                                        toast.error(
                                                            'Payment plan is not configured. Please contact support.'
                                                        );
                                                        throw new Error('Missing PayPal Plan ID');
                                                    }

                                                    // 7-day free trial; phonics pack collected as a one-time
                                                    // setup_fee today (matches the existing checkout pattern).
                                                    const trialEndDate = new Date(
                                                        Date.now() + 7 * 24 * 60 * 60 * 1000
                                                    );
                                                    const setupFee = formData.addPhonicsPack
                                                        ? PHONICS_PACK_PRICE
                                                        : 0;

                                                    return (actions.subscription.create as any)({
                                                        plan_id: targetPlanId,
                                                        start_time: trialEndDate.toISOString(),
                                                        ...(setupFee > 0
                                                            ? ({
                                                                  plan: {
                                                                      payment_preferences: {
                                                                          setup_fee: {
                                                                              value: setupFee.toFixed(2),
                                                                              currency_code: 'USD',
                                                                          },
                                                                      },
                                                                  },
                                                              } as any)
                                                            : {}),
                                                    });
                                                }}
                                                onApprove={async (data, _actions) => {
                                                    setIsProcessing(true);
                                                    try {
                                                        // The phonics pack is collected via the subscription's
                                                        // setup_fee, so PayPal captures it automatically during
                                                        // subscription activation — no separate capture needed.

                                                        const { data: sessionData } =
                                                            await supabase.auth.getSession();
                                                        const token =
                                                            sessionData?.session?.access_token;

                                                        const res = await fetch(
                                                            '/api/payments/paypal/confirm',
                                                            {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    ...(token
                                                                        ? {
                                                                              Authorization: `Bearer ${token}`,
                                                                          }
                                                                        : {}),
                                                                },
                                                                body: JSON.stringify({
                                                                    subscriptionId:
                                                                        data.subscriptionID,
                                                                    orderId: data.orderID,
                                                                    tier: 'plan_mail_intro',
                                                                    email: formData.email,
                                                                    firstName: formData.firstName,
                                                                    lastName: formData.lastName,
                                                                    country: formData.country,
                                                                    billingCycle: 'month',
                                                                    currency: 'USD',
                                                                    hasPhonicsPack:
                                                                        formData.addPhonicsPack,
                                                                    // Mirror the existing field the server
                                                                    // already knows so fulfillment runs.
                                                                    hasUpsell: formData.addPhonicsPack,
                                                                    source: 'offer_checkout',
                                                                }),
                                                            }
                                                        );

                                                        if (res.ok) {
                                                            // Funnel: send to one-click upsell page.
                                                            const params = new URLSearchParams({
                                                                sub: data.subscriptionID || '',
                                                                email: formData.email,
                                                                bump: formData.addPhonicsPack
                                                                    ? '1'
                                                                    : '0',
                                                            });
                                                            router.push(
                                                                `/offer/upsell?${params.toString()}`
                                                            );
                                                        } else {
                                                            const err = await res
                                                                .json()
                                                                .catch(() => ({}));
                                                            console.error('Confirm error:', err);
                                                            toast.error(
                                                                'Payment received but account setup failed. Please contact support.'
                                                            );
                                                            setIsProcessing(false);
                                                        }
                                                    } catch (err) {
                                                        console.error('Confirm fetch failed:', err);
                                                        toast.error(
                                                            'Payment received but account setup failed. Please contact support.'
                                                        );
                                                        setIsProcessing(false);
                                                    }
                                                }}
                                                onError={(err) => {
                                                    console.error('PayPal Error:', err);
                                                    toast.error(
                                                        'Payment could not be initialized. Please try again or contact support.'
                                                    );
                                                    setIsProcessing(false);
                                                }}
                                            />
                                        </div>
                                    )}

                                    <p className="text-[10px] text-deep/40 font-medium leading-relaxed text-center">
                                        🔒 Your payment is secured by PayPal. Use your PayPal
                                        balance or pay directly with a Debit/Credit Card — we never
                                        see or store your card details.
                                    </p>
                                </div>

                                {/* 2026 CRO: inline objection handler. Cold traffic
                                    often abandons here because a subscription that
                                    bills after a trial still asks for payment up
                                    front. Answer it before they bounce. */}
                                <details className="group rounded-xl bg-deep/[0.02] border border-zinc-100 px-4 py-3">
                                    <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs font-bold text-deep/70 list-none">
                                        <span>Why am I paying before getting access?</span>
                                        <span className="text-deep/40 transition-transform group-open:rotate-45" aria-hidden>+</span>
                                    </summary>
                                    <p className="mt-2 text-[11px] font-medium leading-relaxed text-deep/60">
                                        You&apos;re not. Your 7-day free trial means <span className="font-bold text-success">nothing is charged today</span> — PayPal just confirms your payment method so access stays uninterrupted after the trial. If you cancel within 7 days, you&apos;re never charged. If you love it, the first monthly charge happens only after your child has had a full week to try the stories, activities, and portal.
                                    </p>
                                </details>

                                {/* Trust badges */}
                                <div className="pt-3 border-t border-zinc-100 grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <Lock size={16} className="text-success" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-deep/40">
                                            SSL Secure
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <ShieldCheck size={16} className="text-success" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-deep/40">
                                            PayPal Protected
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <Globe size={16} className="text-primary/60" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-deep/40">
                                            Cancel Anytime
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Guarantee line */}
                            <div className="text-center text-[10px] font-bold uppercase tracking-widest text-deep/30">
                                7-day money-back guarantee · No questions asked
                            </div>
                        </section>
                    </div>
                </div>

                {/* ── Minimal footer ── */}
                <footer className="border-t border-zinc-100 bg-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-deep/30">
                        <span>© {new Date().getFullYear()} Likkle Legends</span>
                        <Link href="/privacy" className="hover:text-deep/60 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-deep/60 transition-colors">
                            Terms
                        </Link>
                        <Link href="/contact" className="hover:text-deep/60 transition-colors">
                            Support
                        </Link>
                    </div>
                </footer>
            </main>
        </PayPalScriptProvider>
    );
}

export default function OfferCheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
