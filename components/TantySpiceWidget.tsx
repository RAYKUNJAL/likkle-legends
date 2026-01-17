
"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Volume2, VolumeX, Mic } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TANTY_ISLAND_ENGINE } from "@/services/tantyConfig";
import { getTantyVoice } from "@/app/actions/voice";
import { askTantySpice } from "@/app/actions/tanty";
import { narrateText, getGlobalAudioContext } from "@/services/geminiService";
import { warmupVoiceCache } from "@/services/voiceCacheService";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function TantySpiceWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Well hello, meh likkle chile! Tanty Spice here. What you feel like talking ‘bout today?"
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        // Warm up cache on mount
        warmupVoiceCache(narrateText).catch(console.error);
    }, []);

    const speak = async (text: string) => {
        if (isMuted || typeof window === 'undefined') return;

        setIsSpeaking(true);
        try {
            // Use client-side narrateText for caching benefits
            const audioBuffer = await narrateText(text);

            if (audioBuffer) {
                const ctx = getGlobalAudioContext();
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => setIsSpeaking(false);
                source.start(0);
            } else {
                // Fallback to Server Action if client-side fails
                const res = await getTantyVoice(text);
                if (res.success && res.audio) {
                    if (audioRef.current) {
                        audioRef.current.src = res.audio;
                        audioRef.current.play();
                        audioRef.current.onended = () => setIsSpeaking(false);
                    }
                } else {
                    // Fallback to Browser TTS (robotic)
                    const utterance = new SpeechSynthesisUtterance(text);
                    const voices = window.speechSynthesis.getVoices();
                    const preferredVoice = voices.find(v => v.name.includes('Google UK English Female')) ||
                        voices.find(v => v.name.includes('Google US English')) ||
                        voices.find(v => v.name.includes('Natural')) ||
                        voices.find(v => v.name.includes('Samantha'));

                    if (preferredVoice) utterance.voice = preferredVoice;
                    utterance.pitch = 0.9;
                    utterance.rate = 0.9;
                    utterance.onend = () => setIsSpeaking(false);
                    window.speechSynthesis.speak(utterance);
                }
            }
        } catch (e) {
            console.error("Speech error:", e);
            setIsSpeaking(false);
        }
    };

    const processMessage = async (text: string) => {
        const userMsg: Message = { role: "user", content: text };
        // Pass current messages (history) and the new text
        const currentHistory = [...messages];
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Updated to use server action directly
            const responseText = await askTantySpice(currentHistory, text);

            if (responseText) {
                setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
                speak(responseText);
            } else {
                const errorMsg = "Ay ay, Tanty head a little confused right now. Try ask me again?";
                setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
                speak(errorMsg);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg = "Something gone wrong with the connection, darlin'.";
            setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        processMessage(inputValue);
        setInputValue("");
    };

    const startListening = () => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) processMessage(transcript);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        }
    };

    return (
        <div className="font-quicksand">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-0 md:bottom-24 right-0 md:right-6 w-full md:w-[400px] h-[75vh] md:h-[650px] z-[50] flex flex-col overflow-hidden glassmorphism-tanty rounded-t-3xl md:rounded-3xl shadow-2xl animate-float"
                    >
                        {/* Header with Neural Aura */}
                        <div className="relative bg-gradient-to-r from-orange-400/90 to-amber-500/90 p-6 flex items-center justify-between text-white overflow-hidden">
                            {isSpeaking && (
                                <div className="absolute top-1/2 left-10 w-20 h-20 bg-orange-300 rounded-full animate-neural-aura -translate-y-1/2" />
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`relative w-14 h-14 rounded-full border-4 border-white/50 overflow-hidden bg-amber-100 ${isListening ? 'animate-neural-halo outline-red-500' : ''}`}>
                                    <Image
                                        src="/images/tanty_spice_avatar.jpg"
                                        alt="Tanty Spice"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="font-fredoka">
                                    <h3 className="font-bold text-xl leading-tight flex items-center gap-2">
                                        Tanty Spice
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]" />
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-white/80 font-black uppercase tracking-widest">Village Elder</p>
                                        <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded font-black uppercase">Live</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative z-10">
                                <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Chat area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent scrollbar-hide">
                            {messages.map((m, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-4 rounded-2xl shadow-sm text-deep transition-all ${m.role === 'user'
                                        ? 'bg-orange-500 text-white rounded-br-none'
                                        : 'bg-white/90 backdrop-blur-sm border border-orange-100 rounded-bl-none'} max-w-[85%]`}
                                    >
                                        <p className="leading-relaxed">{m.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white/40 backdrop-blur-xl border-t border-white/20">
                            <div className="flex gap-3 items-center">
                                <input
                                    className="flex-1 bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 font-medium placeholder:text-gray-400 text-deep shadow-inner"
                                    placeholder="Talk to Tanty..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={startListening}
                                    disabled={isLoading || isListening}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/80 text-orange-600 hover:bg-orange-50'}`}
                                >
                                    <Mic size={24} />
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-14 h-14 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-2xl text-white flex items-center justify-center transition-all shadow-lg shadow-orange-200"
                                >
                                    <Send size={24} className={isLoading ? 'opacity-50' : ''} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float FAB */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className={`fixed bottom-8 right-8 w-20 h-20 rounded-full shadow-2xl z-50 flex items-center justify-center overflow-hidden border-4 border-white transition-all ${isSpeaking ? 'animate-neural-aura scale-110' : 'animate-float'}`}
                    >
                        <Image
                            src="/images/tanty_spice_avatar.jpg"
                            alt="Tanty Spice"
                            fill
                            className="object-cover"
                        />
                        {/* Status Halo */}
                        <div className={`absolute inset-0 border-4 rounded-full ${isSpeaking ? 'border-orange-400 animate-pulse' : 'border-white/20'}`} />
                    </motion.button>
                )}
            </AnimatePresence>
            <audio ref={audioRef} className="hidden" />
        </div>
    );
}
