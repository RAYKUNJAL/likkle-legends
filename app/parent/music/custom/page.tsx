'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import MusicPayPalButton from '@/components/parent/MusicPayPalButton';
import { useParentSession } from '@/components/parent/useParentSession';
import { formatUsd } from '@/lib/paypal-offers';
import { CUSTOM_SONG_PRICE, CUSTOM_SONG_SKU, CUSTOM_SONG_STYLE } from '@/lib/music-store';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || '';

type SongRequest = {
    id: string;
    childFirstName: string | null;
    occasion: string | null;
    notes: string | null;
    status: string;
    label?: string;
    audioUrl: string | null;
    createdAt: string | null;
};

export default function ParentCustomSongPage() {
    const { token, signedIn, ready } = useParentSession();
    const [requests, setRequests] = useState<SongRequest[]>([]);
    const [childFirstName, setChildFirstName] = useState('');
    const [occasion, setOccasion] = useState('birthday');
    const [notes, setNotes] = useState('');
    const [draftId, setDraftId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [verified, setVerified] = useState(false);

    const load = async (accessToken: string | null) => {
        const headers: Record<string, string> = {};
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const response = await fetch('/api/music/custom-song', {
            credentials: 'same-origin',
            headers,
        });
        const body = await response.json().catch(() => ({}));
        if (response.ok && Array.isArray(body.requests)) setRequests(body.requests);
    };

    useEffect(() => {
        if (!ready || !signedIn) return;
        void load(token);
    }, [ready, signedIn, token]);

    const saveDraft = async (event: FormEvent) => {
        event.preventDefault();
        if (!signedIn) return;
        setVerified(false);
        setMessage(null);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch('/api/music/custom-song', {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ childFirstName, occasion, notes }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || typeof body.requestId !== 'string') {
            setDraftId(null);
            setMessage(typeof body.error === 'string' ? body.error : 'The request was not saved.');
            return;
        }
        setDraftId(body.requestId);
        setMessage('Request saved. It stays unpaid until PayPal verifies the catalog price.');
        await load(token);
    };

    const page = (
        <div className="min-h-screen bg-[#F8FAFC] px-4 py-16">
            <div className="mx-auto max-w-3xl">
                <Link href="/parent/music" className="text-sm font-bold text-slate-500">Music Store</Link>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-primary">Custom song</p>
                <h1 className="mt-2 text-4xl font-black text-slate-900">A Caribbean kids song, made to order</h1>
                <p className="mt-3 text-slate-600">
                    Style is {CUSTOM_SONG_STYLE}. The catalog price is ${formatUsd(CUSTOM_SONG_PRICE)}. Paying marks the request paid. The audio is delivered by the team later — this page does not generate a song.
                </p>

                {!ready && <p className="mt-8 text-sm font-bold text-slate-500">Checking parent session…</p>}
                {ready && !signedIn && (
                    <a href="/login?redirect=/parent/music/custom" className="mt-8 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
                        Parent sign in
                    </a>
                )}

                {signedIn && (
                    <form onSubmit={saveDraft} className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-sm">
                        <label className="block text-sm font-bold text-slate-700">
                            Child first name
                            <input value={childFirstName} onChange={(event) => setChildFirstName(event.target.value)} required className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3" />
                        </label>
                        <label className="block text-sm font-bold text-slate-700">
                            Occasion
                            <select value={occasion} onChange={(event) => setOccasion(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3">
                                <option value="birthday">Birthday</option>
                                <option value="event">Event</option>
                                <option value="other">Other</option>
                            </select>
                        </label>
                        <label className="block text-sm font-bold text-slate-700">
                            Notes
                            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" />
                        </label>
                        <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">Save request</button>
                        {draftId && PAYPAL_CLIENT_ID && (
                            <div className="pt-2">
                                <MusicPayPalButton
                                    sku={CUSTOM_SONG_SKU}
                                    token={token}
                                    requestId={draftId}
                                    onVerified={() => {
                                        setVerified(true);
                                        setMessage('PayPal verified the payment. The request is queued for the team.');
                                        load(token);
                                    }}
                                />
                            </div>
                        )}
                        {draftId && !PAYPAL_CLIENT_ID && (
                            <p className="text-sm font-bold text-red-700">PayPal checkout is unavailable. The request was not paid.</p>
                        )}
                    </form>
                )}

                {message && (
                    <p className={`mt-6 text-sm font-bold ${verified ? 'text-emerald-700' : 'text-slate-800'}`} role="status">{message}</p>
                )}

                <section className="mt-10">
                    <h2 className="text-2xl font-black text-slate-900">Your requests</h2>
                    {requests.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">No custom song requests yet.</p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {requests.map((item) => (
                                <li key={item.id} className="rounded-3xl bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-black text-slate-900">{item.childFirstName || 'Child'}</p>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.label || item.status}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500 capitalize">{item.occasion} · {CUSTOM_SONG_STYLE}</p>
                                    {item.notes && <p className="mt-2 text-sm text-slate-600">{item.notes}</p>}
                                    {item.status === 'delivered' && item.audioUrl && (
                                        <a href={item.audioUrl} className="mt-3 inline-flex text-sm font-black text-primary">Listen to the delivered file</a>
                                    )}
                                    {['queued', 'paid', 'in_progress'].includes(item.status) && !item.audioUrl && (
                                        <p className="mt-3 text-sm text-slate-500">No audio file yet. Delivery is manual.</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );

    const paypalOptions = useMemo(() => ({
        clientId: PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture' as const,
        components: 'buttons',
    }), []);

    if (!signedIn || !PAYPAL_CLIENT_ID) return page;
    return (
        <PayPalScriptProvider options={paypalOptions}>
            {page}
        </PayPalScriptProvider>
    );
}
