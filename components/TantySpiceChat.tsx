
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getTantySpiceResponseStream, narrateText, unlockMobileAudio, getGlobalAudioContext, isQuotaError } from '@/services/geminiService';
import { extractHeartString } from '@/services/tantyMemory';
import { logParentEvent } from '@/services/parentDashboard';
import { TANTY_AVATAR } from '@/lib/constants';
import { LazyImage } from './LazyImage';

const MOODS = [
    { emoji: '☀️', label: 'Sunny', color: 'bg-yellow-400' },
    { emoji: '🌧️', label: 'Rainy', color: 'bg-blue-400' },
    { emoji: '🌈', label: 'Rainbow', color: 'bg-orange-400' },
    { emoji: '🌩️', label: 'Stormy', color: 'bg-gray-400' }
];

const TantySpiceChat: React.FC<{
    ageGroup?: string;
    childId?: string;
    isTrialMode?: boolean;
    onUnlock?: () => void;
    userProfile?: any;
    onUpdateProfile?: (updates: any) => void;
}> = ({
    ageGroup = "6-8",
    childId = "demo_user",
    isTrialMode = false,
    onUnlock,
    userProfile,
    onUpdateProfile
}) => {
        const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isStreaming?: boolean }[]>([
            { role: 'bot', text: `Come in, ${userProfile?.name || 'me sugar-plum'}! Sit down on Tanty's porch. How's yuh heart today?` }
        ]);
        const [input, setInput] = useState("");
        const [isLoading, setIsLoading] = useState(false);
        const [isSpeaking, setIsSpeaking] = useState(false);
        const [selectedMood, setSelectedMood] = useState<string | null>(null);
        const [interactionCount, setInteractionCount] = useState(0);
        const [hasQuotaError, setHasQuotaError] = useState(false);
        const [isRemembering, setIsRemembering] = useState(false);

        const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
        const scrollRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }, [messages, isLoading]);

        const handleSend = async (overrideText?: string) => {
            const textToSend = overrideText || input;
            if (!textToSend.trim() || isLoading) return;

            if (isTrialMode && interactionCount >= 3) {
                setMessages(prev => [...prev, { role: 'bot', text: "Aw, me sugar-plum, our trial time is done! Tell Mummy or Daddy to click 'Start Free' so we can keep chattin' forever! 💖" }]);
                if (onUnlock) setTimeout(onUnlock, 4000); // Redirect after delay
                return;
            }

            // 🧶 Memory Detection Effect
            const newFact = extractHeartString(textToSend);
            if (newFact && onUpdateProfile && userProfile) {
                setIsRemembering(true);
                setTimeout(() => setIsRemembering(false), 3000);
                onUpdateProfile({
                    ...userProfile,
                    memory: {
                        ...userProfile.memory,
                        keyFacts: Array.from(new Set([...userProfile.memory.keyFacts, newFact])).slice(-10)
                    }
                });
            }

            setInput("");
            setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
            setIsLoading(true);
            setInteractionCount(prev => prev + 1);
            setHasQuotaError(false);

            logParentEvent(childId, 'chat_interaction', { length: textToSend.length, mood: selectedMood });

            try {
                setMessages(prev => [...prev, { role: 'bot', text: "", isStreaming: true }]);

                let fullResponse = "";
                const stream = getTantySpiceResponseStream(textToSend, ageGroup);

                for await (const chunk of stream) {
                    fullResponse += chunk;
                    setMessages(prev => {
                        const last = [...prev];
                        const botMsg = last[last.length - 1];
                        if (botMsg.role === 'bot') {
                            botMsg.text = fullResponse;
                        }
                        return last;
                    });
                }

                setMessages(prev => {
                    const last = [...prev];
                    last[last.length - 1].isStreaming = false;
                    return last;
                });

                if (parseInt(ageGroup) < 9) {
                    try {
                        const buffer = await narrateText(fullResponse);
                        if (buffer) {
                            const ctx = getGlobalAudioContext();
                            if (ctx.state === 'suspended') await ctx.resume();
                            const source = ctx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(ctx.destination);
                            source.onended = () => setIsSpeaking(false);
                            audioSourceRef.current = source;
                            source.start();
                            setIsSpeaking(true);
                        }
                    } catch (e) {
                        console.warn("Narration skipped", e);
                    }
                }
            } catch (error) {
                console.error("Chat error", error);
                if (isQuotaError(error)) {
                    setHasQuotaError(true);
                }
                setMessages(prev => {
                    const last = [...prev];
                    if (last[last.length - 1].isStreaming) {
                        last[last.length - 1].text = isQuotaError(error)
                            ? "Tanty's magic bowl is a bit empty right now, me sugar-plum. Let we wait a minute fuh de spirits to refill it."
                            : "The island breeze is a bit strong right now, me sugar-plum. Let we try again jus-now.";
                        last[last.length - 1].isStreaming = false;
                    }
                    return last;
                });
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div className="flex flex-col h-full md:h-[700px] w-full bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden border-4 md:border-8 border-white min-h-[400px]">
                <div className="p-4 md:p-8 border-b border-orange-50 flex items-center justify-between shrink-0 bg-orange-50/20 relative">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="relative">
                            <LazyImage
                                src={TANTY_AVATAR}
                                alt="Tanty"
                                containerClassName={`w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-orange-100 ${isSpeaking ? 'animate-vocal-bounce' : ''}`}
                            />
                            {isSpeaking && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-ping"></div>}
                        </div>
                        <div>
                            <h3 className="font-heading font-black text-lg md:text-2xl text-blue-950">Tanty Spice</h3>
                            <p className="text-orange-600 font-black uppercase text-[10px] tracking-widest">Village Wisdom</p>
                        </div>
                    </div>

                    {/* Memory Notification */}
                    {isRemembering && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-4 animate-in slide-in-from-top-4 duration-500 z-50">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
                                <span className="text-xl animate-bounce">🧶</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Tanty is remembering...</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {MOODS.map(m => (
                            <button
                                key={m.label}
                                onClick={() => { setSelectedMood(m.label); handleSend(`I'm feeling ${m.label} today!`); }}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl transition-all shadow-sm ${selectedMood === m.label ? m.color + ' scale-110 shadow-lg' : 'bg-blue-50 hover:bg-white'}`}
                                aria-label={`Feeling ${m.label}`}
                            >
                                {m.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar bg-blue-50/10">
                    {userProfile?.memory?.keyFacts?.length > 0 && (
                        <div className="flex justify-center">
                            <div className="bg-orange-50 px-4 py-2 rounded-full border border-orange-100 text-[10px] font-black uppercase tracking-widest text-orange-400">
                                Your heart-strings are safe wid Tanty ✨
                            </div>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-[2rem] px-6 py-4 md:py-6 shadow-md animate-message transition-all ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-blue-900 rounded-tl-none border-2 border-orange-50'}`}>
                                <p className="text-sm md:text-xl font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                {msg.isStreaming && <span className="inline-block w-2 h-4 bg-orange-400 ml-1 animate-pulse rounded-full"></span>}
                            </div>
                        </div>
                    ))}
                    {isLoading && !messages[messages.length - 1].isStreaming && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-white border-2 border-orange-50 rounded-full px-6 py-2 flex gap-2">
                                <div className="w-2 h-2 bg-orange-200 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 md:p-8 bg-white border-t border-orange-50 flex flex-col gap-4 shrink-0">
                    {isTrialMode && (
                        <div className="flex justify-center -mt-4 mb-2">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${interactionCount >= 3 ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-600'}`}>
                                {interactionCount >= 3 ? 'Trial Complete' : `${3 - interactionCount} Free Chats Left`}
                            </span>
                        </div>
                    )}
                    {hasQuotaError && (
                        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl flex items-center justify-between">
                            <p className="text-xs font-bold text-orange-800">Magic Bowl is Refilling (Quota Exhausted)</p>
                            <button
                                onClick={() => (window as any).aistudio?.openSelectKey()}
                                className="bg-orange-500 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                                Switch Magic Key 🗝️
                            </button>
                        </div>
                    )}
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Talk to Tanty..."
                            className="flex-1 px-8 py-4 md:py-6 rounded-full border-2 border-blue-50 outline-none focus:border-orange-300 text-sm md:text-xl font-black shadow-inner"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isTrialMode && interactionCount >= 3}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim() || (isTrialMode && interactionCount >= 3)}
                            className="w-12 h-12 md:w-20 md:h-20 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Send Message"
                        >
                            <span className="text-lg md:text-2xl">➔</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

export default TantySpiceChat;
