"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Send, Volume2, X } from "lucide-react";
import { CharacterConfig, CharacterChild } from "@/lib/characterConfig";

declare global {
    interface Window {
        webkitSpeechRecognition?: new () => SpeechRecognition;
        SpeechRecognition?: new () => SpeechRecognition;
    }
    interface SpeechRecognitionAlternative {
        transcript: string;
    }
    interface SpeechRecognitionResult {
        0: SpeechRecognitionAlternative;
        isFinal: boolean;
        length: number;
    }
    interface SpeechRecognitionResultList {
        0: SpeechRecognitionResult;
        length: number;
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

interface IslandVoiceProps {
    onClose: () => void;
    characterConfig: CharacterConfig;
    child: CharacterChild;
    childId: string;
}

async function getSessionToken() {
    const { supabase } = await import("@/lib/storage");
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

const IslandVoice: React.FC<IslandVoiceProps> = ({ onClose, characterConfig, child, childId }) => {
    const [speechSupported, setSpeechSupported] = useState(false);
    const [draft, setDraft] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState("");
    const [lastReply, setLastReply] = useState(
        characterConfig.persona.welcomeMessage(child.first_name, child.current_streak || 0)
    );
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const SpeechRecognitionAPI =
            typeof window !== "undefined"
                ? window.SpeechRecognition || window.webkitSpeechRecognition
                : null;
        setSpeechSupported(Boolean(SpeechRecognitionAPI));
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, []);

    async function speakReply(text: string) {
        const token = await getSessionToken();
        const response = await fetch("/api/voice/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                text,
                voice: characterConfig.id
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || "Voice generation failed");
        }

        const blob = await response.blob();
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        audioRef.current.src = url;
        setIsSpeaking(true);

        await new Promise<void>((resolve, reject) => {
            if (!audioRef.current) {
                reject(new Error("Audio player unavailable"));
                return;
            }

            audioRef.current.onended = () => {
                setIsSpeaking(false);
                resolve();
            };
            audioRef.current.onerror = () => {
                setIsSpeaking(false);
                reject(new Error("Audio playback failed"));
            };

            audioRef.current.play().catch((playError) => {
                setIsSpeaking(false);
                reject(playError);
            });
        });
    }

    async function sendMessage(rawText: string) {
        const text = rawText.trim();
        if (!text || isThinking) return;

        setDraft("");
        setError(null);
        setLastUserMessage(text);
        setIsThinking(true);

        try {
            const token = await getSessionToken();
            const response = await fetch("/api/character-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    characterId: characterConfig.id,
                    childId,
                    message: text
                })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.error || "Buddy request failed");
            }

            const reply = String(data?.response || "").trim();
            if (!reply) {
                throw new Error("Buddy returned an empty reply");
            }

            setLastReply(reply);
            await speakReply(reply);
        } catch (err: any) {
            setError(err?.message || "Voice chat failed");
        } finally {
            setIsThinking(false);
        }
    }

    function stopListening() {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }

    function startListening() {
        const SpeechRecognitionAPI =
            typeof window !== "undefined"
                ? window.SpeechRecognition || window.webkitSpeechRecognition
                : null;

        if (!SpeechRecognitionAPI) {
            setError("Speech recognition is not available in this browser.");
            return;
        }

        setError(null);

        if (audioRef.current) {
            audioRef.current.pause();
            setIsSpeaking(false);
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setIsListening(false);
            setError(event.error === "not-allowed" ? "Microphone permission was blocked." : "Could not understand that.");
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
            if (!transcript) {
                setError("I did not hear anything clearly.");
                return;
            }
            setDraft(transcript);
            void sendMessage(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }

    const { persona, visual } = characterConfig;
    const busy = isThinking || isSpeaking;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <button
                title="Close"
                aria-label="Close"
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
                <X size={32} />
            </button>

            <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-white/20">
                <div className={`bg-gradient-to-r ${visual.gradient} p-6 text-white`}>
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-3xl border-4 border-white/30">
                            <img src={persona.avatarUrl} alt={persona.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Voice Buddy</p>
                            <h2 className="text-3xl font-black leading-none">{persona.name}</h2>
                            <p className="mt-2 text-sm font-semibold text-white/80">{persona.tagline}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">You Said</p>
                        <p className="mt-2 min-h-[24px] text-sm font-bold text-slate-700">
                            {lastUserMessage || "Tap the mic and ask a question."}
                        </p>
                    </div>

                    <div className={`rounded-3xl border p-4 ${characterConfig.visual.chatBubbleBot}`}>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Buddy Reply</p>
                        <p className="mt-2 min-h-[80px] text-sm font-medium leading-relaxed">{lastReply}</p>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            disabled={isThinking}
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all ${
                                isListening ? "bg-rose-500" : `bg-gradient-to-r ${visual.gradient}`
                            } disabled:opacity-50`}
                            title={isListening ? "Stop listening" : "Start listening"}
                            aria-label={isListening ? "Stop listening" : "Start listening"}
                        >
                            {isListening ? <Loader2 size={22} className="animate-spin" /> : <Mic size={22} />}
                        </button>

                        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Status</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {isListening
                                    ? "Listening..."
                                    : isThinking
                                        ? "Thinking..."
                                        : isSpeaking
                                            ? "Talking..."
                                            : "Ready"}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void sendMessage(draft);
                        }}
                        className="flex items-end gap-2"
                    >
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value.slice(0, 320))}
                            rows={2}
                            placeholder={`Type a message for ${persona.name}...`}
                            className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            disabled={busy}
                        />
                        <button
                            type="submit"
                            disabled={!draft.trim() || busy}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${visual.gradient} text-white shadow-md disabled:opacity-40`}
                            title="Send message"
                            aria-label="Send message"
                        >
                            {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </form>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Volume2 size={14} />
                        {speechSupported
                            ? "Mic input and spoken replies are enabled on supported browsers."
                            : "Browser voice input is unavailable here, but typed messages still speak back."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IslandVoice;
