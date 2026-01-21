"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Heart, Shuffle, Repeat, ListMusic, Music2, Clock, Star, Lock, Loader2, Radio
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { supabase } from '@/lib/storage';
import { EmptyState } from '@/components/EmptyState';

interface Song {
    id: string;
    title: string;
    artist: string;
    album?: string;
    duration_seconds: number;
    audio_url: string;
    cover_image_url: string;
    island_origin: string;
    tier_required: string;
    play_count: number;
    lyrics?: string;
    is_favorite?: boolean;
}

function SongsPageContent() {
    const { activeChild, canAccess } = useUser();
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    const searchParams = useSearchParams();
    const playId = searchParams.get('play');

    useEffect(() => {
        async function loadSongs() {
            try {
                const { getSongs } = await import('@/lib/database');
                const data = await getSongs();

                // Map DB result to Song interface
                const mappedSongs: Song[] = data.map((s: any) => ({
                    id: s.id,
                    title: s.title,
                    artist: s.artist || 'Likkle Legends',
                    album: s.album || 'Island Beats',
                    duration_seconds: s.duration_seconds || 180,
                    audio_url: s.audio_url || '',
                    cover_image_url: s.cover_image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
                    island_origin: s.island_origin || 'Caribbean',
                    tier_required: s.tier_required || 'free',
                    play_count: 0
                }));

                setSongs(mappedSongs);
            } catch (error) {
                console.error('Failed to load songs:', error);
            }
        }

        loadSongs();
    }, []);

    // Auto-play from URL
    useEffect(() => {
        if (songs.length > 0 && playId) {
            const songToPlay = songs.find(s => s.id === playId);
            if (songToPlay) {
                playSong(songToPlay);
            }
        }
    }, [songs, playId]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'islands'>('all');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const playSong = (song: Song) => {
        if (!canAccess(song.tier_required)) return;

        setCurrentSong(song);
        setIsPlaying(true);
        setProgress(0);

        // Simulate playback progress
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + (100 / song.duration_seconds);
            });
        }, 1000);
    };

    const togglePlay = () => {
        if (!currentSong) return;
        setIsPlaying(!isPlaying);

        if (isPlaying && progressInterval.current) {
            clearInterval(progressInterval.current);
        } else if (currentSong) {
            progressInterval.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        handleNext();
                        return 0;
                    }
                    return prev + (100 / currentSong.duration_seconds);
                });
            }, 1000);
        }
    };

    const handleNext = () => {
        const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
        const nextIndex = shuffle
            ? Math.floor(Math.random() * songs.length)
            : (currentIndex + 1) % songs.length;
        playSong(songs[nextIndex]);
    };

    const handlePrev = () => {
        const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
        const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
        playSong(songs[prevIndex]);
    };

    const toggleFavorite = (songId: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(songId)) {
                newFavorites.delete(songId);
            } else {
                newFavorites.add(songId);
            }
            return newFavorites;
        });
    };

    const filteredSongs = activeTab === 'favorites'
        ? songs.filter(s => favorites.has(s.id))
        : songs;

    const groupedByIsland = songs.reduce((acc, song) => {
        if (!acc[song.island_origin]) acc[song.island_origin] = [];
        acc[song.island_origin].push(song);
        return acc;
    }, {} as Record<string, Song[]>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/portal" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-gray-900">Island Songs</h1>
                            <p className="text-xs text-gray-400">{songs.length} songs • Caribbean melodies</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {['all', 'favorites', 'islands'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as typeof activeTab)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${activeTab === tab
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Tanty Radio Teaser */}
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <Radio size={24} className="animate-pulse" />
                            <span className="font-black uppercase tracking-widest text-xs opacity-80">Live Now</span>
                        </div>
                        <h2 className="text-3xl font-black mb-2">Tanty's Island Radio</h2>
                        <p className="text-white/80 max-w-md">Listen to non-stop Calypso, Reggae, and Folklore. Tanty's currently spinning "Steelpan Serenade"!</p>
                    </div>
                    <Link
                        href="/portal/radio"
                        className="relative z-10 px-8 py-4 bg-white text-orange-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg text-center"
                    >
                        Tune In Live
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8 pb-40">
                {activeTab === 'islands' ? (
                    <div className="space-y-8">
                        {Object.entries(groupedByIsland).map(([island, islandSongs]) => (
                            <div key={island}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    🏝️ {island}
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {islandSongs.map((song) => (
                                        <SongCard
                                            key={song.id}
                                            song={song}
                                            isPlaying={currentSong?.id === song.id && isPlaying}
                                            isFavorite={favorites.has(song.id)}
                                            canPlay={canAccess(song.tier_required)}
                                            onPlay={() => playSong(song)}
                                            onFavorite={() => toggleFavorite(song.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSongs.map((song) => (
                            <SongCard
                                key={song.id}
                                song={song}
                                isPlaying={currentSong?.id === song.id && isPlaying}
                                isFavorite={favorites.has(song.id)}
                                canPlay={canAccess(song.tier_required)}
                                onPlay={() => playSong(song)}
                                onFavorite={() => toggleFavorite(song.id)}
                            />
                        ))}
                    </div>
                )}

                {filteredSongs.length === 0 && (
                    <EmptyState
                        icon="🎵"
                        title="No Songs Found"
                        message="Your favorite melodies are playing hide and seek. Try 'All Songs' to see the full collection!"
                        actionLabel="View All Songs"
                        onAction={() => setActiveTab('all')}
                    />
                )}
            </main>

            {/* Player Bar */}
            {currentSong && (
                <div className="fixed bottom-0 left-0 right-0 bg-deep text-white shadow-2xl z-50">
                    {/* Progress Bar */}
                    <div className="h-1 bg-white/20">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-6">
                            {/* Song Info */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="relative w-14 h-14 shrink-0">
                                    <Image
                                        src={currentSong.cover_image_url}
                                        alt={currentSong.title}
                                        fill
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold truncate">{currentSong.title}</p>
                                    <p className="text-sm text-white/60 truncate">{currentSong.artist}</p>
                                </div>
                                <button
                                    onClick={() => toggleFavorite(currentSong.id)}
                                    className="p-2 hover:bg-white/10 rounded-full"
                                >
                                    <Heart
                                        size={20}
                                        className={favorites.has(currentSong.id) ? 'fill-red-500 text-red-500' : ''}
                                    />
                                </button>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShuffle(!shuffle)}
                                    className={`p-2 rounded-full ${shuffle ? 'text-primary' : 'text-white/60 hover:text-white'}`}
                                >
                                    <Shuffle size={18} />
                                </button>

                                <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full">
                                    <SkipBack size={24} />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-12 h-12 bg-white text-deep rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                                </button>

                                <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full">
                                    <SkipForward size={24} />
                                </button>

                                <button
                                    onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
                                    className={`p-2 rounded-full ${repeat !== 'off' ? 'text-primary' : 'text-white/60 hover:text-white'}`}
                                >
                                    <Repeat size={18} />
                                    {repeat === 'one' && <span className="absolute text-[8px]">1</span>}
                                </button>
                            </div>

                            {/* Time & Volume */}
                            <div className="flex items-center gap-4 flex-1 justify-end">
                                <span className="text-sm text-white/60">
                                    {formatTime((progress / 100) * currentSong.duration_seconds)} / {formatTime(currentSong.duration_seconds)}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="p-2 hover:bg-white/10 rounded-full"
                                    >
                                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                                        className="w-24 accent-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SongCard({
    song,
    isPlaying,
    isFavorite,
    canPlay,
    onPlay,
    onFavorite
}: {
    song: Song;
    isPlaying: boolean;
    isFavorite: boolean;
    canPlay: boolean;
    onPlay: () => void;
    onFavorite: () => void;
}) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group ${isPlaying ? 'ring-2 ring-purple-500' : ''
            }`}>
            <div className="relative mb-3">
                <div className="relative w-full aspect-square">
                    <Image
                        src={song.cover_image_url}
                        alt={song.title}
                        fill
                        className="rounded-xl object-cover"
                    />
                </div>

                {!canPlay && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <div className="text-center text-white">
                            <Lock size={24} className="mx-auto mb-2" />
                            <p className="text-xs">Upgrade to unlock</p>
                        </div>
                    </div>
                )}

                {canPlay && (
                    <button
                        onClick={onPlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 rounded-xl transition-colors"
                    >
                        <div className={`w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-all ${isPlaying ? 'scale-100' : 'scale-0 group-hover:scale-100'
                            }`}>
                            {isPlaying ? (
                                <Pause className="text-purple-600" size={28} />
                            ) : (
                                <Play className="text-purple-600 ml-1" size={28} />
                            )}
                        </div>
                    </button>
                )}

                {isPlaying && (
                    <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-white rounded-full animate-pulse"
                                    style={{
                                        height: `${Math.random() * 16 + 8}px`,
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 truncate">{song.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock size={12} /> {formatTime(song.duration_seconds)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Play size={12} /> {song.play_count.toLocaleString()}
                        </span>
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <Heart
                        size={18}
                        className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    />
                </button>
            </div>
        </div>
    );
}

export default function SongsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-purple-50">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        }>
            <SongsPageContent />
        </Suspense>
    );
}
