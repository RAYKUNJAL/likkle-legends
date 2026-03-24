"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft,
    Flame,
    Info,
    Lock,
    Loader2,
    MessageCircle,
    Mic,
    Send,
    ShieldCheck,
    Sparkles,
    Volume2,
    VolumeX,
    Zap
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getCharacterConfig, CHARACTER_ORDER, CharacterId, CharacterChild } from '@/lib/characterConfig';
import IslandVoice from '@/components/IslandVoice';
import { normalizeParentalControls } from '@/lib/parental-controls';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: string;
}

interface Limits {
    dailyUsed: number;
    dailyLimit: number;
    burstUsed: number;
    burstLimit: number;
    trialLabel?: string | null;
}

interface QuickPrompt {
    label: string;
    text: string;
}

declare global {
    interface Window {
        webkitSpeechRecognition?: any;
        SpeechRecognition?: any;
    }
    interface SpeechRecognitionEvent extends Event {
        results: SpeechRecognitionResultList;
    }
    interface SpeechRecognitionErrorEvent extends Event {
        error: string;
    }
    interface SpeechRecognition extends EventTarget {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        continuous: boolean;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        start: () => void;
        stop: () => void;
    }
}

const MESSAGE_CHAR_LIMIT = 320;

const DAILY_PROMPTS: Record<CharacterId, QuickPrompt[][]> = {
    roti: [
        [
            { label: 'Math Mission', text: 'Quiz me on Caribbean math.' },
            { label: 'Science Fact', text: 'Tell me a cool science fact.' },
            { label: 'Reading Help', text: 'Help me with reading.' },
            { label: 'Animal Time', text: 'What is a Caribbean animal?' },
            { label: 'Riddle', text: 'Give me a riddle.' },
        ],
        [
            { label: 'Island Lesson', text: 'Tell me about Jamaica.' },
            { label: 'Nature', text: 'What is photosynthesis?' },
            { label: 'Study Tips', text: 'How do I study better?' },
            { label: 'Challenge', text: 'Give me a challenge.' },
            { label: 'Brain Teaser', text: 'Let us do a brain teaser.' },
        ],
    ],
    tanty_spice: [
        [
            { label: 'Proverb', text: 'Tell me a Caribbean proverb.' },
            { label: 'Story', text: 'Tell me a folklore story.' },
            { label: 'Island Food', text: 'Tell me about tropical fruits.' },
            { label: 'Music', text: 'Tell me about island music.' },
            { label: 'Family', text: 'Why is family important?' },
        ],
        [
            { label: 'Culture', text: 'Tell me about Carnival.' },
            { label: 'Sea Life', text: 'What do sea turtles eat?' },
            { label: 'Plants', text: 'What plants grow here?' },
            { label: 'Wisdom', text: 'Share island wisdom with me.' },
            { label: 'Steelpan', text: 'Tell me about steelpan drums.' },
        ],
    ],
    dilly_doubles: [
        [
            { label: 'Challenge', text: 'Let us do a challenge.' },
            { label: 'Quick Quiz', text: 'Quiz me on anything.' },
            { label: 'Wild Fact', text: 'What is the coolest fact?' },
            { label: 'Game Help', text: 'Help me beat a hard level.' },
            { label: 'Space', text: 'Hit me with a space fact.' },
        ],
        [
            { label: 'Sports', text: 'Caribbean sports facts please.' },
            { label: 'Music', text: 'Tell me about soca music.' },
            { label: 'Ocean', text: 'Can you surf in the Caribbean?' },
            { label: 'Food', text: 'What is jerk chicken?' },
            { label: 'Riddle', text: 'Give me a riddle.' },
        ],
    ],
};

function getDailyPrompts(characterId: CharacterId): QuickPrompt[] {
    const sets = DAILY_PROMPTS[characterId];
    if (!sets || sets.length === 0) return [];
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return sets[Math.abs(day) % sets.length];
}

async function getSession() {
    const { data: { session } } = await import('@/lib/storage').then((m) => m.supabase.auth.getSession());
    return session;
}

