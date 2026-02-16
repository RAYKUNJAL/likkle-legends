
"use client";

import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { X } from "lucide-react";

import { TANTY_ISLAND_ENGINE, getTantySystemInstruction } from "@/services/tantyConfig";
import { useUser } from "./UserContext";

// --- Utility Functions for Audio ---

function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


// Helper to create PCM blob for Gemini Input
function createBlob(data: Float32Array): string {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // scale float32 to int16
        let s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return arrayBufferToBase64(int16.buffer);
}

const TANTY_AVATAR = "/images/tanty_spice_avatar.jpg";

const IslandVoice: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { activeChild } = useUser();
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
    const [volume, setVolume] = useState(0); // For visualizing mic input

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextInRef = useRef<AudioContext | null>(null);
    const audioContextOutRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopSession = () => {
        // Close WebSocket if exists (assuming custom implementation)
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (audioContextInRef.current) {
            audioContextInRef.current.close().catch(() => { });
            audioContextInRef.current = null;
        }
        if (audioContextOutRef.current) {
            audioContextOutRef.current.close().catch(() => { });
            audioContextOutRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        sourcesRef.current.forEach(s => {
            try { s.stop(); } catch (e) { }
        });
        sourcesRef.current.clear();

        setIsActive(false);
        setIsConnecting(false);
        setStatus('idle');
    };

    const startSession = async () => {
        if (isConnecting) return;

        // Check API Key - Robust detection
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
            process.env.GEMINI_API_KEY ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
            console.error("Voice Service Error: Missing API Key");
            alert("Tanty is a bit shy right now! (Missing API Key). Please check your settings.");
            setIsConnecting(false);
            return;
        }

        try {
            setIsConnecting(true);

            // --- Audio Setup ---
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inCtx = new AudioContextClass({ sampleRate: 16000 });
            const outCtx = new AudioContextClass({ sampleRate: 24000 });

            audioContextInRef.current = inCtx;
            audioContextOutRef.current = outCtx;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const model = "gemini-2.0-flash-exp"; // Using known working model for live
            const uri = `wss://generativelanguage.googleapis.com/v1alpha/models/${model}:connect?key=${apiKey}`;

            const ws = new WebSocket(uri);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("Connected to Gemini Live");

                // Send Initial Setup Message
                const setupMsg = {
                    setup: {
                        model: `models/${model}`,
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: TANTY_ISLAND_ENGINE.vocal_blueprint.gemini_voice_name
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            parts: [{
                                text: getTantySystemInstruction(activeChild?.age_track || "6-8")
                            }]
                        }
                    }
                };
                ws.send(JSON.stringify(setupMsg));

                setIsActive(true);
                setIsConnecting(false);
                setStatus('listening');

                // Start Audio Recorder
                const source = inCtx.createMediaStreamSource(stream);
                const processor = inCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;

                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);

                    // Visualizer
                    let sum = 0;
                    for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                    setVolume(Math.sqrt(sum / inputData.length));

                    // Send to WS
                    const b64 = createBlob(inputData);

                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            realtime_input: {
                                media_chunks: [{
                                    mime_type: "audio/pcm",
                                    data: b64
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
                    const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
                    setStatus('speaking');

                    // Decode and play
                    try {
                        const audioBytes = base64ToUint8Array(audioData);
                        const audioBuffer = await outCtx.decodeAudioData(audioBytes.buffer as ArrayBuffer);

                        const source = outCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outCtx.destination);

                        const now = outCtx.currentTime;
                        const startTime = Math.max(now, nextStartTimeRef.current);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + audioBuffer.duration;

                        sourcesRef.current.add(source);
                        source.onended = () => {
                            sourcesRef.current.delete(source);
                            if (sourcesRef.current.size === 0) {
                                setStatus('listening');
                            }
                        };
                    } catch (e) {
                        console.error("Error decoding audio", e);
                    }
                }
            };

            ws.onclose = () => {
                console.log("Gemini Live Disconnected");
                stopSession();
            };

        } catch (err) {
            console.error("Failed to start voice session:", err);
            setIsConnecting(false);
            alert("Could not connect to Voice Service. Please check API Key.");
        }
    };

    useEffect(() => {
        return () => stopSession();
    }, []);

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !isActive) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                    title="Close"
                    aria-label="Close"
                >
                    <X size={32} />
                </button>

                <div className="flex flex-col items-center justify-center w-full max-w-lg p-8 space-y-8 bg-white rounded-[3rem] shadow-2xl border-4 border-yellow-100 relative overflow-hidden">
                    <div className="relative mt-4">
                        <div className="w-56 h-56 rounded-full overflow-hidden border-8 border-gray-200 relative z-10 grayscale opacity-80">
                            <img src={TANTY_AVATAR} className="w-full h-full object-cover" alt="Tanty Spice" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-6xl">😴</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-3 relative z-10">
                        <h3 className="text-3xl font-heading font-black text-gray-500 leading-tight">
                            Shhh... Tanty is Nap Time.
                        </h3>
                        <p className="text-gray-400 font-bold max-w-[280px] mx-auto text-base">
                            (Tech Note: API Key is missing. Tanty can't wake up without it!)
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-gray-400 text-white px-12 py-6 rounded-[2.5rem] font-heading font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all w-full"
                    >
                        Okay, Bye Bye
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                title="Close"
                aria-label="Close"
            >
                <X size={32} />
            </button>

            <div className={`flex flex-col items-center justify-center w-full max-w-lg p-8 space-y-8 bg-white rounded-[3rem] shadow-2xl border-8 ${isActive ? 'border-green-400' : 'border-yellow-200'} relative overflow-hidden transition-colors duration-500`}>
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>

                <div className="relative mt-4">
                    <div className={`absolute -inset-8 rounded-full bg-yellow-400 opacity-20 blur-3xl transition-all duration-700 ${status === 'speaking' ? 'scale-150 opacity-50' : status === 'listening' ? 'scale-110 opacity-30 animate-pulse' : 'scale-100 opacity-10'}`}></div>

                    <div className={`w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-8 transition-all duration-500 relative z-10 ${status === 'speaking' ? 'border-orange-500 scale-105 shadow-2xl' : status === 'listening' ? 'border-green-500 scale-105' : 'border-yellow-200 shadow-xl'}`}>
                        <img src={TANTY_AVATAR} className="w-full h-full object-cover" alt="Tanty Spice" />

                        {status === 'listening' && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                <div className="text-6xl animate-bounce drop-shadow-lg">👂</div>
                            </div>
                        )}
                        {status === 'speaking' && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-75"></div>
                                    <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center space-y-3 relative z-10">
                    <h3 className="text-4xl font-heading font-black text-blue-950 leading-tight">
                        {status === 'idle' ? 'Tanty is Waiting!' : status === 'listening' ? 'I\'m Listening...' : 'Tanty is Talking...'}
                    </h3>
                    <p className="text-blue-900/60 font-bold max-w-[280px] mx-auto text-xl leading-relaxed">
                        {status === 'idle' ? 'Say a big HELLO!' : 'Go ahead, me darlin!'}
                    </p>
                </div>

                {!isActive ? (
                    <button
                        onClick={startSession}
                        disabled={isConnecting}
                        className="bg-green-500 text-white w-full py-6 rounded-[2.5rem] font-heading font-black text-3xl shadow-[0_8px_0_rgb(21,128,61)] hover:shadow-[0_4px_0_rgb(21,128,61)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale relative z-10"
                    >
                        {isConnecting ? (
                            <span className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <><span>📞</span> Say Hello!</>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={stopSession}
                        className="bg-red-500 text-white w-full py-6 rounded-[2.5rem] font-heading font-black text-3xl shadow-[0_8px_0_rgb(185,28,28)] hover:shadow-[0_4px_0_rgb(185,28,28)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all border-none relative z-10"
                    >
                        Bye Bye Tanty 👋
                    </button>
                )}
            </div>
        </div>
    );
};

export default IslandVoice;
