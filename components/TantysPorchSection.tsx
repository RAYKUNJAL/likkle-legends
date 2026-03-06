
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Mic, Send, Volume2, VolumeX, Sparkles } from "lucide-react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

import IslandVoice from '@/components/IslandVoice';
import { askTantySpice } from '@/app/actions/tanty';
import { useUser } from '@/components/UserContext';

export default function TantysPorchSection() {
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Come in, me sugar-plum! Sit down on Tanty's porch. How's yuh heart feelin' today?"
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [storyCount, setStoryCount] = useState(0);
    const [hasReachedLimit, setHasReachedLimit] = useState(false);

    // Quick Tabs Configuration
    const TABS = [
        { id: 'stories', label: 'Story Time 📚', color: 'bg-emerald-100 text-emerald-700', activeColor: 'bg-emerald-500 text-white' },
        { id: 'feelings', label: 'My Feelings ❤️', color: 'bg-rose-100 text-rose-700', activeColor: 'bg-rose-500 text-white' },
        { id: 'fun', label: 'Island Fun 🌴', color: 'bg-sky-100 text-sky-700', activeColor: 'bg-sky-500 text-white' },
    ] as const;

    const QUICK_OPTIONS = {
        stories: ["Tell me a story about Anansi", "narrate Mama Bois", "Why Dog chase Cat?"],
        feelings: ["I feel Sunny ☀️", "I feel Rainy 🌧️", "I feel like a Rainbow 🌈", "I feel Stormy ⛈️"],
        fun: ["What is Carnival?", "Tell me about Steel Pan", "What is Callaloo?"]
    };

    const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('stories');

    // Persist story count in session storage mainly, defaulting to 0
    useEffect(() => {
        const stored = sessionStorage.getItem("tanty_story_count");
        if (stored) {
            const count = parseInt(stored, 10);
            setStoryCount(count);
            if (count >= 3) setHasReachedLimit(true);
        }
    }, []);

    const speak = useCallback(async (text: string) => {
        if (typeof window === 'undefined') return;

        // Cancel browser synthesis if any
        window.speechSynthesis.cancel();

        try {
            // Import the server action dynamically if needed, or assume it's imported at top
            // leveraging the same high-quality voice pipeline as the widget
            const { getTantyVoice } = await import('@/app/actions/voice');

            const res = await getTantyVoice(text);

            if (res.success && res.audio) {
                const audio = new Audio(res.audio);
                audio.play();
            } else {
                console.warn("Falling back to browser TTS due to server error");
                // Minimal Fallback (robotic)
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => v.name.includes('Google UK English Female')) ||
                    voices.find(v => v.name.includes('Google US English')) ||
                    voices.find(v => v.name.includes('Natural')) ||
                    voices.find(v => v.name.includes('Samantha'));

                if (preferredVoice) utterance.voice = preferredVoice;
                utterance.pitch = 0.9;
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        } catch (e) {
            console.error("Voice playback error:", e);
        }
    }, []);

    const { activeChild } = useUser();

    const processMessage = useCallback(async (text: string) => {
        // Prevent double-submissions
        if (isLoading) return;

        // Check story limit for non-paid users scenario (simulated here)
        const isStoryRequest = text.toLowerCase().includes("story");

        if (isStoryRequest && storyCount >= 3) {
            setMessages(prev => [...prev, { role: "user", content: text }]);
            const limitMsg = "Oh gosh! Tanty tired now, story time done for today. Sign up to hear plenty more stories tomorrow!";
            setTimeout(() => {
                setMessages(prev => [...prev, { role: "assistant", content: limitMsg }]);
                speak(limitMsg);
            }, 500);
            setHasReachedLimit(true);
            return;
        }

        const userMsg: Message = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Use Server Action instead of API Route - passing age track
            const content = await askTantySpice(messages, text, activeChild?.age_track || "6-8");

            if (content) {
                setMessages((prev) => [...prev, { role: "assistant", content }]);

                // Auto-speak result for full voice chatbot experience
                speak(content);

                // If it was a story request and successful, increment count
                if (isStoryRequest) {
                    const newCount = storyCount + 1;
                    setStoryCount(newCount);
                    sessionStorage.setItem("tanty_story_count", newCount.toString());
                    if (newCount >= 3) setHasReachedLimit(true);
                }
            } else {
                const errorMsg = "Ay ay, Tanty head a little confused right now. Try ask me again?";
                setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
                speak(errorMsg);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg = "Something gone wrong with the connection, darling.";
            setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, storyCount, messages, speak]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        processMessage(inputValue);
        setInputValue("");
    };

    const startListening = useCallback(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    processMessage(transcript);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            // Fallback for non-supported browsers
            alert("Voice input not supported in this browser.");
        }
    }, [processMessage]);

    return (
        <section className="py-24 bg-gradient-to-b from-amber-50 to-orange-100 relative overflow-hidden" id="tantys-porch">
            {isLiveMode && <IslandVoice onClose={() => setIsLiveMode(false)} characterConfig={null as any} child={null as any} />}
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300 opacity-20 rounded-full blur-[120px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-[120px] -ml-32 -mb-32"></div>

            <div className="container relative z-10">
                <div className="text-center mb-12 space-y-4">
                    <span className="text-orange-600 font-bold uppercase tracking-[0.2em] text-sm">Village Heart</span>
                    <h2 className="text-4xl lg:text-5xl font-black text-deep">Welcome to Tanty’s Porch</h2>
                    <p className="text-xl text-deep/70 max-w-2xl mx-auto">
                        A safe space for stories, wisdom, and warm hugs.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white flex flex-col lg:flex-row">
                    {/* Visual Side */}
                    <div className="lg:w-1/3 bg-gradient-to-br from-amber-400 to-orange-500 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
                        <div className="relative w-48 h-48 rounded-full border-4 border-white/30 shadow-2xl mb-6 overflow-hidden bg-amber-200">
                            <Image
                                src="/images/tanty_spice_avatar.jpg"
                                alt="Tanty Spice"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="text-2xl font-black mb-2 text-center">Tanty Spice</h3>
                        <p className="text-white/80 text-center font-medium mb-8">
                            "Everything cook and curry!"
                        </p>

                        {/* Call Tanty Button (Kid-Friendly) */}
                        <button
                            onClick={() => setIsLiveMode(true)}
                            className="mb-8 w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 border-b-4 border-green-700 rounded-2xl flex items-center justify-center gap-3 transition-all group shadow-lg hover:scale-[1.02] active:scale-95 active:border-b-0 active:translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md animate-bounce">
                                <span className="text-2xl">📞</span>
                            </div>
                            <div className="text-left leading-tight">
                                <span className="block font-black text-white uppercase tracking-wider text-lg drop-shadow-md">Talk to Tanty!</span>
                                <span className="block text-xs text-green-100 font-bold">Try de Live Demo</span>
                            </div>
                        </button>

                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-full text-center border border-white/20">
                            <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Story Reads Left</p>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`w-3 h-3 rounded-full ${i <= (3 - storyCount) ? 'bg-white' : 'bg-white/30'}`}></div>
                                ))}
                            </div>
                            {hasReachedLimit && (
                                <p className="text-xs mt-3 font-bold text-yellow-200">Daily limit reached!</p>
                            )}
                        </div>
                    </div>

                    {/* Chat Interface Side */}
                    <div className="lg:w-2/3 flex flex-col h-[500px] lg:h-[600px] bg-[#FFFBF0]">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-5 rounded-3xl text-lg leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-orange-500 text-white rounded-br-none'
                                        : 'bg-white text-deep border border-amber-100 rounded-bl-none'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-3xl rounded-bl-none border border-amber-100 shadow-sm flex gap-2 items-center">
                                        <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                        <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                        <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-amber-100 flex flex-col gap-4">

                            {/* Tab Navigation */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? tab.activeColor : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Quick Options */}
                            <div className="flex gap-2 flex-wrap">
                                {QUICK_OPTIONS[activeTab].map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => processMessage(option)}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-medium text-sm hover:bg-orange-100 hover:border-orange-300 transition-colors text-left"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={startListening}
                                    disabled={isLoading || isListening}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${isListening
                                        ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                                        : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                        }`}
                                    title="Speak to Tanty"
                                >
                                    <Mic size={24} />
                                </button>

                                <div className="flex-1 relative">
                                    <input
                                        className="w-full bg-amber-50 border-2 border-amber-100 rounded-full px-6 py-4 outline-none focus:border-orange-400 focus:bg-white transition-colors font-medium text-lg placeholder:text-amber-300 text-deep"
                                        placeholder="Type a message..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-14 h-14 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-full text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
                                    aria-label="Send Message"
                                >
                                    <Send size={24} className={isLoading ? 'opacity-50' : 'ml-1'} />
                                </button>
                            </div>
                            <div className="mt-4 flex gap-4 justify-center text-sm font-bold text-amber-400/60 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Sparkles size={14} /> Folklore</span>
                                <span className="flex items-center gap-2"><Sparkles size={14} /> Wisdom</span>
                                <span className="flex items-center gap-2"><Sparkles size={14} /> Comfort</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
