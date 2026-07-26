'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Mic, MicOff, Volume2, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { CHARACTER_CONFIGS, CHARACTER_ORDER, CharacterId } from '@/lib/characterConfig';
import { TIER_LEVELS } from '@/lib/feature-access';

// ─── Types ────────────────────────────────────────────────────────────────
interface TranscriptEntry {
    id: number;
    role: 'user' | 'assistant';
    text: string;
    pending?: boolean;
}

// Minimal Web Speech API typings (browsers vary).
type SpeechRecognitionType = any;

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionType;
        webkitSpeechRecognition?: SpeechRecognitionType;
    }
}

// ─── Character picker ─────────────────────────────────────────────────────
const VOICE_CHARACTERS: CharacterId[] = ['tanty_spice', 'roti', 'dilly_doubles'];

export default function VoiceChat() {
    const { activeChild, user, isLoading } = useUser();
    const [selectedChar, setSelectedChar] = useState<CharacterId>('tanty_spice');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [listening, setListening] = useState(false);
    const [thinking, setThinking] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioReady, setAudioReady] = useState(false);

    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const entryIdRef = useRef(0);
    const shouldListenRef = useRef(false);

    // ─── Subscription gating ──────────────────────────────────────────────
    const hasActiveSubscription =
        user?.subscription_status === 'active' || user?.subscription_status === 'trialing';
    const isPaid = hasActiveSubscription && (TIER_LEVELS[user?.subscription_tier || 'free'] ?? 0) > 0;

    // ─── Get Supabase session token ───────────────────────────────────────
    const getAuthToken = useCallback(async (): Promise<string | null> => {
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = await supabase.auth.getSession();
            return data.session?.access_token || null;
        } catch {
            return null;
        }
    }, []);

    // ─── Setup SpeechRecognition ──────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setError('Your browser does not support voice input. Try Chrome on a phone or laptop.');
            return;
        }

        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalText = '';
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interim += transcript;
                }
            }
            if (interim) setInterimText(interim);
            if (finalText.trim()) {
                setInterimText('');
                sendToCharacter(finalText.trim());
            }
        };

        recognition.onerror = (event: any) => {
            console.error('SpeechRecognition error:', event.error);
            if (event.error === 'no-speech') {
                setError("I didn't hear you. Tap the mic and try again!");
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setError('Microphone access was blocked. Enable it in your browser settings.');
            } else if (event.error !== 'aborted') {
                setError(`Voice input error: ${event.error}`);
            }
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
            setInterimText('');
            // Auto-restart if still supposed to be listening (toggle mode).
            if (shouldListenRef.current) {
                try { recognition.start(); setListening(true); } catch { /* already started */ }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            shouldListenRef.current = false;
            try { recognition.stop(); } catch { /* noop */ }
        };
    }, []);

    // ─── Toggle mic ───────────────────────────────────────────────────────
    const toggleMic = useCallback(() => {
        if (!isPaid) return;
        const recognition = recognitionRef.current;
        if (!recognition) {
            setError('Voice input not available in this browser.');
            return;
        }
        if (listening) {
            shouldListenRef.current = false;
            try { recognition.stop(); } catch { /* noop */ }
            setListening(false);
        } else {
            setError(null);
            shouldListenRef.current = true;
            try {
                recognition.start();
                setListening(true);
            } catch (err) {
                // Already started or quick re-click.
            }
        }
    }, [listening, isPaid]);

    // ─── Send to character + play response ────────────────────────────────
    const sendToCharacter = useCallback(async (text: string) => {
        if (!activeChild?.id) {
            setError('No child profile selected.');
            return;
        }

        const userEntry: TranscriptEntry = {
            id: ++entryIdRef.current,
            role: 'user',
            text,
        };
        const assistantPendingId = ++entryIdRef.current;
        const assistantPending: TranscriptEntry = {
            id: assistantPendingId,
            role: 'assistant',
            text: '',
            pending: true,
        };
        setTranscript((prev) => [...prev, userEntry, assistantPending]);
        setThinking(true);
        setError(null);

        try {
            const token = await getAuthToken();
            if (!token) {
                setError('Not signed in. Please log in again.');
                setThinking(false);
                return;
            }

            const res = await fetch('/api/voice-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    characterId: selectedChar,
                    text,
                    childId: activeChild.id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) {
                    setError('Voice chat needs a paid plan. Ask a parent to upgrade!');
                } else {
                    setError(data.error || 'Something went wrong. Try again.');
                }
                // Replace pending entry with error placeholder.
                setTranscript((prev) =>
                    prev.map((e) =>
                        e.id === assistantPendingId
                            ? { ...e, pending: false, text: '...' }
                            : e
                    )
                );
                setThinking(false);
                return;
            }

            // Replace the pending assistant entry with the real text.
            setTranscript((prev) =>
                prev.map((e) =>
                    e.id === assistantPendingId
                        ? { ...e, pending: false, text: data.text }
                        : e
                )
            );

            // Play audio if present.
            if (data.audioBase64) {
                const byteString = atob(data.audioBase64);
                const bytes = new Uint8Array(byteString.length);
                for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
                const blob = new Blob([bytes], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setAudioReady(false);
            }
        } catch (err: any) {
            console.error('voice-chat fetch error:', err);
            setError('Network error. Check your connection.');
            setTranscript((prev) =>
                prev.map((e) =>
                    e.id === assistantPendingId
                        ? { ...e, pending: false, text: '...' }
                        : e
                )
            );
        } finally {
            setThinking(false);
        }
    }, [activeChild?.id, selectedChar, getAuthToken]);

    // ─── Auto-play audio when ready ───────────────────────────────────────
    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().then(() => setAudioReady(true)).catch(() => {
                // Autoplay can be blocked; show a play button fallback.
                setAudioReady(false);
            });
        }
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    // ─── Loading state ────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    // ─── Paid-gate ────────────────────────────────────────────────────────
    if (!isPaid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-emerald-100">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Voice Chat is a Premium Feature</h2>
                    <p className="text-slate-600 font-semibold mb-6">
                        Talk to your favourite island characters with your voice. Ask a parent to upgrade to a paid plan.
                    </p>
                    <a
                        href="/portal/settings"
                        className="inline-block px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition"
                    >
                        Upgrade Plan
                    </a>
                </div>
            </div>
        );
    }

    const charConfig = CHARACTER_CONFIGS[selectedChar];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex flex-col">
            {/* ── Header ────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-emerald-100 px-4 py-3">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <a href="/portal" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold">
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Back</span>
                    </a>
                    <h1 className="text-xl font-black text-slate-800">🎙️ Voice Chat</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* ── Character picker ──────────────────────────────────────── */}
            <div className="px-4 py-4 max-w-2xl mx-auto w-full">
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {VOICE_CHARACTERS.map((id) => {
                        const c = CHARACTER_CONFIGS[id];
                        const isActive = selectedChar === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setSelectedChar(id)}
                                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition ${
                                    isActive
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-200 bg-white hover:border-emerald-300'
                                }`}
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                    style={{ background: c.visual.gradient }}
                                >
                                    {c.visual.emoji}
                                </div>
                                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                                    {c.persona.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Transcript ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 pb-40 max-w-2xl mx-auto w-full">
                {transcript.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-3">{charConfig.visual.emoji}</div>
                        <p className="text-slate-600 font-bold text-lg mb-2">
                            Hi{activeChild ? `, ${activeChild.first_name}` : ''}! I&apos;m {charConfig.persona.name}.
                        </p>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                            {charConfig.persona.tagline}
                        </p>
                        <p className="text-emerald-600 font-bold mt-4">
                            Tap the mic below and let&apos;s chat!
                        </p>
                    </div>
                )}

                {transcript.map((entry) => (
                    <div
                        key={entry.id}
                        className={`flex mb-3 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {entry.role === 'assistant' && (
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0"
                                style={{ background: charConfig.visual.gradient }}
                            >
                                {charConfig.visual.emoji}
                            </div>
                        )}
                        <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm font-semibold ${
                                entry.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-br-sm'
                                    : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
                            }`}
                        >
                            {entry.pending ? (
                                <span className="flex items-center gap-1">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span className="text-slate-400">listening...</span>
                                </span>
                            ) : (
                                entry.text
                            )}
                        </div>
                    </div>
                ))}

                {/* Interim STT text */}
                {interimText && (
                    <div className="flex justify-end mb-3">
                        <div className="max-w-[75%] px-4 py-2 rounded-2xl text-sm font-semibold bg-emerald-100 text-emerald-800 italic rounded-br-sm">
                            {interimText}...
                        </div>
                    </div>
                )}
            </div>

            {/* ── Error banner ──────────────────────────────────────────── */}
            {error && (
                <div className="fixed bottom-32 left-0 right-0 px-4 max-w-2xl mx-auto z-20">
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold px-4 py-2 rounded-xl text-center">
                        {error}
                    </div>
                </div>
            )}

            {/* ── Audio element (hidden) ──────────────────────────────── */}
            <audio ref={audioRef} className="hidden" />

            {/* ── Mic button (fixed bottom) ────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-emerald-100 px-4 py-5 z-20">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
                    {/* Replay button */}
                    {audioUrl && !audioReady && (
                        <button
                            onClick={() => {
                                if (audioRef.current) {
                                    audioRef.current.play();
                                    setAudioReady(true);
                                }
                            }}
                            className="flex items-center gap-2 text-emerald-700 font-bold text-sm bg-emerald-50 px-4 py-1.5 rounded-full"
                        >
                            <Volume2 size={16} />
                            Play {charConfig.persona.name}&apos;s voice
                        </button>
                    )}

                    {/* Big mic button */}
                    <button
                        onClick={toggleMic}
                        disabled={thinking}
                        aria-label={listening ? 'Stop talking' : 'Tap to talk'}
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            listening
                                ? 'bg-red-500 scale-110 shadow-red-300'
                                : thinking
                                ? 'bg-slate-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-300'
                        }`}
                    >
                        {listening ? (
                            <>
                                <MicOff className="w-8 h-8 text-white" />
                                <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
                            </>
                        ) : thinking ? (
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                            <Mic className="w-8 h-8 text-white" />
                        )}
                    </button>

                    <p className="text-xs font-bold text-slate-500">
                        {listening
                            ? 'Listening... tap to stop'
                            : thinking
                            ? `${charConfig.persona.name} is thinking...`
                            : 'Tap the mic and talk!'}
                    </p>
                </div>
            </div>
        </div>
    );
}
