"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Send, Volume2, VolumeX, Flame, Zap, Loader2, Mic, Sparkles } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getCharacterConfig, CharacterId, CharacterChild } from '@/lib/characterConfig';
import IslandVoice from '@/components/IslandVoice';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    id: string;
}

const DAILY_PROMPTS: Record<CharacterId, { emoji: string; text: string }[][]> = {
    roti: [
        [
            { emoji: '🧮', text: 'Quiz me on Caribbean math!' },
            { emoji: '🔬', text: 'Tell me a cool science fact' },
            { emoji: '📖', text: 'Help me with reading' },
            { emoji: '🦎', text: "What's a Caribbean animal?" },
            { emoji: '🧩', text: 'Give me a riddle!' },
        ],
        [
            { emoji: '🌴', text: 'Tell me about Jamaica' },
            { emoji: '🌱', text: "What's photosynthesis?" },
            { emoji: '🎯', text: 'Make learning fun!' },
            { emoji: '🧠', text: 'How do I study better?' },
            { emoji: '⭐', text: 'Give me a challenge!' },
        ],
        [
            { emoji: '🌊', text: "What's in the Caribbean sea?" },
            { emoji: '🚀', text: 'Teach me something wild' },
            { emoji: '🎲', text: "Let's do a brain teaser" },
            { emoji: '🦋', text: "What's the coolest insect?" },
            { emoji: '🔢', text: "Quiz me on times tables!" },
        ],
    ],
    tanty_spice: [
        [
            { emoji: '📜', text: 'Tell me a Caribbean proverb' },
            { emoji: '🌺', text: 'What story do you know?' },
            { emoji: '🏝️', text: 'Tell me about our island' },
            { emoji: '🍛', text: 'What should I cook today?' },
            { emoji: '🎭', text: 'Tell me about Carnival' },
        ],
        [
            { emoji: '🐢', text: 'What do sea turtles eat?' },
            { emoji: '👨‍👩‍👧', text: 'Why is family important?' },
            { emoji: '🎶', text: 'Tell me about island music' },
            { emoji: '🌿', text: 'What plants grow here?' },
            { emoji: '🧓', text: 'Share island wisdom with me' },
        ],
        [
            { emoji: '🌊', text: 'Tell me a folklore story' },
            { emoji: '🥭', text: 'Tell me about tropical fruits' },
            { emoji: '🌅', text: "What's your favourite memory?" },
            { emoji: '🎪', text: 'What is a soca fete?' },
            { emoji: '🪘', text: 'Tell me about steelpan drums' },
        ],
    ],
    dilly_doubles: [
        [
            { emoji: '🏆', text: "Let's do a challenge!" },
            { emoji: '🎯', text: 'Quiz me on anything!' },
            { emoji: '🔥', text: "What's the coolest fact?" },
            { emoji: '🎮', text: 'Help me beat a hard level' },
            { emoji: '⚡', text: "What's the fastest animal?" },
        ],
        [
            { emoji: '🧠', text: "Let's do a brain teaser" },
            { emoji: '🌍', text: 'Teach me something wild' },
            { emoji: '🏄', text: 'Caribbean sports facts!' },
            { emoji: '🦁', text: "What's the strongest animal?" },
            { emoji: '🚀', text: 'Space facts! Hit me!' },
        ],
        [
            { emoji: '🎵', text: 'Tell me about soca music!' },
            { emoji: '🥊', text: 'Sports champions from the islands?' },
            { emoji: '🌊', text: 'Can you surf in the Caribbean?' },
            { emoji: '🍗', text: 'What is jerk chicken?' },
            { emoji: '🧩', text: 'Give me a riddle!' },
        ],
    ],
};

function getDailyPrompts(characterId: CharacterId): { emoji: string; text: string }[] {
    const sets = DAILY_PROMPTS[characterId];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return sets[dayOfYear % sets.length];
}

async function getSession() {
    const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());
    return session;
}

