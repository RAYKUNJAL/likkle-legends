"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Volume2, VolumeX, Mic, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getTantyVoice } from "@/app/actions/voice";
import { askTantySpice } from "@/app/actions/tanty";

import { useUser } from "@/components/UserContext";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function TantySpiceWidget() {
    const { activeChild } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Well hello, meh likkle chile! Tanty Spice here. What you feel like talkin' 'bout today?"
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceError, setVoiceError] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, scrollToBottom]);

    /**
     * 🎙️ Simplified speak function
     * Uses server-side TTS with browser fallback
     */
    const speak = useCallback(async (text: string) => {
        if (isMuted || typeof window === 'undefined') return;

        setIsSpeaking(true);
        setVoiceError(false);

        try {
            // Try server-side TTS (Google Cloud TTS) - uses activeChild for settings eventually
            const res = await getTantyVoice(text);

            if (res.success && res.audio) {
                // Play the audio
                if (audioRef.current) {
                    audioRef.current.src = res.audio;
                    audioRef.current.onended = () => setIsSpeaking(false);
                    audioRef.current.onerror = () => {
                        console.error("[Widget] Audio playback error");
                        setIsSpeaking(false);
                        fallbackToSpeechSynthesis(text);
                    };
                    await audioRef.current.play().catch(() => {
                        // Autoplay blocked, try on user interaction
                        setIsSpeaking(false);
                    });
                }
            } else {
                // Server TTS failed, use browser fallback
                console.log("[Widget] Server TTS unavailable, using browser voice");
                fallbackToSpeechSynthesis(text);
            }
        } catch (error) {
            console.error("[Widget] Speech error:", error);
            fallbackToSpeechSynthesis(text);
        }
    }, [isMuted]);

    /**
     * Browser-based speech synthesis fallback
     */
    const fallbackToSpeechSynthesis = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsSpeaking(false);
            setVoiceError(true);
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();

            // Try to find a warm female voice
            const preferredVoice =
                voices.find(v => v.name.includes('Google UK English Female')) ||
                voices.find(v => v.name.includes('Samantha')) ||
                voices.find(v => v.name.includes('Karen')) ||
                voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
                voices.find(v => v.lang.startsWith('en'));

            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.pitch = 0.9;
            utterance.rate = 0.85;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => {
                setIsSpeaking(false);
                setVoiceError(true);
            };

            window.speechSynthesis.speak(utterance);
        } catch {
            setIsSpeaking(false);
            setVoiceError(true);
        }
    }, []);

    const processMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { role: "user", content: text };
        const currentHistory = [...messages];

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const responseText = await askTantySpice(currentHistory, text, activeChild?.age_track || "6-8");

            if (responseText) {
                setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
                speak(responseText);
            } else {
                const errorMsg = "Ay ay, Tanty head a likkle confused right now. Try ask me again?";
                setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
                speak(errorMsg);
            }
        } catch (error) {
            console.error("[Widget] Message error:", error);
            const errorMsg = "Somethin' gone wrong wid de connection, darlin'. Let's try again!";
            setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [messages, speak]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || isLoading) return;
        processMessage(inputValue);
        setInputValue("");
    };

    const startListening = useCallback(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input not supported in this browser. Try Chrome!");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) processMessage(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    }, [processMessage]);

    return (
        <div className="font-quicksand">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-0 md:bottom-24 right-0 md:right-6 w-full md:w-[400px] h-[75vh] md:h-[650px] z-[50] flex flex-col overflow-hidden rounded-t-3xl md:rounded-3xl shadow-2xl bg-gradient-to-b from-amber-50 to-orange-50 border border-orange-200"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-orange-400 to-amber-500 p-5 flex items-center justify-between text-white">
                            {isSpeaking && (
                                <div className="absolute top-1/2 left-10 w-16 h-16 bg-orange-300/50 rounded-full animate-ping -translate-y-1/2" />
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`relative w-14 h-14 rounded-full border-4 ${isSpeaking ? 'border-white animate-pulse' : 'border-white/50'} overflow-hidden bg-amber-100`}>
                                    <Image
                                        src="/images/tanty_spice_avatar.jpg"
                                        alt="Tanty Spice"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl leading-tight flex items-center gap-2">
                                        Tanty Spice
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]" />
                                    </h3>
                                    <p className="text-xs text-white/80 font-medium">Village Grandmother • Live</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative z-10">
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    title="Close chat"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Voice error notice */}
                        {voiceError && !isMuted && (
                            <div className="bg-amber-100 px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
                                <span>🔇</span> Voice unavailable - reading text mode
                            </div>
                        )}

                        {/* Chat area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {messages.map((m, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] ${m.role === 'user'
                                        ? 'bg-orange-500 text-white rounded-br-none'
                                        : 'bg-white border border-orange-100 rounded-bl-none text-gray-800'}`}
                                    >
                                        <p className="leading-relaxed text-[15px]">{m.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-orange-100 flex gap-2 items-center">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-orange-100">
                            <div className="flex gap-2 items-center">
                                <input
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-800 placeholder:text-gray-400"
                                    placeholder="Talk to Tanty..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={startListening}
                                    disabled={isLoading || isListening}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-gray-100 text-orange-600 hover:bg-orange-50'}`}
                                    title="Voice input"
                                >
                                    <Mic size={22} />
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-12 h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-xl text-white flex items-center justify-center transition-all"
                                    title="Send message"
                                >
                                    {isLoading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl z-50 flex items-center justify-center overflow-hidden border-4 border-white bg-orange-400"
                        aria-label="Chat with Tanty Spice"
                    >
                        <Image
                            src="/images/tanty_spice_avatar.jpg"
                            alt="Tanty Spice"
                            fill
                            className="object-cover"
                        />
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Hidden audio element */}
            <audio ref={audioRef} className="hidden" />
        </div>
    );
}
