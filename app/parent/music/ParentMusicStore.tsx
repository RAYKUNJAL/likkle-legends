'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import MusicPayPalButton from '@/components/parent/MusicPayPalButton';
import { useParentSession } from '@/components/parent/useParentSession';
import { formatUsd } from '@/lib/paypal-offers';
import { musicStorePhase } from '@/lib/login-bounce';
import {
    MUSIC_DOWNLOAD_BUNDLE_PRICE,
    MUSIC_DOWNLOAD_BUNDLE_SKU,
    MUSIC_DOWNLOAD_PRICE,
    MUSIC_DOWNLOAD_SKU,
} from '@/lib/music-store';
import { getPlayableCatalogSongs, musicCatalogScoreboard, playbackUrl } from '@/lib/song-catalog';
import LikkleRadioPlayer from '@/components/radio/LikkleRadioPlayer';
import { LIKKLE_AUDIO_EVENT, announceLikkleAudio } from '@/lib/likkle-radio';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || '';

type LibraryTrack = {
    id: string;
    title: string;
    artist: string;
    streamUrl: string;
    owned: boolean;
};

const catalogTracks: LibraryTrack[] = getPlayableCatalogSongs().map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    streamUrl: playbackUrl(song),
    owned: false,
}));

const streamById = new Map(catalogTracks.map((track) => [track.id, track.streamUrl]));