export default function CharacterChatPage() {
    const params = useParams();
    const router = useRouter();
    const characterId = params.character as CharacterId;
    const { activeChild } = useUser();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [userHasSent, setUserHasSent] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    let config;
    try {
        config = getCharacterConfig(characterId);
    } catch {
        router.push('/portal/buddy');
        return null;
    }

    const dailyPrompts = getDailyPrompts(characterId);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!activeChild || !characterId) return;

        let cancelled = false;

        const loadHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const session = await getSession();
                const res = await fetch(
                    `/api/character-chat?characterId=${characterId}&childId=${activeChild.id}`,
                    { headers: { 'Authorization': `Bearer ${session?.access_token}` } }
                );
                const data = await res.json();
                const history: { id: string; role: string; content: string }[] = data.history || [];

                if (cancelled) return;

                if (history.length > 0) {
                    setUserHasSent(true);
                    setMessages(history.map(m => ({
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                        id: m.id
                    })));
                } else {
                    const welcomeText = config!.persona.welcomeMessage(
                        activeChild.first_name,
                        activeChild.current_streak || 0
                    );
                    setMessages([{
                        role: 'assistant',
                        content: welcomeText,
                        id: 'welcome-local'
                    }]);
                }
            } catch {
                if (cancelled) return;
                const welcomeText = config!.persona.welcomeMessage(
                    activeChild.first_name,
                    activeChild.current_streak || 0
                );
                setMessages([{
                    role: 'assistant',
                    content: welcomeText,
                    id: 'welcome-local'
                }]);
            } finally {
                if (!cancelled) setIsLoadingHistory(false);
            }
        };

        loadHistory();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChild?.id, characterId]);

    const sendMessage = useCallback(async (text: string) => {
        if (!activeChild || !text.trim() || isSending) return;

        setUserHasSent(true);
        setIsSending(true);
        setInput('');

        const userMsg: Message = { role: 'user', content: text, id: `u-${Date.now()}` };
        setMessages(prev => [...prev, userMsg]);

        try {
            const session = await getSession();
            const res = await fetch('/api/character-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ characterId, message: text, childId: activeChild.id })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');

            const assistantMsg: Message = { role: 'assistant', content: data.response, id: `a-${Date.now()}` };
            setMessages(prev => [...prev, assistantMsg]);

            if (voiceEnabled) speakText(data.response);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Hmm, I didn't catch that. Try again!",
                id: `err-${Date.now()}`
            }]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    }, [activeChild, characterId, voiceEnabled, isSending]);

    const speakText = async (text: string) => {
        if (!config) return;
        setIsSpeaking(true);
        try {
            const res = await fetch('/api/voice/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voiceId: config.technical.elevenLabsVoiceId,
                    voiceName: config.technical.geminiVoiceName
                })
            });
            if (!res.ok) throw new Error('Voice failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                audioRef.current.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
            }
        } catch {
            setIsSpeaking(false);
        }
    };

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

    if (!config) return null;

    const childProfile: CharacterChild | null = activeChild ? {
        first_name: activeChild.first_name,
        primary_island: activeChild.primary_island || 'the Caribbean',
        total_xp: activeChild.total_xp || 0,
        current_streak: activeChild.current_streak || 0,
        age_track: activeChild.age_track || 'big',
        age: activeChild.age
    } : null;

    return (
        <div className="h-screen flex flex-col bg-[#F0F9FF]">
            <audio ref={audioRef} className="hidden" />

            {isVoiceMode && childProfile && (
                <IslandVoice
                    onClose={() => setIsVoiceMode(false)}
                    characterConfig={config}
                    child={childProfile}
                />
            )}

            {/* Header */}
            <header className={`bg-gradient-to-r ${config.visual.gradient} text-white px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0`}>
                <button
                    onClick={() => router.push('/portal/buddy')}
                    className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
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
                    <p className="text-white/70 text-xs font-medium mt-0.5 truncate">{config.persona.role}</p>
                </div>

                {activeChild && (
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                    title="Voice Mode"
                >
                    <Mic size={16} />
                </button>

                <button
                    onClick={() => {
                        if (voiceEnabled && audioRef.current) { audioRef.current.pause(); setIsSpeaking(false); }
                        setVoiceEnabled(v => !v);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${voiceEnabled ? 'bg-white text-slate-700' : 'bg-white/20 text-white'}`}
                >
                    {isSpeaking ? <Loader2 size={16} className="animate-spin" /> : voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
            </header>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto">
                {isLoadingHistory ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-slate-300" size={36} />
                            <p className="text-slate-400 text-sm font-semibold">Loading your buddy...</p>
                        </div>
                    </div>
                ) : !userHasSent ? (
                    /* ── Welcome Hero Screen ── */
                    <div className="flex flex-col items-center px-5 pt-5 pb-6 min-h-full">

                        {/* Big character avatar with animated glow */}
                        <div className="relative mb-4">
                            <div
                                className="absolute -inset-5 rounded-full opacity-25 blur-2xl animate-pulse"
                                style={{ background: `radial-gradient(circle, ${config.visual.primaryColor}, transparent)` }}
                            />
                            {/* Floating decorations */}
                            <span className="absolute -top-2 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0ms' }}>✨</span>
                            <span className="absolute top-0 -left-4 text-xl animate-bounce" style={{ animationDelay: '300ms' }}>🌟</span>
                            <span className="absolute -bottom-2 -right-4 text-xl animate-bounce" style={{ animationDelay: '600ms' }}>🎉</span>

                            <div className={`w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10`}>
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

                        {/* Name + emoji badge */}
                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">
                            {config.persona.name} <span>{config.visual.emoji}</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-semibold text-center mb-4 px-4">
                            {config.persona.tagline}
                        </p>

                        {/* Welcome message */}
                        {messages[0] && (
                            <div className={`${config.visual.chatBubbleBot} px-5 py-4 rounded-3xl rounded-tl-sm text-sm font-medium leading-relaxed shadow-sm w-full max-w-sm mb-5 border`}>
                                {messages[0].content}
                            </div>
                        )}

                        {/* Prompt chips label */}
                        <div className="w-full max-w-sm mb-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={14} className="text-slate-400" />
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Try asking me...</p>
                            </div>

                            {/* Prompt grid — 2-col */}
                            <div className="grid grid-cols-2 gap-2">
                                {dailyPrompts.map((prompt) => (
                                    <button
                                        key={prompt.text}
                                        onClick={() => sendMessage(prompt.text)}
                                        className={`flex flex-col items-start gap-1.5 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.03] active:scale-[0.97] shadow-sm border ${config.visual.chatBubbleBot}`}
                                    >
                                        <span className="text-2xl">{prompt.emoji}</span>
                                        <span className="text-xs font-black text-slate-700 leading-tight">{prompt.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Daily challenge strip */}
                        <div className={`w-full max-w-sm mt-4 bg-gradient-to-r ${config.visual.gradient} rounded-2xl p-4 text-white flex items-center gap-3`}>
                            <span className="text-3xl flex-shrink-0">🏆</span>
                            <div>
                                <p className="text-xs font-black uppercase tracking-wide opacity-80">Daily Challenge</p>
                                <p className="text-sm font-bold">Ask {config.persona.name.split(' ')[0]} a question to earn your XP today!</p>
                            </div>
                        </div>

                        <div ref={chatEndRef} />
                    </div>
                ) : (
                    /* ── Active Chat Messages ── */
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
                                    max-w-[78%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed
                                    ${msg.role === 'user'
                                        ? config.visual.chatBubbleUser + ' rounded-tr-sm'
                                        : config.visual.chatBubbleBot + ' rounded-tl-sm shadow-sm border'
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

            {/* Input */}
            <div className="bg-white border-t border-slate-100 px-4 py-3 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask ${config.persona.name}...`}
                        rows={1}
                        className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 max-h-24 overflow-y-auto"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all bg-gradient-to-br ${config.visual.gradient} text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105`}
                    >
                        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
