"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { MessageSquare, X, Send, Volume2 } from 'lucide-react';
import { askTantySpice } from '@/app/actions/tanty';
import { getTantyVoice } from '@/app/actions/voice';
import { siteContent } from '@/lib/content';

export default function TantySpiceWidget() {
    const { tanty_spice_chat } = siteContent;
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<{ role: 'user' | 'tanty', text: string }[]>([
        { role: 'tanty', text: tanty_spice_chat.welcome_message }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [usageCount, setUsageCount] = useState(0);
    const MAX_FREE_USAGE = 3;
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speak = async (text: string) => {
        setIsPlaying(true);
        // 1. Try ElevenLabs via Server Action
        const res = await getTantyVoice(text);
        if (res.success && res.audio) {
            if (audioRef.current) {
                audioRef.current.src = res.audio;
                audioRef.current.play();
                audioRef.current.onended = () => setIsPlaying(false);
            }
        } else {
            // 2. Fallback to Browser TTS
            console.warn("Using fallback TTS");
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.2; // Slightly higher/female
            utterance.rate = 1.1; // Energetic
            // Try to find a female voice
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
            if (femaleVoice) utterance.voice = femaleVoice;

            utterance.onend = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        // Check Limit
        if (usageCount >= MAX_FREE_USAGE) {
            setChat(prev => [...prev, { role: 'user', text: message }]);
            setTimeout(() => {
                setChat(prev => [
                    ...prev,
                    { role: 'tanty', text: "Oye darlin'! We've been chatting up a storm! Ask your Mommy or Daddy to join the club so we can keep talking. Magic inputs need resting!" }
                ]);
            }, 600);
            setMessage("");
            return;
        }

        const userMsg = message;
        setMessage("");
        setChat(prev => [...prev, { role: 'user', text: userMsg }]);
        setUsageCount(prev => prev + 1);

        setIsTyping(true);

        try {
            // Map 'tanty' to 'assistant' for the API
            const history = chat.map(msg => ({
                role: msg.role === 'tanty' ? 'assistant' as const : 'user' as const,
                content: msg.text
            }));

            const response = await askTantySpice(history, userMsg);
            setChat(prev => [...prev, { role: 'tanty', text: response }]);

            // Auto-speak the response if it's short, or user can click play
            // For now, let's auto-speak since user asked for "talking with a voice"
            speak(response);

        } catch (e) {
            setChat(prev => [...prev, { role: 'tanty', text: tanty_spice_chat.states.error.message }]);
        }

        setIsTyping(false);
    };

    if (!tanty_spice_chat.enabled) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-24 h-24 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform animate-bounce-slow relative group border-4 border-white bg-accent"
                    aria-label="Talk to Tanty Spice"
                >
                    {/* Main Avatar Image */}
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                        <Image
                            src="/images/tanty_spice.png"
                            alt="Tanty Spice"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Badge */}
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 border-white shadow-sm transform rotate-6">
                        Chat!
                    </span>

                    {/* Ring Animation */}
                    <div className="absolute -inset-1 rounded-full border-2 border-accent/30 animate-ping"></div>
                </button>
            ) : (
                <div className="w-[380px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col h-[600px] animate-in slide-in-from-bottom duration-500 glass">
                    <div className="bg-accent p-6 text-white flex items-center justify-between shadow-lg relative overflow-hidden transition-all duration-500"
                        style={{ height: isPlaying || isTyping ? '180px' : 'auto' }}
                    >
                        {/* Dynamic Background */}
                        <div className={`absolute inset-0 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-xy"></div>
                        </div>

                        {/* Status Visualizer - Large Icons for Kids */}
                        {isPlaying ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-in zoom-in">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                                    <Volume2 size={40} className="text-accent animate-pulse" />
                                </div>
                                <p className="mt-2 text-xl font-black text-white drop-shadow-md">I'm Speaking!</p>
                            </div>
                        ) : isTyping ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-in zoom-in">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl animate-spin-slow border-4 border-white/50">
                                    <div className="w-4 h-4 bg-white rounded-full mx-1 animate-bounce"></div>
                                    <div className="w-4 h-4 bg-white rounded-full mx-1 animate-bounce delay-150"></div>
                                    <div className="w-4 h-4 bg-white rounded-full mx-1 animate-bounce delay-300"></div>
                                </div>
                                <p className="mt-2 text-xl font-black text-white drop-shadow-md">Thinking...</p>
                            </div>
                        ) : (
                            // Default Header State
                            <>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="flex items-center gap-4 relative z-10 transition-all">
                                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold border-2 border-white/40 overflow-hidden shadow-inner relative">
                                        <Image
                                            src="/images/tanty_spice.png"
                                            alt="Tanty"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{tanty_spice_chat.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white/20"></span>
                                            <p className="text-xs text-white/80 font-bold tracking-wide">{tanty_spice_chat.status_text}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close chat"
                                    title="Close chat"
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
                                >
                                    <X size={24} strokeWidth={3} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scrollbar-thin scrollbar-thumb-gray-200">
                        {chat.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`relative max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-white border text-deep rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                    {msg.role === 'tanty' && (
                                        <button
                                            onClick={() => speak(msg.text)}
                                            className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isPlaying ? 'text-primary' : 'text-gray-400 hover:text-primary'} transition-colors ml-auto mr-0`}
                                            aria-label="Listen to message"
                                            title="Listen to message"
                                        >
                                            <Volume2 size={12} className={isPlaying ? 'animate-pulse' : ''} />
                                            {isPlaying ? 'Speaking...' : 'Listen'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2 text-xs text-deep/40 italic pl-4">
                                <div className="w-2 h-2 bg-deep/20 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-deep/20 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-deep/20 rounded-full animate-bounce delay-150"></div>
                                {tanty_spice_chat.states.loading.message}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t bg-white flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] relative z-10">
                        <input
                            type="text"
                            placeholder={tanty_spice_chat.input_placeholder}
                            className="flex-1 bg-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all border-none font-medium"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            aria-label={tanty_spice_chat.button_label}
                            title={tanty_spice_chat.button_label}
                            disabled={!message.trim() || isTyping}
                            className="bg-accent w-12 h-12 rounded-xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:scale-100"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
            <audio ref={audioRef} className="hidden" />
        </div>
    );
}