export default function ParentMusicStore() {
    const { token, signedIn, ready } = useParentSession();
    const [tracks, setTracks] = useState<LibraryTrack[]>(catalogTracks);
    const [credits, setCredits] = useState(0);
    const [playing, setPlaying] = useState<string | null>(null);
    const [played, setPlayed] = useState<Record<string, boolean>>({});
    const [receipts, setReceipts] = useState<Array<{ id: string; sku: string; amount: number; currency: string; label: string; paypalOrderId: string | null; createdAt: string | null }>>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [buying, setBuying] = useState<string | null>(null);
    const scoreboard = musicCatalogScoreboard();
    const phase = musicStorePhase({ ready, signedIn });
    const paypalOptions = useMemo(() => ({
        clientId: PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture' as const,
        components: 'buttons',
    }), []);

    const load = async (accessToken: string | null) => {
        const headers: Record<string, string> = {};
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const response = await fetch('/api/music/library', {
            credentials: 'same-origin',
            headers,
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(body.tracks)) return;
        setTracks(body.tracks.map((track: LibraryTrack) => ({
            ...track,
            streamUrl: streamById.get(track.id) || track.streamUrl,
            owned: track.owned === true,
        })));
        setCredits(Number(body.creditsRemaining || 0));
        if (Array.isArray(body.receipts)) setReceipts(body.receipts);
    };

    useEffect(() => {
        if (!ready || !signedIn) return;
        void load(token);
    }, [ready, signedIn, token]);

    useEffect(() => {
        const onOther = (event: Event) => {
            const source = (event as CustomEvent<{ source?: string }>).detail?.source;
            if (source === 'parent-music-store') return;
            const audio = document.getElementById('parent-music-player') as HTMLAudioElement | null;
            audio?.pause();
            setPlaying(null);
        };
        window.addEventListener(LIKKLE_AUDIO_EVENT, onOther);
        return () => window.removeEventListener(LIKKLE_AUDIO_EVENT, onOther);
    }, []);

    const play = (track: LibraryTrack) => {
        const audio = document.getElementById('parent-music-player') as HTMLAudioElement | null;
        if (!audio) return;
        if (playing === track.id) {
            audio.pause();
            setPlaying(null);
            return;
        }
        announceLikkleAudio('parent-music-store');
        if (audio.getAttribute('data-track') !== track.id) {
            audio.src = track.streamUrl;
            audio.setAttribute('data-track', track.id);
        }
        audio.play().then(() => {
            setPlaying(track.id);
            setPlayed((prev) => ({ ...prev, [track.id]: true }));
        }).catch(() => setPlaying(null));
    };

    const redeem = async (trackId: string) => {
        if (!signedIn) return;
        setMessage(null);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch('/api/music/redeem', {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ trackId }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.entitled !== true) {
            setMessage(typeof body.error === 'string' ? body.error : 'That license was not applied.');
            return;
        }
        setMessage('Download license added to this parent account.');
        await load(token);
    };

    const store = (
        <div className="min-h-screen bg-[#F8FAFC] px-4 py-16">
            <div className="mx-auto max-w-3xl">
                <Link href="/parent" className="text-sm font-bold text-slate-500">Parent dashboard</Link>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-primary">Music Store</p>
                <h1 className="mt-2 text-4xl font-black text-slate-900">Hear the songs</h1>
                <p className="mt-3 text-slate-600">
                    {scoreboard.playable} kids Caribbean song{scoreboard.playable === 1 ? '' : 's'} can be played today. The library is growing. {scoreboard.inventoryMissing} older titles stay off this page because the audio file is not in this project. Listening is free.
                </p>
                <Link href="/parent/music/custom" className="mt-4 inline-flex text-sm font-bold text-slate-600 underline">Birthday / event song for your likkle one</Link>

                <div className="mt-8">
                    <LikkleRadioPlayer onTrackStarted={(trackId) => setPlayed((prev) => ({ ...prev, [trackId]: true }))} />
                </div>

                <audio id="parent-music-player" preload="metadata" className="hidden" onEnded={() => setPlaying(null)} />

                {phase === 'checking' && <p className="mt-8 text-sm font-bold text-slate-500">Checking parent session…</p>}
                {phase === 'signed-out' && (
                    <p className="mt-6 text-sm text-slate-600">
                        <a href="/login?redirect=/parent/music" className="font-bold underline">Parent sign in</a>
                        {' '}to keep a download or request a custom song. Playback does not need an account.
                    </p>
                )}

                <div className="mt-8 space-y-4">
                    {tracks.map((track) => (
                        <article key={track.id} className="rounded-3xl bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">{track.title}</h2>
                                    <p className="text-sm text-slate-500">{track.artist}</p>
                                </div>
                                <button type="button" onClick={() => play(track)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white">
                                    {playing === track.id ? 'Pause' : 'Play'}
                                </button>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                {track.owned ? (
                                    <>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-700">Owned</span>
                                        <a href={`/api/music/download/${track.id}`} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white">Download</a>
                                    </>
                                ) : played[track.id] ? (
                                    signedIn ? (
                                        <>
                                            <button type="button" onClick={() => setBuying(buying === track.id ? null : track.id)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-900">
                                                Download for ${formatUsd(MUSIC_DOWNLOAD_PRICE)}
                                            </button>
                                            {credits > 0 && (
                                                <button type="button" onClick={() => redeem(track.id)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-900">
                                                    Use 1 license ({credits} left)
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <a href="/login?redirect=/parent/music" className="text-sm font-bold text-slate-600 underline">
                                            Download for ${formatUsd(MUSIC_DOWNLOAD_PRICE)} after parent sign in
                                        </a>
                                    )
                                ) : null}
                            </div>
                            {buying === track.id && !track.owned && signedIn && PAYPAL_CLIENT_ID && (
                                <div className="mt-4" data-testid="paypal-download">
                                    <MusicPayPalButton
                                        sku={MUSIC_DOWNLOAD_SKU}
                                        token={token}
                                        trackId={track.id}
                                        onVerified={() => {
                                            setBuying(null);
                                            setMessage(`${track.title} download is on this parent account.`);
                                            load(token);
                                        }}
                                    />
                                </div>
                            )}
                            {buying === track.id && !PAYPAL_CLIENT_ID && (
                                <p className="mt-3 text-sm font-bold text-red-700">PayPal checkout is unavailable. Nothing can be purchased until it is configured.</p>
                            )}
                        </article>
                    ))}
                </div>

                {signedIn && (
                    <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900">A few download licenses</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Optional. Five download licenses for ${formatUsd(MUSIC_DOWNLOAD_BUNDLE_PRICE)}, only for songs in this library. Unused licenses stay on the parent account. You have {credits} left.
                        </p>
                        {PAYPAL_CLIENT_ID ? (
                            <div className="mt-4" data-testid="paypal-bundle">
                                <MusicPayPalButton
                                    sku={MUSIC_DOWNLOAD_BUNDLE_SKU}
                                    token={token}
                                    onVerified={() => {
                                        setMessage('Five download licenses were added after PayPal verified the payment.');
                                        load(token);
                                    }}
                                />
                            </div>
                        ) : (
                            <p className="mt-3 text-sm font-bold text-red-700">PayPal checkout is unavailable.</p>
                        )}
                    </section>
                )}

                {receipts.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-xl font-black text-slate-900">Receipts</h2>
                        <ul className="mt-3 space-y-3">
                            {receipts.map((receipt) => (
                                <li key={receipt.id} className="rounded-3xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                                    <p className="font-black text-slate-900">{receipt.label}</p>
                                    <p className="mt-1">{receipt.sku} · ${formatUsd(receipt.amount)} {receipt.currency}</p>
                                    <p className="mt-1">{receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : ''}</p>
                                    {receipt.paypalOrderId && <p className="mt-1 break-all text-xs text-slate-400">PayPal {receipt.paypalOrderId}</p>}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {message && <p className="mt-6 text-sm font-bold text-slate-800" role="status">{message}</p>}
            </div>
        </div>
    );

    if (!signedIn || !PAYPAL_CLIENT_ID) return store;
    return (
        <PayPalScriptProvider options={paypalOptions}>
            {store}
        </PayPalScriptProvider>
    );
}
