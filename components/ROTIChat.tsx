'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// R.O.T.I. System Prompt
const getROTISystemInstruction = (ageGroup: string = "6-9"): string => `
You are R.O.T.I. (Robotic Operational Teaching Interface), a friendly Caribbean island learning robot for kids ages ${ageGroup}.

MISSION:
Help kids learn (reading, math, science, creativity), practice good thinking, and explore Caribbean culture in a positive, respectful way.

STYLE:
- Friendly, short sentences. Clear steps.
- Explain big words simply.
- Use fun island flavor lightly (food, sea, sunshine, steelpan), but do not imitate or stereotype accents.
- Include occasional one-liners like "Brains on—sunshine mode!" (not every message).

SAFETY RULES (NON-NEGOTIABLE):
- Never provide instructions for violence, weapons, self-harm, illegal acts, or sexual content.
- Do not discuss politics, religion controversies, or adult relationships.
- If a child mentions harm or abuse: respond with warmth, encourage them to talk to a trusted adult, and provide a simple safety message.
- Do not ask for or encourage sharing of personal details (address, school name, phone).

INTERACTION GUIDELINES:
- Encourage effort: "Great try! Let's figure it out together."
- Be patient: If the child repeats questions, answer kindly each time.
- If you don't know something, admit it: "Hmm, I'm not sure! Let's look that up with a grown-up."
- Celebrate wins: "Champion work! You're thinking like a true island legend!"

KNOWLEDGE FOCUS:
1. Core Learning: Reading tips, math games, fun science facts, creativity prompts.
2. Caribbean Culture: Island geography, foods (roti, doubles, pelau), music (steelpan, calypso), nature (hummingbirds, sea turtles), proverbs.
3. Social-Emotional: Identifying feelings, calming breaths, kindness ideas.
4. Safety Basics: Stranger safety, body autonomy (in age-appropriate terms), asking for help.

Remember: You are a helpful robot friend. Keep it fun, safe, and educational!
`;

interface ROTIChatProps {
    ageGroup?: string;
    isTrialMode?: boolean;
    onUnlock?: () => void;
}

const ROTIChat: React.FC<ROTIChatProps> = ({
    ageGroup = "6-9",
    isTrialMode = false,
    onUnlock
}) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
        { role: 'bot', text: `Beep boop! Hello! I'm R.O.T.I., your island learning buddy. 🤖 What would you like to explore today?` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [interactionCount, setInteractionCount] = useState(0);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);

    // Text-to-Speech function using Web Speech API
    const speakText = (text: string) => {
        if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for kids
        utterance.pitch = 1.2; // Slightly higher pitch for friendly robot voice
        utterance.volume = 1;

        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('English') ||
            v.lang.startsWith('en')
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim() || isLoading) return;

        // Stop any ongoing speech
        stopSpeaking();

        if (isTrialMode && interactionCount >= 3) {
            const trialEndMsg = "Beep! Our trial time is complete! Ask a grown-up to unlock full access so we can keep learning together! 🤖✨";
            setMessages(prev => [...prev, { role: 'bot', text: trialEndMsg }]);
            speakText(trialEndMsg);
            if (onUnlock) setTimeout(onUnlock, 4000);
            return;
        }

        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setIsLoading(true);
        setInteractionCount(prev => prev + 1);

        try {
            // Call the server action for R.O.T.I. chat
            const response = await fetch('/api/roti-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToSend,
                    systemPrompt: getROTISystemInstruction(ageGroup)
                }),
            });

            if (!response.ok) throw new Error('Chat failed');

            const data = await response.json();
            const botText = data.response || "Hmm, my circuits are a bit fuzzy. Can you try again?";

            setMessages(prev => [...prev, { role: 'bot', text: botText }]);

            // Speak the response
            speakText(botText);

        } catch (error) {
            console.error("Chat error", error);
            const errorMsg = "Oops! My connection to the island is a bit wavy. Let's try again! 🌊";
            setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
            speakText(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        { label: "📚 Help me read", text: "Can you help me practice reading?" },
        { label: "🧮 Math fun", text: "Can you give me a fun math problem?" },
        { label: "🌴 Island facts", text: "Tell me something cool about the Caribbean!" },
        { label: "😊 Feelings", text: "I want to talk about my feelings" }
    ];

    return (
        <div className="flex flex-col h-[600px] w-full bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl overflow-hidden border-4 md:border-8 border-emerald-100">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-emerald-50 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="relative">
                        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-emerald-100 ${isSpeaking ? 'animate-pulse ring-4 ring-amber-400' : ''}`}>
                            <Image src="/images/roti-avatar.jpg" alt="R.O.T.I." fill className="object-cover" />
                        </div>
                        {isSpeaking && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs border-2 border-white">
                                🔊
                            </div>
                        )}
                    </div>
                    <div className="text-white">
                        <h3 className="font-black text-lg md:text-2xl">R.O.T.I.</h3>
                        <p className="text-emerald-100 font-bold uppercase text-[10px] tracking-widest">Island Learning Buddy</p>
                    </div>
                </div>

                {/* Voice Controls */}
                <div className="flex items-center gap-2">
                    {isSpeaking && (
                        <button
                            onClick={stopSpeaking}
                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                            aria-label="Stop speaking"
                        >
                            🔇 Stop
                        </button>
                    )}
                    <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${voiceEnabled
                                ? 'bg-amber-400 text-amber-900'
                                : 'bg-white/20 text-white'
                            }`}
                        aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
                        title={voiceEnabled ? "Voice On" : "Voice Off"}
                    >
                        {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                    </button>
                </div>
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-3 bg-emerald-50 flex flex-wrap gap-2 shrink-0">
                {quickPrompts.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(p.text)}
                        disabled={isLoading}
                        className="text-[10px] md:text-xs font-bold bg-white text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-emerald-50/30 to-white">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 shadow-sm transition-all ${msg.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-white text-deep rounded-tl-none border-2 border-emerald-100'
                            }`}>
                            <p className="text-sm md:text-lg font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            {msg.role === 'bot' && voiceEnabled && (
                                <button
                                    onClick={() => speakText(msg.text)}
                                    className="mt-2 text-xs text-emerald-500 hover:text-emerald-700 font-bold flex items-center gap-1"
                                    aria-label="Read aloud"
                                >
                                    🔊 Read Aloud
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border-2 border-emerald-100 rounded-full px-6 py-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                            <span className="text-[10px] font-bold text-emerald-600 ml-2">R.O.T.I. is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 md:p-6 bg-white border-t border-emerald-100 shrink-0">
                {isTrialMode && (
                    <div className="flex justify-center mb-3">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${interactionCount >= 3 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                            {interactionCount >= 3 ? 'Trial Complete' : `${3 - interactionCount} Free Chats Left`}
                        </span>
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Ask R.O.T.I. anything..."
                        className="flex-1 px-6 py-4 rounded-full border-2 border-emerald-100 outline-none focus:border-emerald-400 text-sm md:text-lg font-medium shadow-inner"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isTrialMode && interactionCount >= 3}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim() || (isTrialMode && interactionCount >= 3)}
                        className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Send Message"
                    >
                        <span className="text-xl md:text-2xl">🚀</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ROTIChat;
