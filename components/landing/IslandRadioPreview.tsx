'use client';

import Link from 'next/link';
import { Radio, Shield, Volume2, Car, Play, Pause, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { RADIO_TRACKS } from '@/lib/constants';

export default function IslandRadioPreview({ content }: { content: any }) {
    const { island_radio } = content;
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    if (!island_radio) return null;

    const iconMap: Record<string, any> = {
        shield: Shield,
        volume: Volume2,
        car: Car
    };

    // Use a sample track (Coconut Bay or similar)
    const sampleTrack = RADIO_TRACKS[0]?.url || 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3';

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsLoading(true);
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Playback failed", err);
                    setIsLoading(false);
                });
        }
    };

    return (
        <section className="py-20 bg-deep text-white relative overflow-hidden">
            <audio
                ref={audioRef}
                src={sampleTrack}
                loop
                onEnded={() => setIsPlaying(false)}
            />

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.png')]" />
            </div>

            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] opacity-20 -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-[150px] opacity-20 -ml-48 -mb-48" />

            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                                <Radio className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                                    {island_radio.tagline}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black leading-tight">
                                {island_radio.title}
                            </h2>

                            <p className="text-xl text-white/70 leading-relaxed">
                                {island_radio.subtitle}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {(island_radio.benefits || []).map((benefit: any) => {
                                    const Icon = iconMap[benefit.icon] || Shield;
                                    return (
                                        <div
                                            key={benefit.label}
                                            className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10"
                                        >
                                            <Icon className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="font-bold text-sm">{benefit.label}</p>
                                                <p className="text-xs text-white/50">{benefit.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Link
                                href={island_radio.cta.href}
                                className="inline-flex items-center gap-2 btn bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all"
                            >
                                {island_radio.cta.label}
                            </Link>
                        </div>

                        {/* Visual */}
                        <div className="relative">
                            <div className="aspect-square max-w-xs mx-auto">
                                <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-amber-500/30 rounded-full blur-[60px] transition-all duration-1000 ${isPlaying ? 'scale-110 opacity-100' : 'scale-100 opacity-50'}`} />
                                <button onClick={togglePlay} className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden group cursor-pointer w-full h-full" aria-label={isPlaying ? 'Pause radio' : 'Play radio'}>

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                                            {isLoading ? <Loader2 className="animate-spin" /> : isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                                        </div>
                                    </div>

                                    <div className="text-center relative z-10">
                                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                                            <Radio className="w-10 h-10 text-white" />
                                            {isPlaying && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{island_radio.title}</h3>
                                        <p className="text-white/60 text-sm mb-6">{isPlaying ? 'Now Playing: Sample Track' : 'Click to Listen'}</p>

                                        {/* Audio bars - Only animate when playing */}
                                        <div className="flex items-end justify-center gap-1 h-16">
                                            {[3, 5, 8, 6, 9, 4, 7, 5, 8, 6, 4, 7].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 bg-white/40 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                                                    style={{
                                                        height: `${h * 6}px`,
                                                        animationDelay: `${i * 0.1}s`,
                                                        opacity: isPlaying ? 0.8 : 0.3
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
