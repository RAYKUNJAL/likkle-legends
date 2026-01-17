"use client";

import React, { useState, useEffect, useRef } from 'react';
import { generateBirthdaySong, getGlobalAudioContext } from '../services/geminiService';
import { ConfettiCanvas } from './SharedUI';
import { TANTY_AVATAR } from '../lib/constants';
import { LazyImage } from './LazyImage';

interface BirthdaySurpriseProps {
    childName: string;
    isPaid: boolean;
    onClose: () => void;
}

const THEMED_LOADING_MESSAGES = [
    "Tanty is frosting the coconut cake...",
    "Dilly is hanging the hibiscus garlands...",
    "Sam is tuning his magic steelpan...",
    "Beny is gathering the fireflies...",
    "Almost ready, me darlin'!",
    "The island spirits are singing your name..."
];

const BirthdaySurprise: React.FC<BirthdaySurpriseProps> = ({ childName, isPaid, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
    const [isPlayingSong, setIsPlayingSong] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const songBufferRef = useRef<AudioBuffer | null>(null);

    useEffect(() => {
        let msgInterval: any;
        if (isLoading) {
            msgInterval = setInterval(() => {
                setLoadingMsgIdx(prev => (prev + 1) % THEMED_LOADING_MESSAGES.length);
            }, 4000);
        }
        return () => clearInterval(msgInterval);
    }, [isLoading]);

    const stopSong = () => {
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch (e) { }
            audioSourceRef.current = null;
        }
        setIsPlayingSong(false);
    };

    const playSong = async (bufferOverride?: AudioBuffer) => {
        if (isPlayingSong) return;

        const ctx = getGlobalAudioContext();
        if (ctx.state === 'suspended') {
            try { await ctx.resume(); } catch (e) { console.warn("Auto-play prevented", e); }
        }

        setIsPlayingSong(true);
        try {
            let buffer = bufferOverride || songBufferRef.current;

            if (!buffer) {
                buffer = await generateBirthdaySong(childName, "Tanty Spice");
                songBufferRef.current = buffer;
            }

            if (!buffer) {
                setIsPlayingSong(false);
                return;
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = () => setIsPlayingSong(false);
            audioSourceRef.current = source;
            source.start();
        } catch (e) {
            console.error("Song playback failed", e);
            setIsPlayingSong(false);
        }
    };

    const initiateGeneration = async () => {
        setIsLoading(true);
        setError(null);

        if (isPaid) {
            try {
                const songBuffer = await generateBirthdaySong(childName, "Tanty Spice");

                if (songBuffer) {
                    songBufferRef.current = songBuffer;
                    playSong(songBuffer);
                } else {
                    setError("Tanty's vocal spirits are shy today. Let's try again!");
                }
            } catch (err: any) {
                console.error("Birthday Song Generation Error:", err);
                setError("The island connection is wavy. Let's try again.");
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        initiateGeneration();
        return () => stopSong();
    }, [childName, isPaid]);

    return (
        <div className="fixed inset-0 z-[300] bg-blue-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <ConfettiCanvas />

            <div className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row border-[12px] border-yellow-400">
                <button onClick={onClose} className="absolute top-8 right-8 w-14 h-14 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-blue-950 hover:bg-white shadow-lg z-50 text-xl border-2 border-yellow-100">✕</button>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 w-full md:w-1/2 p-12 flex flex-col items-center justify-center text-white relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 text-center space-y-8">
                        <LazyImage
                            src={TANTY_AVATAR}
                            alt="Tanty"
                            containerClassName="w-48 h-48 rounded-full border-8 border-white shadow-2xl mx-auto animate-vocal-bounce ring-8 ring-white/20"
                        />
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-heading font-black leading-[1.1] drop-shadow-xl animate-float">
                                Happy Birthday, <br /><span className="text-yellow-300">{childName}!</span>
                            </h2>
                            <p className="text-2xl font-bold opacity-90 leading-relaxed italic max-w-sm mx-auto">
                                "Me darlin', you're growin' tall like a coconut tree! Tanty is so proud of you today."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-16 w-full md:w-1/2 flex flex-col justify-center items-center gap-10 bg-white relative">
                    {isLoading ? (
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-8 border-orange-100 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-heading font-black text-blue-950">Preparing Magic...</h3>
                                <p className="text-blue-900/60 font-bold text-xl italic animate-pulse">
                                    "{THEMED_LOADING_MESSAGES[loadingMsgIdx]}"
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center space-y-8 animate-in fade-in duration-500">
                            <div className="text-8xl">🥥</div>
                            <p className="text-blue-900/60 font-bold text-lg">{error}</p>
                            <button onClick={initiateGeneration} className="text-blue-600 font-black uppercase tracking-widest text-sm hover:underline">Try Again</button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <div className="text-center space-y-10 max-w-sm animate-in fade-in duration-700">
                                <div className="text-9xl animate-float">🎂</div>
                                <h3 className="text-4xl font-heading font-black text-blue-950">It's Party Time!</h3>

                                {isPaid ? (
                                    <button
                                        onClick={() => isPlayingSong ? stopSong() : playSong()}
                                        className={`w-full py-6 rounded-[2.5rem] font-heading font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isPlayingSong ? 'bg-red-500 text-white border-b-8 border-red-700' : 'bg-blue-600 text-white border-b-8 border-blue-800'
                                            }`}
                                    >
                                        {isPlayingSong ? <>⏹️ Stop Singing</> : <>🎵 Play Custom Song</>}
                                    </button>
                                ) : (
                                    <div className="bg-blue-50 p-8 rounded-[3rem] border-4 border-white shadow-xl rotate-2">
                                        <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Legend Perk</p>
                                        <p className="text-sm font-bold text-blue-900/70 leading-relaxed">Upgrade to an Island Explorer to unlock personalized birthday songs from Tanty!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <button onClick={onClose} className="w-full py-4 text-blue-300 font-black uppercase tracking-[0.3em] text-[10px] hover:text-blue-500 transition-colors">Return to Village</button>
                </div>
            </div>
        </div>
    );
};

export default BirthdaySurprise;
