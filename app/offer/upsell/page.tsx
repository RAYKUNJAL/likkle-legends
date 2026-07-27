'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Lock, ShieldCheck, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SUBSCRIPTION_PLANS } from '@/lib/paypal';
import { supabase } from '@/lib/supabase-client';
import { fireConversionEvent } from '@/lib/analytics';
import MetaPixel from '@/components/offer/MetaPixel';
import GA4Pixel from '@/components/offer/GA4Pixel';
import TikTokPixel from '@/components/offer/TikTokPixel';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

// Legends Plus = plan_legends_plus (PayPal plan id from NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS).
const LEGENDS_PLAN = SUBSCRIPTION_PLANS.plan_legends_plus;
const LEGENDS_PRICE = LEGENDS_PLAN.price; // 19.99 / month

const LEGENDS_INCLUDED = [
    { emoji: '📖', text: 'Unlimited Caribbean stories in the portal' },
    { emoji: '🌟', text: 'All five Legends characters unlocked' },
    { emoji: '🎨', text: 'Premium activities & printable packs' },
    { emoji: '⚡', text: 'Priority access to new content & features' },
];

function UpsellContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams.get('email') || '';
    const introSub = searchParams.get('sub') || '';

    const [isProcessing, setIsProcessing] = useState(false);
    const [paypalReady, setPaypalReady] = useState(false);

    // Fire view_item for the upsell offer on mount.
    const [firedView] = useState(() => {
        if (typeof window !== 'undefined') {
            fireConversionEvent('view_item', {
                tier: 'plan_legends_plus',
                source: 'offer_upsell',
            });
        }
        return true;
    });
    void firedView;

    const buildThankYouHref = (params: Record<string, string> = {}) => {
        const p = new URLSearchParams();
        p.set('upsell', '1');
        if (email) p.set('email', email);
        if (introSub) p.set('sub', introSub);
        Object.entries(params).forEach(([k, v]) => p.set(k, v));
        return `/offer/thank-you?${p.toString()}`;
    };

    return (
        <PayPalScriptProvider
            key="offer-upsell-paypal-subscription"
            options={{
                clientId: PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'subscription',
                vault: true,
            }}
        >
            <main className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-white font-montserrat">
                {/* ── Tracking pixels — fire ViewContent on upsell page ── */}
                <MetaPixel event="ViewContent" params={{ content_name: 'plan_legends_plus', value: LEGENDS_PRICE, currency: 'USD' }} />
                <GA4Pixel event="view_item" params={{ currency: 'USD', value: LEGENDS_PRICE, items: [{ item_id: 'plan_legends_plus', item_name: 'Legends Plus', price: LEGENDS_PRICE, quantity: 1 }] }} />
                <TikTokPixel event="ViewContent" params={{ content_name: 'plan_legends_plus', value: LEGENDS_PRICE, currency: 'USD' }} />

                {/* Minimal header: logo + "One-time offer" */}
                <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl" aria-hidden="true">🌴</span>
                            <span className="font-fredoka text-lg font-bold text-slate-900 sm:text-xl">
                                Likkle Legends
                            </span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[var(--caribbean-spice)]" />
                            <span className="font-montserrat text-xs font-bold uppercase tracking-widest text-[var(--caribbean-spice)]">
                                One-time offer
                            </span>
                        </div>
                    </div>
                </header>

                {/* Upsell card */}
                <section className="px-4 py-8 sm:px-6 sm:py-12">
                    <div className="mx-auto max-w-xl">
                        {/* Urgency banner */}
                        <div className="mb-5 rounded-2xl border border-[var(--caribbean-spice)]/20 bg-[var(--caribbean-spice)]/5 px-4 py-3 text-center">
                            <p className="font-montserrat text-xs font-bold text-[var(--caribbean-spice)] sm:text-sm">
                                ⏳ This offer is only available right now — it won&apos;t be shown again after you leave this page.
                            </p>
                        </div>

                        <div className="rounded-3xl border-2 border-amber-300 bg-white p-6 shadow-2xl sm:p-9">
                            <div className="text-center">
                                <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[var(--caribbean-mango)] sm:text-xs">
                                    <Sparkles size={12} /> Upgrade Offer
                                </p>
                                <h1 className="font-fredoka text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                                    Keep the learning going with Legends Plus
                                </h1>
                                <p className="mx-auto mt-4 max-w-md font-quicksand text-base leading-relaxed text-slate-600 sm:text-lg">
                                    Upgrade for expanded portal access, more activities, and additional story-based learning your child can keep exploring.
                                </p>
                            </div>

                            {/* What's included */}
                            <ul className="mt-7 space-y-3">
                                {LEGENDS_INCLUDED.map((item) => (
                                    <li key={item.text} className="flex items-start gap-3">
                                        <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                                        <span className="font-quicksand text-sm font-semibold text-slate-700 sm:text-base">
                                            {item.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Price */}
                            <div className="mt-7 rounded-2xl bg-gradient-to-br from-sky-100 via-amber-50 to-white p-5 text-center">
                                <p className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[var(--caribbean-ocean)]">
                                    One-click upgrade from your Intro Mailer
                                </p>
                                <div className="mt-1 flex items-baseline justify-center gap-1">
                                    <span className="font-fredoka text-4xl font-bold text-slate-900 sm:text-5xl">
                                        ${LEGENDS_PRICE.toFixed(2)}
                                    </span>
                                    <span className="font-montserrat text-sm font-bold text-slate-500">
                                        /month
                                    </span>
                                </div>
                                <p className="mt-1 font-quicksand text-xs text-slate-500">
                                    Billed monthly · Cancel anytime · Instant access
                                </p>
                            </div>

                            {/* Primary CTA: PayPal one-click upgrade */}
                            <div className="mt-6 space-y-3">
                                <div className="relative min-h-[52px]">
                                    {!paypalReady && !isProcessing && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--caribbean-mango)] border-t-transparent" />
                                        </div>
                                    )}
                                    <PayPalButtons
                                        style={{
                                            layout: 'vertical',
                                            shape: 'rect',
                                            borderRadius: 12,
                                            height: 52,
                                            color: 'gold',
                                            label: 'paypal',
                                        }}
                                        disabled={isProcessing}
                                        onInit={() => setPaypalReady(true)}
                                        createSubscription={(_data, actions) => {
                                            const targetPlanId =
                                                process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS ||
                                                LEGENDS_PLAN.paypalPlanId;

                                            if (!targetPlanId) {
                                                toast.error(
                                                    'Upgrade plan is not configured. Please contact support.'
                                                );
                                                throw new Error('Missing PayPal Plan ID (Legends)');
                                            }

                                            return (actions.subscription.create as any)({
                                                plan_id: targetPlanId,
                                            });
                                        }}
                                        onApprove={async (data, _actions) => {
                                            setIsProcessing(true);
                                            try {
                                                const { data: sessionData } =
                                                    await supabase.auth.getSession();
                                                const token =
                                                    sessionData?.session?.access_token;

                                                // Best-effort: record the upgrade. If this
                                                // fails the user still has the Intro Mailer —
                                                // route them to thank-you either way.
                                                await fetch('/api/payments/paypal/confirm', {
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
                                                        tier: 'plan_legends_plus',
                                                        email,
                                                        billingCycle: 'month',
                                                        currency: 'USD',
                                                        source: 'offer_upsell',
                                                        introSubscriptionId: introSub,
                                                    }),
                                                }).catch((err) =>
                                                    console.error('Upsell confirm failed:', err)
                                                );

                                                fireConversionEvent('purchase', {
                                                    tier: 'plan_legends_plus',
                                                    source: 'offer_upsell',
                                                    value: LEGENDS_PRICE,
                                                    currency: 'USD',
                                                });

                                                router.push(
                                                    buildThankYouHref({
                                                        upgraded: '1',
                                                        usub: data.subscriptionID || '',
                                                    })
                                                );
                                            } catch (err) {
                                                console.error('Upsell onApprove error:', err);
                                                // Don't block the funnel — Intro already succeeded.
                                                router.push(buildThankYouHref({ upgraded: '0' }));
                                            }
                                        }}
                                        onError={(err) => {
                                            console.error('PayPal upsell error:', err);
                                            toast.error(
                                                'Upgrade could not be started. You can continue to your order.'
                                            );
                                            setIsProcessing(false);
                                        }}
                                    />
                                </div>

                                <p className="text-center font-montserrat text-sm font-bold text-slate-700">
                                    👆 Tap above to <span className="text-[var(--caribbean-mango)]">Upgrade to Legends Plus</span>
                                </p>

                                {/* Decline link */}
                                <div className="pt-2 text-center">
                                    <Link
                                        href={buildThankYouHref({ upgraded: '0' })}
                                        className="font-montserrat text-sm font-semibold text-slate-500 underline-offset-4 hover:text-[var(--caribbean-ocean)] hover:underline"
                                    >
                                        No thanks, continue to my order
                                    </Link>
                                </div>
                            </div>

                            {/* Trust row */}
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-amber-100 pt-4 text-center">
                                <span className="inline-flex items-center gap-1.5 font-montserrat text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <Lock size={12} className="text-[var(--caribbean-palm)]" /> SSL Secure
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-montserrat text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <ShieldCheck size={12} className="text-[var(--caribbean-palm)]" /> PayPal Protected
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-montserrat text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <CheckCircle2 size={12} className="text-[var(--caribbean-palm)]" /> Cancel anytime
                                </span>
                            </div>
                        </div>

                        <p className="mt-5 text-center font-quicksand text-xs text-slate-500">
                            Your Intro Mailer is already on its way. This upgrade simply unlocks more of the portal for your child.
                        </p>
                    </div>
                </section>
            </main>
        </PayPalScriptProvider>
    );
}

export default function OfferUpsellPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-200 via-amber-50 to-white">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--caribbean-mango)] border-t-transparent" />
                </div>
            }
        >
            <UpsellContent />
        </Suspense>
    );
}
