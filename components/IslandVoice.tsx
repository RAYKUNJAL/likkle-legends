"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { CharacterConfig, CharacterChild } from "@/lib/characterConfig";

// --- Audio Utilities ---

function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function createBlob(data: Float32Array): string {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return arrayBufferToBase64(int16.buffer);
}

// --- Component ---

interface IslandVoiceProps {
    onClose: () => void;
    characterConfig: CharacterConfig;
    child: CharacterChild;
}

const IslandVoice: React.FC<IslandVoiceProps> = ({ onClose, characterConfig, child }) => {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextInRef = useRef<AudioContext | null>(null);
    const audioContextOutRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isModelRespondingRef = useRef<boolean>(false);

    const { persona, visual, technical } = characterConfig;

    const stopSession = () => {
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
        if (audioContextInRef.current) { audioContextInRef.current.close().catch(() => {}); audioContextInRef.current = null; }
        if (audioContextOutRef.current) { audioContextOutRef.current.close().catch(() => {}); audioContextOutRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
        sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
        sourcesRef.current.clear();
        isModelRespondingRef.current = false;
        setIsActive(false);
        setIsConnecting(false);
        setStatus('idle');
    };

    const startSession = async () => {
        if (isConnecting) return;

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            alert(`${persona.name} can't connect right now — API key is missing.`);
            return;
        }

        try {
            setIsConnecting(true);

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inCtx = new AudioContextClass({ sampleRate: 16000 });
            const outCtx = new AudioContextClass({ sampleRate: 24000 });
            audioContextInRef.current = inCtx;
            audioContextOutRef.current = outCtx;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const model = technical.brainModel;
            const uri = `wss://generativelanguage.googleapis.com/v1alpha/models/${model}:connect?key=${apiKey}`;
            const ws = new WebSocket(uri);
            wsRef.current = ws;

            ws.onopen = () => {
                const setupMsg = {
                    setup: {
                        model: `models/${model}`,
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: technical.geminiVoiceName
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            parts: [{ text: characterConfig.getSystemInstruction(child) }]
                        }
                    }
                };
                ws.send(JSON.stringify(setupMsg));

                setIsActive(true);
                setIsConnecting(false);
                setStatus('listening');

                const source = inCtx.createMediaStreamSource(stream);
                const processor = inCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;

                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            realtime_input: {
                                media_chunks: [{
                                    mime_type: "audio/pcm",
                                    data: createBlob(inputData)
                                }]
                            }
                        }));
                    }
                };

                source.connect(processor);
                processor.connect(inCtx.destination);
            };

            ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);
                if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                    // Prevent multiple simultaneous responses
                    if (isModelRespondingRef.current) return;
                    isModelRespondingRef.current = true;

                    const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
                    setStatus('speaking');
                    try {
                        const audioBytes = base64ToUint8Array(audioData);
                        const audioBuffer = await outCtx.decodeAudioData(audioBytes.buffer as ArrayBuffer);
                        const bufSource = outCtx.createBufferSource();
                        bufSource.buffer = audioBuffer;
                        bufSource.connect(outCtx.destination);
                        const now = outCtx.currentTime;
                        const startTime = Math.max(now, nextStartTimeRef.current);
                        bufSource.start(startTime);
                        nextStartTimeRef.current = startTime + audioBuffer.duration;
                        sourcesRef.current.add(bufSource);
                        bufSource.onended = () => {
                            sourcesRef.current.delete(bufSource);
                            isModelRespondingRef.current = false;
                            if (sourcesRef.current.size === 0) setStatus('listening');
                        };
                    } catch (e) {
                        console.error("Audio decode error", e);
                        isModelRespondingRef.current = false;
                    }
                }
            };

            ws.onclose = () => stopSession();

        } catch (err) {
            console.error("Voice session error:", err);
            setIsConnecting(false);
        }
    };

    useEffect(() => () => stopSession(), []);

    // No API key fallback
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !isActive) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                    <X size={32} />
                </button>
                <div className="flex flex-col items-center justify-center w-full max-w-lg p-8 space-y-6 bg-white rounded-[3rem] shadow-2xl text-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-gray-200 grayscale opacity-60 relative mx-auto">
                        <img src={persona.avatarUrl} className="w-full h-full object-cover" alt={persona.name} />
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">😴</div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-500">{persona.name} is having a nap...</h3>
                    <p className="text-gray-400 font-bold text-sm">(API key missing — voice mode unavailable)</p>
                    <button onClick={onClose} className="bg-gray-400 text-white px-10 py-4 rounded-2xl font-black text-lg w-full">Okay, Bye!</button>
                </div>
            </div>
        );
    }

    // Colour-specific glow based on character
    const glowClass = status === 'speaking'
        ? `scale-150 opacity-50`
        : status === 'listening'
        ? `scale-110 opacity-30 animate-pulse`
        : `scale-100 opacity-10`;

    const borderClass = status === 'speaking'
        ? 'border-orange-500 scale-105 shadow-2xl'
        : status === 'listening'
        ? 'border-green-500 scale-105'
        : 'border-white/30 shadow-xl';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                <X size={32} />
            </button>

            <div className={`flex flex-col items-center justify-center w-full max-w-lg p-8 space-y-8 bg-white rounded-[3rem] shadow-2xl border-8 ${isActive ? 'border-green-400' : 'border-white/20'} relative overflow-hidden transition-colors duration-500`}>
                {/* Gradient top bar in character colour */}
                <div className={`absolute top-0 left-0 w-full h-3 bg-gradient-to-r ${visual.gradient}`} />

                {/* Avatar with animated glow */}
                <div className="relative mt-4">
                    <div className={`absolute -inset-8 rounded-full opacity-20 blur-3xl transition-all duration-700 ${glowClass}`}
                        style={{ backgroundColor: visual.primaryColor }} />

                    <div className={`w-56 h-56 rounded-full overflow-hidden border-8 transition-all duration-500 relative z-10 ${borderClass}`}>
                        <img src={persona.avatarUrl} className="w-full h-full object-cover" alt={persona.name} />

                        {status === 'listening' && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                <div className="text-6xl animate-bounce drop-shadow-lg">👂</div>
                            </div>
                        )}
                        {status === 'speaking' && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '75ms' }} />
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status text */}
                <div className="text-center space-y-2 relative z-10">
                    <h3 className="text-3xl font-black text-slate-900 leading-tight">
                        {status === 'idle'
                            ? `${persona.name} is Ready!`
                            : status === 'listening'
                            ? "I'm Listening..."
                            : `${persona.name} is Talking...`}
                    </h3>
                    <p className="text-slate-500 font-bold text-lg">
                        {status === 'idle' ? `Say a big HELLO to ${persona.name}!` : "Go ahead, Legend!"}
                    </p>
                </div>

                {/* Action button */}
                {!isActive ? (
                    <button
                        onClick={startSession}
                        disabled={isConnecting}
                        className={`w-full py-5 rounded-[2rem] font-black text-2xl text-white shadow-lg transition-all bg-gradient-to-r ${visual.gradient} disabled:opacity-50 hover:scale-[1.02] active:scale-95 relative z-10 flex items-center justify-center gap-3`}
                    >
                        {isConnecting
                            ? <span className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            : <><span>📞</span> Say Hello to {persona.name}!</>
                        }
                    </button>
                ) : (
                    <button
                        onClick={stopSession}
                        className="w-full py-5 rounded-[2rem] font-black text-2xl text-white bg-red-500 shadow-lg hover:bg-red-600 active:scale-95 transition-all relative z-10"
                    >
                        Bye Bye {persona.name} 👋
                    </button>
                )}
            </div>
        </div>
    );
};

export default IslandVoice;
