"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles, BookOpen, Music, Palette, Target, Star, Play,
    Trophy, Flame, Crown, ChevronRight, Volume2, Lock, Gift, Video, Radio,
    Map as MapIcon, Grid, Wand2, LogOut, Download
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getSongs, getStorybooks, getMissions, getPrintables, getVideos, logActivity } from '@/lib/database';
import { calculateLevel, LEVELS } from '@/lib/gamification';
import { CultureQuests } from '@/components/CultureQuests';
import { IslandMissionMap } from '@/components/IslandMissionMap';
import { PrintablesSection } from '@/components/PrintablesSection';
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
    reward_xp?: number;
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
    reward_xp: number;
    mission_type: string;
}

interface Video {
    id: string;
    title: string;
    thumbnail_url: string;
    video_url?: string;
    duration_seconds: number;
    tier_required: string;
    reward_xp?: number;
}

export default function ChildPortalPage() {
    const router = useRouter();
    const { user, activeChild, canAccess, isSubscribed, isLoading: userLoading } = useUser();
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

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    useEffect(() => {
        if (user) {
            loadPortalData();
        }
    }, [activeChild?.id, user]);

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

    // Show loading while checking auth
    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100">
                <div className="text-center">
                    <div className="text-6xl animate-bounce mb-4">✨</div>
                    <p className="text-2xl font-black text-primary">Loading your adventure...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!user) {
        return null;
    }

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

    const handleMissionComplete = async (xp: number, questId: string) => {
        if (!user || !activeChild) return;

        try {
            await logActivity(
                user.id,
                activeChild.id,
                'mission',
                questId,
                xp,
                0,
                { quest_id: questId }
            );

            // Update local child state to show completion immediately if possible
            // but refreshing data is safer
            loadPortalData();
        } catch (err) {
            console.error("Failed to log mission completion:", err);
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
        { id: 'printables', label: 'Printables', icon: Download, color: 'from-amber-400 to-orange-500' },
        { id: 'radio', label: 'Radio', icon: Radio, color: 'from-blue-600 to-indigo-600' },
    ];

    const portals = [
        { id: 'story-studio', label: 'Story Studio', sub: 'Create Magic', icon: Wand2, color: 'bg-[#FF9D42]', iconColor: 'text-orange-600', shadow: 'shadow-orange-200', href: '/portal/story-studio' },
        { id: 'songs', label: 'Songs', sub: 'Island Rhythms', icon: Music, color: 'bg-[#A855F7]', iconColor: 'text-purple-600', shadow: 'shadow-purple-200' },
        { id: 'printables', label: 'Printables', sub: 'Fun Activities', icon: Download, color: 'bg-[#F59E0B]', iconColor: 'text-amber-600', shadow: 'shadow-amber-200' },
        { id: 'missions', label: 'Adventures', sub: 'Island Quests', icon: MapIcon, color: 'bg-[#14B8A6]', iconColor: 'text-teal-600', shadow: 'shadow-teal-200' },
    ];

    return (
        <div className="min-h-screen bg-[#F0F9FF] font-heading overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />

            <div className="flex h-screen">
                {/* Character Sidebar */}
                <aside className="w-[300px] bg-[#3ABEF9] relative flex flex-col items-center justify-end pb-12 overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-20">
                    <div className="absolute top-12 left-8">
                        <h1 className="text-white text-3xl font-black leading-tight drop-shadow-md">
                            Likkle<br />Legends
                        </h1>
                        <p className="text-[#075985] font-black uppercase tracking-[0.2em] text-[10px] mt-1">Kid Portal</p>
                    </div>

                    {/* Tanty Spice Character */}
                    <div className="relative w-40 h-40 mb-6 group shrink-0">
                        <Image
                            src="/images/tanty_spice_avatar.jpg"
                            alt="Tanty Spice"
                            fill
                            className="object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-700 rounded-full border-4 border-white/20 shadow-2xl"
                        />
                    </div>

                    <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 text-white font-black text-sm shadow-lg mb-8">
                        Bless up, Legend! 👋
                    </div>

                    {/* Navigation Items */}
                    <div className="w-full px-6 space-y-2 mb-12">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Check actitve state differently for games since it's a route
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'games') {
                                            router.push('/portal/games');
                                        } else {
                                            setActiveSection(item.id as any);
                                        }
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all group ${isActive
                                        ? 'bg-white text-[#3ABEF9] shadow-xl scale-105'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-[#3ABEF9]' : 'text-white/50 group-hover:text-white'} />
                                    {item.label}
                                </button>
                            );
                        })}

                        {/* Exit/Logout Button */}
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-white/70 hover:text-white hover:bg-red-500/20 transition-all group mt-8 border border-white/10 hover:border-white/30"
                        >
                            <LogOut size={20} className="text-white/50 group-hover:text-white" />
                            Exit Portal
                        </button>
                    </div>

                    {/* Tropical elements deco */}
                    <div className="absolute bottom-4 left-4 opacity-10 rotate-12 pointer-events-none">🌴</div>
                    <div className="absolute top-1/2 right-4 opacity-10 -rotate-12 pointer-events-none">🌺</div>
                </aside>

                {/* Main Viewport */}
                <main className="flex-1 relative overflow-y-auto pt-16 px-12 pb-24">
                    {/* Top Bar for XP and Settings */}
                    <div className="absolute top-8 right-12 flex items-center gap-6 z-10">
                        {activeChild && (
                            <div className="bg-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 border-2 border-primary/10">
                                <span className="text-2xl animate-float">{currentLevel.icon}</span>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 leading-none">LEVEL {currentLevel.level}</p>
                                    <p className="text-xl font-black text-primary tracking-tight">{activeChild.total_xp.toLocaleString()} XP</p>
                                </div>
                            </div>
                        )}
                        <button className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-400 hover:text-primary hover:rotate-90 transition-all border-2 border-transparent hover:border-primary/20">
                            <Grid size={28} />
                        </button>
                        <button className="w-14 h-14 bg-[#FCD34D] rounded-2xl shadow-xl flex items-center justify-center text-white hover:rotate-45 transition-all">
                            <Flame size={28} fill="currentColor" />
                        </button>
                    </div>

                    {activeSection === 'home' ? (
                        <div className="h-full flex flex-col justify-center max-w-5xl mx-auto space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-5xl md:text-6xl font-black text-[#083344] tracking-tight">
                                    Choose Your <span className="text-[#3ABEF9]">Next Step</span>
                                </h2>
                                <p className="text-xl text-gray-500 font-medium italic underline decoration-[#3ABEF9]/30 underline-offset-8">
                                    Where shall we go today, Little Legend?
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {portals.map((portal) => (
                                    <button
                                        key={portal.id}
                                        onClick={() => {
                                            if (portal.href) {
                                                router.push(portal.href);
                                            } else {
                                                setActiveSection(portal.id as any);
                                            }
                                        }}
                                        className={`group relative h-[400px] rounded-[4rem] ${portal.color} p-1 shadow-2xl ${portal.shadow} hover:-translate-y-4 transition-all duration-500 overflow-hidden`}
                                    >
                                        <div className="h-full bg-white/10 group-hover:bg-transparent rounded-[3.8rem] transition-colors p-8 flex flex-col items-center justify-center gap-6 text-white text-center">
                                            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-transform">
                                                <portal.icon size={64} className={portal.iconColor} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black uppercase tracking-[0.2em] opacity-80">{portal.sub}</p>
                                                <h3 className="text-5xl font-black drop-shadow-sm">{portal.label}</h3>
                                            </div>
                                            <div className="mt-4 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight size={32} />
                                            </div>
                                        </div>

                                        {/* Decorative magic pattern */}
                                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-5">
                            {/* Content of sub-sections (Stories, Songs, etc) */}

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
                                                        <span className="text-indigo-600 font-black uppercase text-xs">Earn +{video.reward_xp || 50} XP</span>
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
                                    <IslandMissionMap
                                        completedIds={activeChild?.cultural_milestones || []}
                                        onComplete={handleMissionComplete}
                                    />
                                </div>
                            )}

                            {(activeSection === 'printables') && (
                                <div className="max-w-6xl mx-auto space-y-10 pb-12">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-16 h-16 bg-amber-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border-2 border-amber-200">🖨️</div>
                                        <div>
                                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Print & Play</h2>
                                            <p className="text-amber-600/60 font-bold uppercase text-xs tracking-widest">Caribbean Activity Sheets</p>
                                        </div>
                                    </div>
                                    <PrintablesSection />
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
