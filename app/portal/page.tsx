"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Sparkles, BookOpen, Music, Palette, Target, Star, Play,
    Trophy, Flame, Crown, ChevronRight, Volume2, Lock, Gift, Video, Radio,
    Map as MapIcon, Grid
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getSongs, getStorybooks, getMissions, getPrintables, getVideos, logActivity } from '@/lib/database';
import { calculateLevel, LEVELS } from '@/lib/gamification';
import { CultureQuests } from '@/components/CultureQuests';
import { EmptyState } from '@/components/EmptyState';
import TantyRadio from '@/components/TantyRadio';
import IslandVillageMap from '@/components/IslandVillageMap';
import PremiumVideoPlayer from '@/components/PremiumVideoPlayer';
import PremiumMusicPlayer from '@/components/PremiumMusicPlayer';

interface Song {
    id: string;
    title: string;
    artist: string;
    thumbnail_url: string;
    audio_url?: string;
    tier_required: string;
    xp_reward?: number;
}

interface Storybook {
    id: string;
    title: string;
    summary: string;
    cover_image_url: string;
    tier_required: string;
    reading_time_minutes: number;
}

interface Mission {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    mission_type: string;
}

interface Video {
    id: string;
    title: string;
    thumbnail_url: string;
    video_url?: string;
    duration_seconds: number;
    tier_required: string;
    xp_reward?: number;
}

