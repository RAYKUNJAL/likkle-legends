"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles, BookOpen, Music, Palette, Target, Star, Play,
    Trophy, Flame, Crown, ChevronRight, Volume2, Lock, Gift, Video, Radio,
    Map as MapIcon, Grid, Wand2, LogOut, Download, Menu, X, ShoppingBag, LayoutDashboard, MessageCircle
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
import BadgeUnlockModal from '@/components/gamification/BadgeUnlockModal';
import DialectDial from '@/components/portal/DialectDial';
import { BadgeCheck } from 'lucide-react';
import CoppaConsentModal from '@/components/auth/CoppaConsentModal';
import UpgradeModal from '@/components/UpgradeModal';

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

type PortalSection = 'home' | 'stories' | 'songs' | 'missions' | 'games' | 'lessons' | 'radio' | 'printables';

export default function ChildPortalPage() {
    const router = useRouter();
    const { user, children, activeChild, canAccess, isSubscribed, isLoading: userLoading, triggerBadgeUnlock, unlockedBadge, clearUnlockedBadge, verifyAge } = useUser();
    const [songs, setSongs] = useState<Song[]>([]);
    const [stories, setStories] = useState<Storybook[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStates, setLoadingStates] = useState({
        songs: true,
        stories: true,
        missions: true,
        videos: true
    });
    const [activeSection, setActiveSection] = useState<PortalSection>('home');
    const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Media States
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [activeSong, setActiveSong] = useState<Song | null>(null);
    const [isCoppaModalOpen, setIsCoppaModalOpen] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);
    const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; tier?: string; feature?: string }>({ open: false });

    const loadPortalData = useCallback(async () => {
        // Individual fetchers to avoid Promise.all bottleneck
        const fetchSongs = async () => {
            try {
                const data = await getSongs();
                setSongs(data as Song[]);
            } finally {
                setLoadingStates(prev => ({ ...prev, songs: false }));
            }
        };

        const fetchStories = async () => {
            try {
                const data = await getStorybooks();
                setStories(data as Storybook[]);
            } finally {
                setLoadingStates(prev => ({ ...prev, stories: false }));
            }
        };

        const fetchMissions = async () => {
            try {
                const data = await getMissions(activeChild?.age_track);
                setMissions(data as Mission[]);
            } finally {
                setLoadingStates(prev => ({ ...prev, missions: false }));
            }
        };

        const fetchVideos = async () => {
            try {
                const data = await getVideos();
                setVideos(data as Video[]);
            } finally {
                setLoadingStates(prev => ({ ...prev, videos: false }));
            }
        };

        setIsLoading(true);
        setLoadingStates({ songs: true, stories: true, missions: true, videos: true });

        // Fire all but don't await all together
        Promise.allSettled([
            fetchSongs(),
            fetchStories(),
            fetchMissions(),
            fetchVideos()
        ]).finally(() => {
            setIsLoading(false);
        });
    }, [activeChild?.age_track]);

    // Redirect to login if not authenticated
    // FIXED: Removed auto-redirect to prevent loops with middleware
    // useEffect(() => {
    //     if (!userLoading && !user) {
    //         router.push('/login');
    //     }
    // }, [user, userLoading, router]);

    useEffect(() => {
        if (user) {
            // REDIRECT ADMINS: If they are an admin and have no children, push to admin dashboard
            if (user.is_admin && (!children || children.length === 0)) {
                router.push('/admin');
                return;
            }
            loadPortalData();
        }
    }, [user, children, loadPortalData, router]);

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

    // Don't render content if not authenticated (show error UI instead of redirect loop)
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border-4 border-white">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-pulse">
                        🥥
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Connecting to Island...</h2>
                    <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                        We're having a little trouble syncing your journey. Give it a refresh!
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-[#3ABEF9] text-white px-6 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-200"
                        >
                            Refresh Portal
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-slate-100 text-slate-400 px-6 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 hover:text-slate-600 transition-all"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    const handleActivityLog = async (type: string, id: string, title?: string, xp?: number) => {
        if (!user || !activeChild) return;
        try {
            const result = await logActivity(
                user.id,
                activeChild.id,
                type,
                id,
                xp || 0,
                0,
                { title }
            ) as any;

            if (result?.unlockedBadge) {
                triggerBadgeUnlock(result.unlockedBadge);
            }

            loadPortalData();
        } catch (err) {
            console.error("Failed to log activity:", err);
        }
    };

    const handleMediaComplete = async (type: 'video' | 'song', id: string, xp: number) => {
        if (!user || !activeChild) return;

        try {
            await handleActivityLog(
                type,
                id,
                type === 'video' ? activeVideo?.title : activeSong?.title,
                xp
            );

            // Close player after a bit (the player component usually handles its own close but we clean up state)
            if (type === 'video') setActiveVideo(null);
            else setActiveSong(null);

        } catch (err) {
            console.error("Failed to log activity:", err);
        }
    };

    const handleMissionComplete = async (xp: number, questId: string) => {
        await handleActivityLog('mission', questId, undefined, xp);
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
        { id: 'music-hub', label: 'Market', icon: ShoppingBag, color: 'from-indigo-600 to-purple-700' },
        { id: 'buddy', label: 'My Buddy', icon: MessageCircle, color: 'from-emerald-500 to-teal-500' },
    ];

    return (
        <div className="min-h-screen bg-[#F0F9FF] font-heading overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />

            {/* Mobile Header */}
            <header className="lg:hidden absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between z-30 bg-white/80 backdrop-blur-md border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-black text-primary leading-none">Likkle Legends</h1>
                </div>

                {activeChild && (
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{currentLevel.icon}</span>
                        <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                            <p className="text-[10px] font-black text-primary leading-none uppercase pt-0.5">{activeChild.total_xp.toLocaleString()} XP</p>
                        </div>
                    </div>
                )}
            </header>

            {/* Top Desktop Header - Overlay Style */}
            <header className="fixed top-0 left-0 lg:left-[280px] right-0 z-40 h-24 bg-white/40 backdrop-blur-xl border-b border-white/20 px-8 hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="bg-white/50 px-6 py-2 rounded-2xl border border-white/50 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Channel
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Dialect Dial */}
                    <DialectDial />

                    {/* Teacher VIP Indicator */}
                    {(user?.role === 'teacher' || user?.is_admin) && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2.5 rounded-2xl border border-amber-100 font-black text-xs uppercase tracking-widest animate-pulse">
                            <BadgeCheck size={18} /> Teacher VIP
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-white/80 p-1.5 pr-6 rounded-[1.5rem] border border-white/50 shadow-md">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg">
                            {activeChild?.first_name?.charAt(0) || 'L'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">XP Level</span>
                            <span className="text-sm font-black text-slate-900 leading-none">{activeChild?.total_xp.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-screen overflow-hidden">
                {/* Character Sidebar (Desktop & Mobile Drawer) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-[280px] bg-[#3ABEF9] translate-x-[-100%] transition-transform duration-500 ease-spring lg:relative lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.1)]' : ''}
                    flex flex-col items-center justify-start py-12 overflow-y-auto overflow-x-hidden
                `}>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden absolute top-8 right-6 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-full px-8 mb-12">
                        <h1 className="text-white text-3xl font-black leading-tight drop-shadow-md">
                            Likkle<br />Legends
                        </h1>
                        <p className="text-[#075985] font-black uppercase tracking-[0.2em] text-[10px] mt-1">Kid Portal</p>
                    </div>

                    {/* Tanty Spice Character */}
                    <div className="relative w-32 h-32 mb-6 group shrink-0">
                        <Image
                            src="/images/tanty_spice_avatar.jpg"
                            alt="Tanty Spice"
                            fill
                            className="object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-700 rounded-full border-4 border-white/20 shadow-2xl"
                        />
                    </div>

                    <div className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/30 text-white font-black text-xs shadow-lg mb-8">
                        Bless up, Legend! 👋
                    </div>

                    {/* Navigation Items */}
                    <div className="w-full px-6 space-y-2 mb-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'games') {
                                            router.push('/portal/games');
                                        } else if (item.id === 'music-hub') {
                                            router.push('/portal/music');
                                        } else if (item.id === 'buddy') {
                                            router.push('/portal/buddy');
                                        } else {
                                            setActiveSection(item.id as PortalSection);
                                            setIsSidebarOpen(false); // Close on mobile
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

                        {/* Admin Link */}
                        {(user?.is_admin) && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-all group mt-2 border border-amber-500/20"
                            >
                                <LayoutDashboard size={20} className="text-amber-500" />
                                Admin Island
                            </button>
                        )}

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
                    <div className="absolute top-[40%] right-[-20px] opacity-10 rotate-12 text-6xl pointer-events-none">🌴</div>
                    <div className="absolute bottom-[10%] left-[-20px] opacity-10 -rotate-12 text-6xl pointer-events-none">🌺</div>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Viewport */}
                <main className="flex-1 relative overflow-y-auto pt-24 lg:pt-16 px-6 lg:px-12 pb-32 lg:pb-24">
                    {/* Top Bar for XP and Settings (Desktop only) */}
                    <div className="hidden lg:flex absolute top-8 right-12 items-center gap-6 z-10">
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

                            <div className="w-full h-full min-h-[500px] flex items-center justify-center">
                                <IslandVillageMap
                                    onNavigate={(section) => {
                                        if (section === 'story-studio') {
                                            // Restricted feature - check COPPA
                                            if (user?.age_verified_at || activeChild?.age_verified) {
                                                router.push('/portal/story-studio');
                                            } else {
                                                setPendingRoute('/portal/story-studio');
                                                setIsCoppaModalOpen(true);
                                            }
                                        } else {
                                            setActiveSection(section as PortalSection);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-5">
                            {/* Content of sub-sections (Stories, Songs, etc) */}

                            {/* Stories Section */}
                            {(activeSection === 'stories') && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4 sm:gap-5">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-2xl sm:text-4xl shadow-inner italic">📖</div>
                                            <div>
                                                <h2 className="text-2xl sm:text-4xl font-black text-blue-900 tracking-tight">Island Stories</h2>
                                                <p className="text-blue-700/60 font-bold uppercase text-[10px] sm:text-xs tracking-widest">Tales from across the Caribbean</p>
                                            </div>
                                        </div>
                                    </div>

                                    {loadingStates.stories ? (
                                        <GridSkeleton count={4} type="card" />
                                    ) : stories.length === 0 ? (
                                        <div className="col-span-full">
                                            <EmptyState
                                                icon="📖"
                                                title="The Library is Growing"
                                                message="Tanty is still writing our first legends. Check back soon for stories from across the islands!"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                                            {stories.map((story) => {
                                                const isLocked = !canAccess(story.tier_required);
                                                return (
                                                    <Link
                                                        key={story.id}
                                                        href={isLocked ? '#' : `/portal/stories/${story.id}`}
                                                        onClick={isLocked ? (e) => { e.preventDefault(); setUpgradeModal({ open: true, tier: story.tier_required, feature: story.title }); } : undefined}
                                                        className={`bg-white rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-5 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all group border-2 sm:border-4 border-transparent hover:border-blue-100 relative ${isLocked ? 'cursor-pointer opacity-80' : ''}`}
                                                    >
                                                        <div className="relative aspect-[3/4] bg-blue-50 rounded-[1.5rem] sm:rounded-[2.5rem] mb-4 sm:mx-0 overflow-hidden">
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
                                    )}
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

                                    {loadingStates.videos ? (
                                        <GridSkeleton count={3} type="card" />
                                    ) : videos.length === 0 ? (
                                        <div className="col-span-full">
                                            <EmptyState
                                                icon="🎥"
                                                title="Cinema is Coming Soon"
                                                message="Our village videographers are out capturing the most beautiful island lessons. Check back later!"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                            {videos.map((video) => {
                                                const isLocked = !canAccess(video.tier_required);
                                                return (
                                                    <button
                                                        key={video.id}
                                                        onClick={() => isLocked ? setUpgradeModal({ open: true, tier: video.tier_required, feature: video.title }) : setActiveVideo(video)}
                                                        className={`bg-white rounded-[3.5rem] p-6 shadow-xl hover:shadow-2xl transition-all group border-4 border-transparent hover:border-indigo-100 text-left ${isLocked ? 'opacity-80 cursor-pointer' : ''}`}
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
                                    )}
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
                                        <button
                                            onClick={() => router.push('/portal/music')}
                                            className="ml-auto px-6 py-3 bg-pink-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                        >
                                            <ShoppingBag size={18} /> Get New Songs
                                        </button>
                                    </div>

                                    {loadingStates.songs ? (
                                        <GridSkeleton count={4} type="circle" />
                                    ) : songs.length === 0 ? (
                                        <div className="col-span-full">
                                            <EmptyState
                                                icon="🎵"
                                                title="Tuning the Drums"
                                                message="The steel pans are being tuned! We'll have island beats ready for you very soon."
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                                            {songs.map((song) => {
                                                const isLocked = !canAccess(song.tier_required);
                                                return (
                                                    <button
                                                        key={song.id}
                                                        onClick={() => isLocked ? setUpgradeModal({ open: true, tier: song.tier_required, feature: song.title }) : setActiveSong(song)}
                                                        className={`bg-white rounded-[2rem] sm:rounded-[3.5rem] p-4 sm:p-6 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all group border-2 sm:border-4 border-transparent hover:border-pink-100 text-left ${isLocked ? 'opacity-80 cursor-pointer' : ''}`}
                                                    >
                                                        <div className="relative aspect-square bg-pink-50 rounded-full mb-4 sm:mb-6 overflow-hidden shadow-xl ring-2 sm:ring-4 ring-white group-hover:ring-pink-100 transition-all">
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
                                    )}
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
            {/* Badge Unlock Celebration */}
            <BadgeUnlockModal
                badge={unlockedBadge}
                onClose={() => clearUnlockedBadge()}
            />

            <CoppaConsentModal
                isOpen={isCoppaModalOpen}
                onClose={() => setIsCoppaModalOpen(false)}
                onSuccess={async () => {
                    const success = await verifyAge();
                    if (success) {
                        setIsCoppaModalOpen(false);
                        if (pendingRoute) {
                            router.push(pendingRoute);
                            setPendingRoute(null);
                        }
                    }
                }}
            />

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={upgradeModal.open}
                onClose={() => setUpgradeModal({ open: false })}
                requiredTier={upgradeModal.tier}
                featureName={upgradeModal.feature}
            />
        </div>
    );
}

// Skeleton component for grid items
function GridSkeleton({ count = 4, type = 'card' }: { count?: number, type?: 'card' | 'circle' }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-6 shadow-md animate-pulse border-2 border-transparent">
                    {type === 'card' ? (
                        <div className="aspect-[3/4] bg-gray-100 rounded-[1.5rem] sm:rounded-[2.5rem] mb-4"></div>
                    ) : (
                        <div className="aspect-square bg-gray-100 rounded-full mb-4 sm:mb-6"></div>
                    )}
                    <div className="h-6 bg-gray-100 rounded-full w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-50 rounded-full w-1/2 mx-auto"></div>
                </div>
            ))}
        </div>
    );
}
