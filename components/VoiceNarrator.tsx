"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RefreshCw, Loader2 } from 'lucide-react';

interface VoiceNarratorProps {
    text: string;
    voice?: 'tanty_spice' | 'steelpan_sam' | 'dilly_doubles';
    autoPlay?: boolean;
    className?: string;
    onStart?: () => void;
    onEnd?: () => void;
}

export default function VoiceNarrator({
    text,
    voice = 'tanty_spice',
    autoPlay = false,
    className = '',
    onStart,
    onEnd
}: VoiceNarratorProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const blobUrlRef = useRef<string | null>(null);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }
        };
    }, []);

    // Generate audio
    const generateAudio = useCallback(async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/voice/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate audio');
            }

            const audioBlob = await response.blob();

            // Revoke previous blob URL
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }

            const blobUrl = URL.createObjectURL(audioBlob);
            blobUrlRef.current = blobUrl;

            // Create and play audio
            const audio = new Audio(blobUrl);
            audioRef.current = audio;

            audio.onplay = () => {
                setIsPlaying(true);
                onStart?.();
            };

            audio.onpause = () => setIsPlaying(false);

            audio.onended = () => {
                setIsPlaying(false);
                setProgress(0);
                onEnd?.();
            };

            audio.ontimeupdate = () => {
                if (audio.duration) {
                    setProgress((audio.currentTime / audio.duration) * 100);
                }
            };

            audio.onerror = () => {
                setError('Audio playback failed');
                setIsPlaying(false);
            };

            audio.muted = isMuted;
            await audio.play();
        } catch (err) {
            console.error('Voice generation error:', err);
            setError('Failed to generate voice');
        } finally {
            setIsLoading(false);
        }
    }, [text, voice, isMuted, onStart, onEnd]);

    const handlePlayPause = () => {
        if (!audioRef.current) {
            generateAudio();
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const handleRestart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            generateAudio();
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
        }
    };

    // Auto-play on mount if enabled
    useEffect(() => {
        if (autoPlay && text) {
            generateAudio();
        }
    }, [autoPlay, text, generateAudio]);

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Play/Pause Button */}
            <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                    } disabled:opacity-50`}
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={24} />
                ) : isPlaying ? (
                    <Pause size={24} />
                ) : (
                    <Play size={24} className="ml-1" />
                )}
            </button>

            {/* Progress Bar */}
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleRestart}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Restart"
                >
                    <RefreshCw size={18} />
                </button>

                <button
                    onClick={toggleMute}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
}

// Simple inline narrator for quick usage
export function InlineNarrator({ text, voice }: { text: string; voice?: VoiceNarratorProps['voice'] }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handlePlay = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/voice/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice: voice || 'tanty_spice' }),
            });

            if (!response.ok) throw new Error('Failed');

            const audioBlob = await response.blob();
            const audio = new Audio(URL.createObjectURL(audioBlob));

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => setIsPlaying(false);

            await audio.play();
        } catch {
            console.error('Playback failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePlay}
            disabled={isLoading || isPlaying}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={12} />
            ) : isPlaying ? (
                <Volume2 size={12} />
            ) : (
                <Play size={12} />
            )}
            <span>Listen</span>
        </button>
    );
}