export default function ChildPortalPage() {
    const { user, activeChild, canAccess, isSubscribed } = useUser();
    const [songs, setSongs] = useState<Song[]>([]);
    const [stories, setStories] = useState<Storybook[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'home' | 'stories' | 'songs' | 'missions' | 'games' | 'lessons' | 'radio'>('home');
    const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

    // Media States
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [activeSong, setActiveSong] = useState<Song | null>(null);

    useEffect(() => {
        loadPortalData();
    }, [activeChild?.id]);

    const loadPortalData = async () => {
        setIsLoading(true);
        try {
            const [songsData, storiesData, missionsData, videosData] = await Promise.all([
                getSongs(),
                getStorybooks(),
                getMissions(activeChild?.age_track),
                getVideos(),
            ]);
            setSongs(songsData as Song[]);
            setStories(storiesData as Storybook[]);
            setMissions(missionsData as Mission[]);
            setVideos(videosData as Video[]);
        } catch (error) {
            console.error('Failed to load portal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMediaComplete = async (type: 'video' | 'song', id: string, xp: number) => {
        if (!user || !activeChild) return;

        try {
            await logActivity(
                user.id,
                activeChild.id,
                type,
                id,
                xp,
                0,
                { title: type === 'video' ? activeVideo?.title : activeSong?.title }
            );

            // Close player after a bit (the player component usually handles its own close but we clean up state)
            if (type === 'video') setActiveVideo(null);
            else setActiveSong(null);

            // Refresh portal data to show new XP
            loadPortalData();
        } catch (err) {
            console.error("Failed to log activity:", err);
        }
    };

    const currentLevel = activeChild ? calculateLevel(activeChild.total_xp) : LEVELS[0];

    const navItems = [
        { id: 'home', label: 'Village', icon: MapIcon, color: 'from-primary to-accent' },
        { id: 'stories', label: 'Stories', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
        { id: 'lessons', label: 'Lessons', icon: Video, color: 'from-indigo-500 to-purple-500' },
        { id: 'songs', label: 'Songs', icon: Music, color: 'from-purple-500 to-pink-500' },
        { id: 'missions', label: 'Missions', icon: Target, color: 'from-orange-500 to-red-500' },
        { id: 'games', label: 'Games', icon: Palette, color: 'from-green-500 to-emerald-500' },
        { id: 'radio', label: 'Radio', icon: Radio, color: 'from-blue-600 to-indigo-600' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 pb-20">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-sm border-b-4 border-primary/20 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg hover:scale-105 transition-transform">
                                ✨
                            </Link>
                            <div>
                                <h1 className="text-xl font-black text-primary">Likkle Legends</h1>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Adventure Portal</p>
                            </div>
                        </div>

                        {activeChild && (
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full border-2 border-orange-200">
                                    <Flame className="text-orange-500" size={20} />
                                    <span className="font-black text-orange-600">{activeChild.current_streak} Day Streak!</span>
                                </div>

                                <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-accent px-5 py-2 rounded-full text-white shadow-lg border-2 border-white/20">
                                    <span className="text-2xl animate-bounce-slow">{currentLevel.icon}</span>
                                    <div>
                                        <p className="text-[10px] uppercase font-black opacity-80 leading-none mb-1">Level {currentLevel.level}</p>
                                        <p className="font-black tracking-tight">{activeChild.total_xp.toLocaleString()} XP</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Side Navigation */}
                <nav className="w-28 bg-white/40 backdrop-blur-md min-h-[calc(100vh-80px)] p-4 space-y-4 sticky top-20 border-r border-white/50">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id as typeof activeSection);
                                if (item.id === 'home') setViewMode('map');
                                else setViewMode('grid');
                            }}
                            className={`w-full aspect-square rounded-3xl flex flex-col items-center justify-center gap-1 transition-all ${activeSection === item.id
                                ? `bg-gradient-to-br ${item.color} text-white shadow-xl scale-110 rotate-3 z-10`
                                : 'bg-white/80 hover:bg-white text-gray-600 shadow-sm hover:scale-105'
                                }`}
                        >
                            <item.icon size={28} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-hidden">
                    {activeSection === 'home' && activeChild && (
                        <div className="space-y-12">
                            {/* Interactive Village Map */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-3xl">🏠</div>
                                        <div>
                                            <h2 className="text-4xl font-black text-blue-900 tracking-tight">Village Map</h2>
                                            <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">Tap a building to explore!</p>
                                        </div>
                                    </div>

                                    <div className="flex bg-white/50 backdrop-blur p-1 rounded-2xl border-2 border-white shadow-sm">
                                        <button
                                            onClick={() => setViewMode('map')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-md' : 'text-gray-500'}`}
                                        >
                                            <MapIcon size={16} /> MAP
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-gray-500'}`}
                                        >
                                            <Grid size={16} /> GRID
                                        </button>
                                    </div>
                                </div>

                                {viewMode === 'map' ? (
                                    <IslandVillageMap onNavigate={(section) => setActiveSection(section as any)} />
                                ) : (
                                    <div className="grid grid-cols-4 gap-6">
                                        {/* Classic Quick Stats Grid */}
                                        <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-xl border-4 border-blue-50 hover:scale-105 transition-transform">
                                            <div className="text-5xl mb-4">📚</div>
                                            <p className="text-4xl font-black text-blue-900">{activeChild.stories_completed}</p>
                                            <p className="text-blue-500 font-bold uppercase text-xs tracking-widest">Stories Read</p>
                                        </div>
                                        {/* ... other stats ... */}
                                    </div>
                                )}
                            </div>

                            {/* Today's Special Mission */}
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-orange-200">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner animate-float">🎯</div>
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-orange-100 font-black uppercase tracking-widest text-sm mb-2">Daily Challenge</p>
                                        <h3 className="text-5xl font-black mb-4">The Patois Pirate Quest</h3>
                                        <p className="text-xl text-orange-50 font-medium max-w-xl">Learn 5 new Jamaican words and unlock the Golden Cutlass badge!</p>
                                    </div>
                                    <button className="px-12 py-6 bg-white text-orange-600 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                                        START!
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stories Section */}
                    {(activeSection === 'stories') && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-blue-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">📖</div>
                                    <div>
                                        <h2 className="text-4xl font-black text-blue-900 tracking-tight">Island Stories</h2>
                                        <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">Tales from across the Caribbean</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {stories.map((story) => {
                                    const isLocked = !canAccess(story.tier_required);
                                    return (
                                        <Link
                                            key={story.id}
                                            href={isLocked ? '#' : `/portal/stories/${story.id}`}
                                            className={`bg-white rounded-[3rem] p-5 shadow-xl hover:shadow-2xl transition-all group border-4 border-transparent hover:border-blue-100 relative ${isLocked ? 'grayscale opacity-80' : ''}`}
                                        >
                                            <div className="relative aspect-[3/4] bg-blue-50 rounded-[2.5rem] mb-6 overflow-hidden">
                                                {story.cover_image_url ? (
                                                    <Image
                                                        src={story.cover_image_url}
                                                        alt={story.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">📚</div>
                                                )}
                                                {isLocked && (
                                                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-2xl">
                                                            <Lock size={40} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-black text-blue-900 mb-2 truncate px-2">{story.title}</h3>
                                            <div className="flex items-center justify-between px-2">
                                                <span className="text-xs font-black text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">{story.reading_time_minutes} MINS</span>
                                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:bg-accent transition-colors">
                                                    <Play size={16} fill="white" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Lessons Section */}
                    {(activeSection === 'lessons') && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">🎥</div>
                                <div>
                                    <h2 className="text-4xl font-black text-blue-900 tracking-tight">Village Cinema</h2>
                                    <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">Learn traditions through film</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {videos.map((video) => {
                                    const isLocked = !canAccess(video.tier_required);
                                    return (
                                        <button
                                            key={video.id}
                                            onClick={() => !isLocked && setActiveVideo(video)}
                                            className={`bg-white rounded-[3.5rem] p-6 shadow-xl hover:shadow-2xl transition-all group border-4 border-transparent hover:border-indigo-100 text-left ${isLocked ? 'grayscale opacity-80 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="relative aspect-video bg-indigo-50 rounded-[2.5rem] mb-6 overflow-hidden shadow-inner">
                                                {video.thumbnail_url ? (
                                                    <Image
                                                        src={video.thumbnail_url}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-7xl opacity-10">🎥</div>
                                                )}

                                                {!isLocked && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                                                            <Play className="text-indigo-600 ml-1" size={40} fill="currentColor" />
                                                        </div>
                                                    </div>
                                                )}

                                                {isLocked && (
                                                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[2px] flex items-center justify-center">
                                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-900 shadow-2xl">
                                                            <Lock size={32} />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest">
                                                    {Math.round(video.duration_seconds / 60)}:00
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-blue-900 mb-2 truncate px-2">{video.title}</h3>
                                            <div className="flex items-center gap-3 px-2">
                                                <Sparkles className="text-yellow-500" size={18} />
                                                <span className="text-indigo-600 font-black uppercase text-xs">Earn +{video.xp_reward || 50} XP</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Songs Section */}
                    {(activeSection === 'songs') && (
                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-pink-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">🎵</div>
                                <div>
                                    <h2 className="text-4xl font-black text-blue-900 tracking-tight">Music Studio</h2>
                                    <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">rhythms of the caribbean</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {songs.map((song) => {
                                    const isLocked = !canAccess(song.tier_required);
                                    return (
                                        <button
                                            key={song.id}
                                            onClick={() => !isLocked && setActiveSong(song)}
                                            className={`bg-white rounded-[3.5rem] p-6 shadow-xl hover:shadow-2xl transition-all group border-4 border-transparent hover:border-pink-100 text-left ${isLocked ? 'grayscale opacity-80 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="relative aspect-square bg-pink-50 rounded-full mb-6 overflow-hidden shadow-2xl ring-4 ring-white group-hover:ring-pink-100 transition-all">
                                                {song.thumbnail_url ? (
                                                    <Image
                                                        src={song.thumbnail_url}
                                                        alt={song.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">🎵</div>
                                                )}

                                                {!isLocked && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all">
                                                            <Play className="text-pink-600 ml-1" size={32} fill="currentColor" />
                                                        </div>
                                                    </div>
                                                )}

                                                {isLocked && (
                                                    <div className="absolute inset-0 bg-pink-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-pink-900 shadow-2xl">
                                                            <Lock size={24} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center px-2">
                                                <h3 className="text-xl font-black text-blue-900 mb-1 truncate">{song.title}</h3>
                                                <p className="text-sm text-pink-500 font-bold uppercase tracking-widest">{song.artist}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Missions & Radio Sections (Simplified for now to match high-premium look) */}
                    {(activeSection === 'missions') && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-16 h-16 bg-orange-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">🎯</div>
                                <div>
                                    <h2 className="text-4xl font-black text-blue-900 tracking-tight">Mission Hub</h2>
                                    <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">Complete quests, earn badges</p>
                                </div>
                            </div>
                            <CultureQuests completedIds={activeChild?.cultural_milestones || []} />
                        </div>
                    )}

                    {(activeSection === 'radio') && (
                        <div className="max-w-4xl mx-auto space-y-12">
                            <div className="flex items-center gap-5 text-center justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl animate-pulse">📻</div>
                                <div className="text-left">
                                    <h2 className="text-5xl font-black text-blue-900 tracking-tighter">Heritage Radio</h2>
                                    <p className="text-orange-600 font-black uppercase tracking-[0.3em] text-[10px]">Live from Likkle Legends Island</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-[5rem] p-1 shadow-2xl border-8 border-orange-50 overflow-hidden">
                                <TantyRadio />
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Premium Media Players */}
            {activeVideo && (
                <PremiumVideoPlayer
                    video={activeVideo}
                    onClose={() => setActiveVideo(null)}
                    onComplete={(xp) => handleMediaComplete('video', activeVideo.id, xp)}
                />
            )}

            {activeSong && (
                <PremiumMusicPlayer
                    song={activeSong}
                    onClose={() => setActiveSong(null)}
                    onComplete={(xp) => handleMediaComplete('song', activeSong.id, xp)}
                />
            )}
        </div>
    );
}
