'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { supabase } from '@/lib/supabase-client';
import { formatUsd, getParentOffer, listParentOffers, type ParentOffer } from '@/lib/paypal-offers';
import MusicStoreUpsell from '@/components/parent/MusicStoreUpsell';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || '';

async function readJson(response: Response): Promise<Record<string, unknown>> {
    return response.json().catch(() => ({}));
}

function OfferButtons({ offer, token }: { offer: ParentOffer; token: string | null }) {
    const [message, setMessage] = useState<string | null>(null);
    const [entitled, setEntitled] = useState(false);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const markUnverified = (text: string) => {
        setEntitled(false);
        setMessage(text);
    };

    const finish = async (response: Response) => {
        const body = await readJson(response);
        if (!response.ok || body.entitled !== true) {
            markUnverified(typeof body.error === 'string' ? body.error : 'Payment was not verified. Nothing was unlocked.');
            return;
        }
        setEntitled(true);
        setMessage(`${offer.name} is active on this parent account.`);
    };

    return (
        <div className="space-y-4">
            <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', label: offer.kind === 'subscription' ? 'subscribe' : 'pay' }}
                createOrder={offer.kind === 'one_time' ? async () => {
                    const response = await fetch('/api/payments/paypal/create-order', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ sku: offer.sku }),
                    });
                    const body = await readJson(response);
                    if (!response.ok || typeof body.id !== 'string') {
                        throw new Error(typeof body.error === 'string' ? body.error : 'Checkout is unavailable');
                    }
                    return body.id;
                } : undefined}
                createSubscription={offer.kind === 'subscription' ? async () => {
                    const response = await fetch('/api/payments/paypal/create-subscription', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ sku: offer.sku }),
                    });
                    const body = await readJson(response);
                    if (!response.ok || typeof body.id !== 'string') {
                        throw new Error(typeof body.error === 'string' ? body.error : 'This annual plan is not configured');
                    }
                    return body.id;
                } : undefined}
                onApprove={async (data) => {
                    if (offer.kind === 'one_time') {
                        const response = await fetch('/api/payments/paypal/capture-order', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({ orderID: data.orderID, sku: offer.sku }),
                        });
                        await finish(response);
                        return;
                    }

                    if (!data.subscriptionID) {
                        markUnverified('PayPal did not confirm a subscription. Nothing was unlocked.');
                        return;
                    }

                    const response = await fetch('/api/payments/paypal/confirm', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ subscriptionId: data.subscriptionID, sku: offer.sku }),
                    });
                    await finish(response);
                }}
                onCancel={() => markUnverified('Checkout was cancelled. Nothing was unlocked.')}
                onError={(error) => {
                    console.error('PayPal checkout error:', error);
                    markUnverified('PayPal could not complete checkout. Nothing was unlocked.');
                }}
            />
            {message && (
                <p className={`text-sm font-bold ${entitled ? 'text-emerald-700' : 'text-red-700'}`} role="status">
                    {message}
                </p>
            )}
        </div>
    );
}

export default function IslandOffersCheckout({ initialSku }: { initialSku?: string | null }) {
    const offers = listParentOffers();
    const starting = initialSku && getParentOffer(initialSku) ? initialSku : offers[0].sku;
    const [sku, setSku] = useState(starting);
    const [token, setToken] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const offer = getParentOffer(sku) || offers[0];

    useEffect(() => {
        supabase.auth.getSession()
            .then(({ data }) => setToken(data.session?.access_token || null))
            .catch(() => setToken(null))
            .finally(() => setReady(true));
    }, []);

    return (
        <div className="min-h-screen bg-[#FFFDF7] px-4 py-16">
            <div className="mx-auto max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Parent checkout</p>
                <h1 className="mt-3 text-4xl font-black text-slate-900">Island Packs and annual plans</h1>
                <p className="mt-3 text-slate-600">
                    A parent account pays here. Children cannot buy from the portal. Access turns on only after PayPal capture or an active subscription is verified. Refunds are explained in the{' '}
                    <Link href="/refund" className="font-bold text-slate-800 underline">Refund Policy</Link>.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {offers.map((item) => (
                        <button
                            key={item.sku}
                            type="button"
                            onClick={() => setSku(item.sku)}
                            className={`rounded-3xl border p-5 text-left ${item.sku === offer.sku ? 'border-primary bg-white shadow-lg' : 'border-slate-200 bg-white/70'}`}
                        >
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {item.kind === 'one_time' ? 'Island Pack' : 'Optional annual'}
                            </p>
                            <h2 className="mt-2 text-xl font-black text-slate-900">{item.name}</h2>
                            <p className="mt-2 text-2xl font-black text-slate-900">
                                ${formatUsd(item.price)}
                                <span className="ml-1 text-sm font-bold text-slate-400">{item.interval === 'year' ? '/year' : 'once'}</span>
                            </p>
                            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
                    <h2 className="text-2xl font-black text-slate-900">{offer.name}</h2>
                    <ul className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                        {offer.features.map((feature) => (
                            <li key={feature}>{feature}</li>
                        ))}
                    </ul>

                    {!PAYPAL_CLIENT_ID && (
                        <p className="mt-6 text-sm font-bold text-red-700">PayPal checkout is unavailable. Nothing can be purchased until it is configured.</p>
                    )}

                    {PAYPAL_CLIENT_ID && ready && !token && (
                        <div className="mt-6 space-y-3">
                            <p className="text-sm font-bold text-slate-700">Sign in with a parent account before paying.</p>
                            <Link href={`/login?redirect=${encodeURIComponent(`/checkout?offer=${offer.sku}`)}`} className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
                                Parent sign in
                            </Link>
                        </div>
                    )}

                    {PAYPAL_CLIENT_ID && ready && token && (
                        <div className="mt-6">
                            <PayPalScriptProvider
                                options={{
                                    clientId: PAYPAL_CLIENT_ID,
                                    currency: 'USD',
                                    intent: offer.kind === 'subscription' ? 'subscription' : 'capture',
                                    vault: offer.kind === 'subscription' ? 'true' : 'false',
                                    components: 'buttons',
                                }}
                                key={`${offer.sku}-${offer.kind}`}
                            >
                                <OfferButtons offer={offer} token={token} />
                            </PayPalScriptProvider>
                        </div>
                    )}

                    {PAYPAL_CLIENT_ID && !ready && <p className="mt-6 text-sm font-bold text-slate-500">Checking parent session…</p>}
                </div>

                <div className="mt-8">
                    <MusicStoreUpsell />
                </div>
            </div>
        </div>
    );
}