export default function CharacterChatPage() {
    const params = useParams();
    const router = useRouter();
    const characterId = params.character as CharacterId;
    const { activeChild, canAccess, isLoading, user } = useUser();
    const parentalControls = normalizeParentalControls((user as any)?.parental_controls);

    if (!isLoading && !parentalControls.allow_buddy) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Buddy Chat Is Locked</h2>
                    <p className="text-slate-500 font-semibold">Your parent controls currently disable buddy chat.</p>
                    <button
                        type="button"
                        onClick={() => router.push('/portal/settings')}
                        className="inline-block mt-6 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black"
                    >
                        Open Parent Controls
                    </button>
                </div>
            </div>
        );
    }

    const config = useMemo(() => {
        try {
            return getCharacterConfig(characterId);
        } catch {
            return null;
        }
    }, [characterId]);

    const dailyPrompts = useMemo(() => {
        if (!characterId) return [];
        return getDailyPrompts(characterId);
    }, [characterId]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [userHasSent, setUserHasSent] = useState(false);
    const [limits, setLimits] = useState<Limits | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!config && characterId) {
            router.push('/portal/buddy');
        }
    }, [config, characterId, router]);

    useEffect(() => {
        if (!isLoading && user && !canAccess('starter_mailer')) {
            setErrorMessage('Buddy chat is available on paid plans.');
        }
    }, [canAccess, isLoading, user]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        setSpeechSupported(Boolean(SpeechRecognitionAPI));
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, statusMessage, errorMessage]);

    useEffect(() => {
        if (isLoading) return;
        if (!activeChild || !characterId || !config || !user || !canAccess('starter_mailer')) {
            setIsLoadingHistory(false);
            return;
        }

        let cancelled = false;
        const loadHistory = async () => {
            setIsLoadingHistory(true);
            setErrorMessage(null);
            setStatusMessage(null);
            try {
                const session = await getSession();
                const res = await fetch(
                    `/api/character-chat?characterId=${characterId}&childId=${activeChild.id}`,
                    { headers: { Authorization: `Bearer ${session?.access_token}` } }
                );
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.error || 'Failed to load buddy history.');
                }
                const history: { id: string; role: string; content: string }[] = data.history || [];

                if (cancelled) return;

                if (history.length > 0) {
                    setUserHasSent(true);
                    setMessages(history.map((m) => ({
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                        id: m.id
                    })));
                } else {
                    const welcomeText = config.persona.welcomeMessage(activeChild.first_name, activeChild.current_streak || 0);
                    setMessages([{ role: 'assistant', content: welcomeText, id: 'welcome-local' }]);
                }
            } catch (error: any) {
                if (cancelled) return;
                setErrorMessage(error?.message || 'Failed to load buddy history.');
                const welcomeText = config.persona.welcomeMessage(activeChild.first_name, activeChild.current_streak || 0);
                setMessages([{ role: 'assistant', content: welcomeText, id: 'welcome-local' }]);
            } finally {
                if (!cancelled) setIsLoadingHistory(false);
            }
        };

        loadHistory();
        return () => { cancelled = true; };
    }, [activeChild?.id, canAccess, characterId, config, isLoading, user]);

    const speakText = useCallback(async (text: string) => {
        if (!config) return;
        setIsSpeaking(true);
        try {
            const session = await getSession();
            const res = await fetch('/api/voice/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({
                    text,
                    voice: characterId,
                    voiceName: config.technical.geminiVoiceName
                })
            });
            if (!res.ok) throw new Error('Voice failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            if (audioRef.current) {
                audioRef.current.src = url;
                await audioRef.current.play();
                audioRef.current.onended = () => {
                    setIsSpeaking(false);
                    URL.revokeObjectURL(url);
                };
            }
        } catch {
            setIsSpeaking(false);
        }
    }, [config, characterId]);

    const sendMessage = useCallback(async (rawText: string) => {
        if (!activeChild || !config || isSending || !user || !canAccess('starter_mailer')) return;
        const text = rawText.trim();
        if (!text) return;
        if (text.length > MESSAGE_CHAR_LIMIT) {
            setErrorMessage(`Please keep messages under ${MESSAGE_CHAR_LIMIT} characters.`);
            return;
        }

        setUserHasSent(true);
        setIsSending(true);
        setInput('');
        setErrorMessage(null);
        setStatusMessage(null);

        const userMsg: Message = { role: 'user', content: text, id: `u-${Date.now()}` };
        setMessages((prev) => [...prev, userMsg]);

        try {
            const session = await getSession();
            const res = await fetch('/api/character-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ characterId, message: text, childId: activeChild.id })
            });

            const data = await res.json();
            if (data?.limits) setLimits(data.limits);

            if (!res.ok) {
                if (res.status === 402) {
                    setErrorMessage(data?.error || 'Buddy chat requires a paid plan.');
                    return;
                }
                if (res.status === 429) {
                    setStatusMessage(data?.error || 'Buddy is taking a short break. Please try again soon.');
                    return;
                }
                throw new Error(data?.error || 'Failed');
            }

            const assistantMsg: Message = { role: 'assistant', content: data.response, id: `a-${Date.now()}` };
            setMessages((prev) => [...prev, assistantMsg]);

            if (data?.blocked) {
                setStatusMessage('Safety mode is on. Your buddy will guide the chat back to safe learning topics.');
            }

            if (voiceEnabled) speakText(data.response);
        } catch {
            setErrorMessage('Connection issue. Try again in a moment.');
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: "I did not catch that. Try again and I will help.",
                id: `err-${Date.now()}`
            }]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    }, [activeChild, characterId, config, isSending, voiceEnabled, speakText]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isSending) sendMessage(input.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isSending) sendMessage(input.trim());
        }
    };

    const toggleListening = useCallback(() => {
        const SpeechRecognitionAPI = typeof window !== 'undefined'
            ? (window.SpeechRecognition || window.webkitSpeechRecognition)
            : null;

        if (!SpeechRecognitionAPI) return;

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = () => {
            setIsListening(false);
            setErrorMessage('Microphone could not understand. Please try again.');
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results?.[0]?.[0]?.transcript?.trim();
            if (!transcript) return;
            setInput(transcript);
            if (!isSending) sendMessage(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening, isSending, sendMessage]);

    if (!config) return null;

    const isPaidBuddyAccount = !isLoading && !!user && canAccess('starter_mailer');

    const childProfile: CharacterChild | null = activeChild ? {
        first_name: activeChild.first_name,
        primary_island: activeChild.primary_island || 'the Caribbean',
        total_xp: activeChild.total_xp || 0,
        current_streak: activeChild.current_streak || 0,
        age_track: activeChild.age_track || 'big',
        age: activeChild.age
    } : null;

    const dailyLeft = limits ? Math.max(0, limits.dailyLimit - limits.dailyUsed) : null;
    const nearLimit = limits ? limits.dailyUsed >= Math.max(1, limits.dailyLimit - 3) : false;
    const inputCharsLeft = MESSAGE_CHAR_LIMIT - input.length;

    return (
        <div className="h-screen flex flex-col bg-gradient-to-b from-sky-50 via-cyan-50 to-white">
            <audio ref={audioRef} className="hidden" />

            {isVoiceMode && childProfile && activeChild && (
                <IslandVoice
                    onClose={() => setIsVoiceMode(false)}
                    characterConfig={config}
                    child={childProfile}
                    childId={activeChild.id}
                />
            )}

            <header className={`bg-gradient-to-r ${config.visual.gradient} text-white px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0`}>
                <button
                    onClick={() => router.push('/portal/buddy')}
                    className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
                    aria-label="Back to buddy select"
                    title="Back to buddy select"
                >
                    <ArrowLeft size={18} />
                </button>

                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/40 flex-shrink-0 relative shadow-md">
                    <Image
                        src={config.persona.avatarUrl}
                        alt={config.persona.name}
                        fill
                        priority
                        quality={100}
                        className="object-cover"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="font-black text-base leading-none truncate">{config.persona.name}</h1>
                    <p className="text-white/80 text-xs font-semibold mt-0.5 truncate">{config.persona.role}</p>
                    <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-[10px] font-bold mt-1">
                        <ShieldCheck size={11} />
                        Kid-Safe Chat
                    </div>
                </div>

                {activeChild && (
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <div className="bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-black">
                            <Flame size={12} fill="currentColor" />
                            {activeChild.current_streak}
                        </div>
                        <div className="bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-black">
                            <Zap size={12} fill="currentColor" />
                            {activeChild.total_xp.toLocaleString()}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setIsVoiceMode(true)}
                    className="w-9 h-9 bg-white text-slate-700 rounded-xl flex items-center justify-center transition-all flex-shrink-0 hover:scale-110 shadow-md"
                    title="Open voice mode"
                    aria-label="Open voice mode"
                >
                    <Mic size={16} />
                </button>

                <button
                    onClick={() => {
                        if (voiceEnabled && audioRef.current) {
                            audioRef.current.pause();
                            setIsSpeaking(false);
                        }
                        setVoiceEnabled((v) => !v);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${voiceEnabled ? 'bg-white text-slate-700' : 'bg-white/20 text-white'}`}
                    title={voiceEnabled ? 'Voice read-aloud on' : 'Voice read-aloud off'}
                    aria-label={voiceEnabled ? 'Voice read-aloud on' : 'Voice read-aloud off'}
                >
                    {isSpeaking ? <Loader2 size={16} className="animate-spin" /> : voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
            </header>

            <div className="bg-white/90 border-b border-slate-200 px-4 py-2.5">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {CHARACTER_ORDER.map((id) => {
                        const isCurrent = id === characterId;
                        const label = getCharacterConfig(id).persona.name;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => router.push(`/portal/buddy/${id}`)}
                                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black transition-colors ${isCurrent
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {(limits || statusMessage || errorMessage) && (
                <div className="px-4 py-2 border-b border-slate-200 bg-white/90">
                    {limits && (
                        <p className={`text-xs font-semibold ${nearLimit ? 'text-amber-700' : 'text-slate-600'}`}>
                            {dailyLeft !== null ? `${dailyLeft} chats left today.` : 'Buddy chat limits are active.'}
                            {limits.trialLabel ? ` ${limits.trialLabel}` : ''}
                        </p>
                    )}
                    {statusMessage && (
                        <p className="text-xs font-semibold text-amber-700 mt-1">{statusMessage}</p>
                    )}
                    {errorMessage && (
                        <p className="text-xs font-semibold text-rose-700 mt-1">{errorMessage}</p>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-slate-300" size={36} />
                            <p className="text-slate-500 text-sm font-semibold">Loading your buddy...</p>
                        </div>
                    </div>
                ) : !isPaidBuddyAccount ? (
                    <div className="flex h-full items-center justify-center px-5 py-8">
                        <div className="w-full max-w-md rounded-[2rem] border border-amber-200 bg-white p-6 shadow-lg">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                <Lock size={22} />
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-slate-900">Buddy chat requires a paid plan.</h2>
                            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                                Upgrade to unlock commercial-grade voice chat, safe memory, and the full buddy experience for your child.
                            </p>
                            <div className="mt-5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.push('/checkout')}
                                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
                                >
                                    Upgrade Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/portal')}
                                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                                >
                                    Back to Portal
                                </button>
                            </div>
                        </div>
                    </div>
                ) : isLoadingHistory ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-slate-300" size={36} />
                            <p className="text-slate-500 text-sm font-semibold">Loading your buddy...</p>
                        </div>
                    </div>
                ) : !userHasSent ? (
                    <div className="flex flex-col items-center px-5 pt-6 pb-6 min-h-full">
                        <div className="relative mb-4">
                            <div
                                className="absolute -inset-5 rounded-full opacity-25 blur-2xl animate-pulse"
                                style={{ background: `radial-gradient(circle, ${config.visual.primaryColor}, transparent)` }}
                            />
                            <div className="absolute -top-2 -right-2">
                                <Sparkles size={24} className="text-amber-400" />
                            </div>
                            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10">
                                <Image
                                    src={config.persona.avatarUrl}
                                    alt={config.persona.name}
                                    fill
                                    priority
                                    quality={100}
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <h2 className="font-black text-2xl text-slate-800 tracking-tight text-center">{config.persona.name}</h2>
                        <p className="text-slate-600 text-sm font-semibold text-center mb-4 px-4">{config.persona.tagline}</p>

                        {messages[0] && (
                            <div className={`${config.visual.chatBubbleBot} px-5 py-4 rounded-3xl rounded-tl-sm text-sm font-medium leading-relaxed shadow-sm w-full max-w-md mb-5 border`}>
                                {messages[0].content}
                            </div>
                        )}

                        <div className="w-full max-w-md mb-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={14} className="text-slate-400" />
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Try asking me</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {dailyPrompts.map((prompt) => (
                                    <button
                                        key={prompt.text}
                                        onClick={() => sendMessage(prompt.text)}
                                        className={`flex flex-col items-start gap-1 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm border ${config.visual.chatBubbleBot}`}
                                    >
                                        <span className="text-[10px] uppercase tracking-wide font-black text-slate-500">{prompt.label}</span>
                                        <span className="text-xs font-bold text-slate-800 leading-tight">{prompt.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`w-full max-w-md mt-4 bg-gradient-to-r ${config.visual.gradient} rounded-2xl p-4 text-white flex items-center gap-3`}>
                            <MessageCircle size={28} className="flex-shrink-0" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-wide opacity-90">Daily Goal</p>
                                <p className="text-sm font-bold">Ask one learning question to keep your streak moving.</p>
                            </div>
                        </div>

                        <div ref={chatEndRef} />
                    </div>
                ) : (
                    <div className="px-4 py-4 space-y-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.role === 'assistant' && (
                                    <div className={`w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br ${config.visual.gradient} flex-shrink-0 relative shadow-md`}>
                                        <Image
                                            src={config.persona.avatarUrl}
                                            alt={config.persona.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className={`
                                    max-w-[82%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed
                                    ${msg.role === 'user'
                                        ? `${config.visual.chatBubbleUser} rounded-tr-sm`
                                        : `${config.visual.chatBubbleBot} rounded-tl-sm shadow-sm border`
                                    }
                                `}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isSending && (
                            <div className="flex gap-3">
                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${config.visual.gradient} flex-shrink-0 flex items-center justify-center text-white text-lg shadow-md`}>
                                    {config.visual.emoji}
                                </div>
                                <div className={`${config.visual.chatBubbleBot} px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm border`}>
                                    <div className="flex gap-1.5 items-center">
                                        <span className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: config.visual.primaryColor, animationDelay: '0ms' }} />
                                        <span className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: config.visual.primaryColor, animationDelay: '150ms' }} />
                                        <span className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: config.visual.primaryColor, animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            <div className="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {dailyPrompts.slice(0, 3).map((prompt) => (
                        <button
                            key={`chip-${prompt.text}`}
                            type="button"
                            onClick={() => sendMessage(prompt.text)}
                            disabled={isSending}
                            className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                        >
                            {prompt.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value.slice(0, MESSAGE_CHAR_LIMIT));
                            setErrorMessage(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask ${config.persona.name} something fun and safe...`}
                        rows={1}
                        className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 max-h-24 overflow-y-auto"
                        disabled={isSending}
                    />

                    {speechSupported && (
                        <button
                            type="button"
                            onClick={toggleListening}
                            disabled={isSending}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border ${isListening ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'} disabled:opacity-50`}
                            title={isListening ? 'Stop listening' : 'Speak your question'}
                            aria-label={isListening ? 'Stop listening' : 'Speak your question'}
                        >
                            {isListening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all bg-gradient-to-br ${config.visual.gradient} text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105`}
                    >
                        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                    <p className="text-slate-500 inline-flex items-center gap-1">
                        <Info size={12} />
                        Do not share private details like address, school, phone, or email.
                    </p>
                    <p className={`font-semibold ${inputCharsLeft < 40 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {input.length}/{MESSAGE_CHAR_LIMIT}
                    </p>
                </div>
            </div>
        </div>
    );
}
