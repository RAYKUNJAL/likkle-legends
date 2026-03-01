'use client';

import { useState, useRef, useEffect } from 'react';
import { PersonaPlexClient, PersonaPlexState } from '@/lib/services/personaplex';
import { Mic, MicOff, Volume2, Power, Settings, Globe } from 'lucide-react';

interface Props {
    serverUrl?: string; // Default to local if not provided
}

export default function PersonaPlexVoiceChat({ serverUrl = 'ws://localhost:8998' }: Props) {
    const [state, setState] = useState<PersonaPlexState>({ status: 'disconnected', textLog: [] });
    const clientRef = useRef<PersonaPlexClient | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const [volume, setVolume] = useState(1.0);

    // Initial Setup
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    // Initialize Audio Context & Client
    const connect = async () => {
        try {
            // 1. Setup AudioContext
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = ctx;

            // 2. Load Worklet
            await ctx.audioWorklet.addModule('/moshi-processor.js');

            // 3. Create Worklet Node
            const node = new AudioWorkletNode(ctx, 'moshi-processor');
            node.connect(ctx.destination);
            workletNodeRef.current = node;

            // 4. Initialize Client
            const client = new PersonaPlexClient(
                serverUrl,
                (newState) => {
                    setState(newState);
                },
                (audioChunk) => {
                    // Send audio to worklet
                    if (workletNodeRef.current) {
                        workletNodeRef.current.port.postMessage({
                            frame: audioChunk
                        });
                    }
                }
            );

            clientRef.current = client;
            client.connect();

        } catch (error) {
            console.error('Failed to connect:', error);
            setState(prev => ({ ...prev, status: 'error', error: 'Audio/Connection Error' }));
        }
    };

    const disconnect = () => {
        if (clientRef.current) {
            clientRef.current.disconnect();
            clientRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        workletNodeRef.current = null;
        setState({ status: 'disconnected', textLog: [] });
    };

    const toggleConnection = () => {
        if (state.status === 'connected' || state.status === 'connecting') {
            disconnect();
        } else {
            connect();
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-deep p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center relative">
                        {state.status === 'connected' && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-deep" />
                        )}
                        <Globe className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black">PersonaPlex AI</h2>
                        <p className="text-white/60 text-xs">Real-time Voice Intelligence</p>
                    </div>
                </div>

                <button
                    title="Toggle Connection"
                    aria-label="Toggle Connection"
                    onClick={toggleConnection}
                    className={`p-3 rounded-full transition-all ${state.status === 'connected'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    <Power size={20} className="text-white" />
                </button>
            </div>

            {/* Canvas / Visualizer Area */}
            <div className="h-64 bg-zinc-900 relative flex items-center justify-center overflow-hidden">
                {state.status === 'connected' ? (
                    <div className="relative z-10 text-center">
                        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse mx-auto mb-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,166,0,0.5)]">
                                <Volume2 className="text-white" size={32} />
                            </div>
                        </div>
                        <p className="text-white/50 font-medium">Listening & Speaking...</p>
                    </div>
                ) : (
                    <div className="text-center text-zinc-500">
                        <Power size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Press power to start session</p>
                    </div>
                )}

                {/* Status Overlay */}
                {state.error && (
                    <div className="absolute bottom-4 left-0 right-0 text-center select-none">
                        <span className="bg-red-500/90 text-white px-4 py-1 rounded-full text-xs font-bold">
                            Error: {state.error}
                        </span>
                    </div>
                )}
            </div>

            {/* Transcript Area */}
            <div className="h-64 overflow-y-auto p-6 bg-zinc-50 border-t border-zinc-100 flex flex-col gap-4">
                {state.textLog.length === 0 ? (
                    <p className="text-center text-zinc-400 text-sm py-10">Conversation transcript will appear here...</p>
                ) : (
                    state.textLog.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.sender === 'user'
                                ? 'bg-deep text-white rounded-br-none'
                                : 'bg-white border border-zinc-200 text-deep rounded-bl-none shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-white border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${state.status === 'connected' ? 'bg-green-500' : 'bg-zinc-300'
                        }`} />
                    <span className="text-xs font-bold text-zinc-400 uppercase">
                        {state.status}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Settings className="text-zinc-300 hover:text-deep cursor-pointer transition-colors" size={20} />
                </div>
            </div>
        </div>
    );
}
