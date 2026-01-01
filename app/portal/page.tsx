"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Sparkles, BookOpen, Music, Palette, Target, Star, Play,
    Trophy, Flame, Crown, ChevronRight, Volume2, Lock, Gift
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getSongs, getStorybooks, getMissions, getPrintables } from '@/lib/database';
import { calculateLevel, BADGES, LEVELS } from '@/lib/gamification';

interface Song {
    id: string;
    title: string;
    artist: string;
    thumbnail_url: string;
    tier_required: string;
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

export default function ChildPortalPage() {
    const { activeChild, canAccess, isSubscribed } = useUser();
    const [songs, setSongs] = useState<Song[]>([]);
    const [stories, setStories] = useState<Storybook[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'home' | 'stories' | 'songs' | 'missions' | 'games'>('home');

    useEffect(() => {
        loadPortalData();
    }, []);

    const loadPortalData = async () => {
        setIsLoading(true);
        try {
            const [songsData, storiesData, missionsData] = await Promise.all([
                getSongs(),
                getStorybooks(),
                getMissions(activeChild?.age_track),
            ]);
            setSongs(songsData as Song[]);
            setStories(storiesData as Storybook[]);
            setMissions(missionsData as Mission[]);
        } catch (error) {
            console.error('Failed to load portal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentLevel = activeChild ? calculateLevel(activeChild.total_xp) : LEVELS[0];

    // Kid-friendly navigation items
    const navItems = [
        { id: 'home', label: 'Home', icon: Sparkles, color: 'from-primary to-accent' },
        { id: 'stories', label: 'Stories', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
        { id: 'songs', label: 'Songs', icon: Music, color: 'from-purple-500 to-pink-500' },
        { id: 'missions', label: 'Missions', icon: Target, color: 'from-orange-500 to-red-500' },
        { id: 'games', label: 'Games', icon: Palette, color: 'from-green-500 to-emerald-500' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100">
            {/* Header - Kid Friendly */}
            <header className="bg-white/90 backdrop-blur-sm border-b-4 border-primary/20 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-2xl">
                                ✨
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-primary">Likkle Legends</h1>
                                <p className="text-xs text-gray-500">Your Adventure Portal</p>
                            </div>
                        </div>

                        {/* XP & Level Display */}
                        {activeChild && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
                                    <Flame className="text-orange-500" size={20} />
                                    <span className="font-black text-orange-600">{activeChild.current_streak}</span>
                                </div>

                                <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-full text-white">
                                    <span className="text-2xl">{currentLevel.icon}</span>
                                    <div>
                                        <p className="text-xs opacity-80">Level {currentLevel.level}</p>
                                        <p className="font-black">{activeChild.total_xp.toLocaleString()} XP</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Side Navigation - Big & Colorful */}
                <nav className="w-28 bg-white/50 backdrop-blur min-h-[calc(100vh-80px)] p-4 space-y-4 sticky top-20">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as typeof activeSection)}
                            className={`w-full aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${activeSection === item.id
                                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-105`
                                    : 'bg-white hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <item.icon size={28} />
                            <span className="text-xs font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {/* Welcome Banner */}
                    {activeSection === 'home' && activeChild && (
                        <>
                            <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-[3rem] p-8 text-white mb-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

                                <div className="relative z-10">
                                    <h1 className="text-4xl font-black mb-2">
                                        Welcome back, {activeChild.first_name}! 🌟
                                    </h1>
                                    <p className="text-white/80 text-lg mb-4">
                                        Ready for today's adventure on {activeChild.primary_island}?
                                    </p>

                                    <div className="flex gap-4">
                                        <button className="px-6 py-3 bg-white text-primary rounded-2xl font-bold hover:bg-white/90 transition-colors flex items-center gap-2">
                                            <Play size={20} />
                                            Continue Story
                                        </button>
                                        <button className="px-6 py-3 bg-white/20 text-white rounded-2xl font-bold hover:bg-white/30 transition-colors">
                                            Today's Mission
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats - Kid Friendly */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                                    <div className="text-4xl mb-2">📚</div>
                                    <p className="text-3xl font-black text-gray-900">{activeChild.stories_completed}</p>
                                    <p className="text-gray-500 text-sm">Stories Read</p>
                                </div>
                                <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                                    <div className="text-4xl mb-2">🎵</div>
                                    <p className="text-3xl font-black text-gray-900">{activeChild.songs_listened}</p>
                                    <p className="text-gray-500 text-sm">Songs Heard</p>
                                </div>
                                <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                                    <div className="text-4xl mb-2">🎯</div>
                                    <p className="text-3xl font-black text-gray-900">{activeChild.missions_completed}</p>
                                    <p className="text-gray-500 text-sm">Missions Done</p>
                                </div>
                                <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                                    <div className="text-4xl mb-2">🏆</div>
                                    <p className="text-3xl font-black text-gray-900">{activeChild.earned_badges?.length || 0}</p>
                                    <p className="text-gray-500 text-sm">Badges Won</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Stories Section */}
                    {(activeSection === 'home' || activeSection === 'stories') && (
                        <section className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        📖
                                    </div>
                                    Island Stories
                                </h2>
                                {activeSection === 'home' && (
                                    <button
                                        onClick={() => setActiveSection('stories')}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        See All →
                                    </button>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white rounded-3xl p-4 animate-pulse">
                                            <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-3" />
                                            <div className="h-4 bg-gray-100 rounded mb-2" />
                                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {stories.slice(0, activeSection === 'stories' ? 12 : 4).map((story) => {
                                        const isLocked = !canAccess(story.tier_required);

                                        return (
                                            <Link
                                                key={story.id}
                                                href={isLocked ? '#' : `/portal/stories/${story.id}`}
                                                className={`bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all group ${isLocked ? 'opacity-70' : ''
                                                    }`}
                                            >
                                                <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-3 overflow-hidden">
                                                    {story.cover_image_url ? (
                                                        <img
                                                            src={story.cover_image_url}
                                                            alt={story.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-5xl">
                                                            📚
                                                        </div>
                                                    )}

                                                    {isLocked && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <Lock className="text-white" size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1 truncate">{story.title}</h3>
                                                <p className="text-xs text-gray-500">{story.reading_time_minutes} min read</p>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Songs Section */}
                    {(activeSection === 'home' || activeSection === 'songs') && (
                        <section className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        🎵
                                    </div>
                                    Island Songs
                                </h2>
                                {activeSection === 'home' && (
                                    <button
                                        onClick={() => setActiveSection('songs')}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        See All →
                                    </button>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white rounded-3xl p-4 animate-pulse">
                                            <div className="aspect-square bg-gray-100 rounded-2xl mb-3" />
                                            <div className="h-4 bg-gray-100 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {songs.slice(0, activeSection === 'songs' ? 12 : 4).map((song) => {
                                        const isLocked = !canAccess(song.tier_required);

                                        return (
                                            <div
                                                key={song.id}
                                                className={`bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all group cursor-pointer ${isLocked ? 'opacity-70' : ''
                                                    }`}
                                            >
                                                <div className="relative aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl mb-3 overflow-hidden">
                                                    {song.thumbnail_url ? (
                                                        <img
                                                            src={song.thumbnail_url}
                                                            alt={song.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-5xl">
                                                            🎶
                                                        </div>
                                                    )}

                                                    {isLocked ? (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <Lock className="text-white" size={32} />
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                                <Play className="text-primary ml-1" size={28} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 truncate">{song.title}</h3>
                                                <p className="text-xs text-gray-500">{song.artist}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Missions Section */}
                    {(activeSection === 'home' || activeSection === 'missions') && (
                        <section className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                        🎯
                                    </div>
                                    Today's Missions
                                </h2>
                            </div>

                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
                                            <div className="h-6 bg-gray-100 rounded mb-2 w-1/3" />
                                            <div className="h-4 bg-gray-100 rounded w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            ) : missions.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center">
                                    <div className="text-6xl mb-4">🏖️</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Rest Day!</h3>
                                    <p className="text-gray-500">No missions today. Come back tomorrow!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {missions.map((mission) => (
                                        <div
                                            key={mission.id}
                                            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex items-center gap-6"
                                        >
                                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white text-3xl shrink-0">
                                                🎯
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{mission.title}</h3>
                                                <p className="text-gray-500">{mission.description}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-2xl font-black text-primary">+{mission.xp_reward}</p>
                                                <p className="text-xs text-gray-400">XP</p>
                                            </div>
                                            <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" size={28} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Games Section */}
                    {activeSection === 'games' && (
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    🎮
                                </div>
                                Fun Games
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {[
                                    { name: 'Color Time', emoji: '🎨', color: 'from-pink-400 to-rose-500', desc: 'Color Caribbean scenes' },
                                    { name: 'Word Match', emoji: '🔤', color: 'from-blue-400 to-indigo-500', desc: 'Learn Patois words' },
                                    { name: 'Story Builder', emoji: '✨', color: 'from-purple-400 to-violet-500', desc: 'Create your own story' },
                                    { name: 'Music Quiz', emoji: '🎵', color: 'from-amber-400 to-orange-500', desc: 'Guess the island song' },
                                    { name: 'Memory Game', emoji: '🧠', color: 'from-green-400 to-emerald-500', desc: 'Match the pairs' },
                                    { name: 'Island Explorer', emoji: '🗺️', color: 'from-cyan-400 to-teal-500', desc: 'VR island tour', locked: !canAccess('legends_plus') },
                                ].map((game, i) => (
                                    <div
                                        key={i}
                                        className={`bg-gradient-to-br ${game.color} rounded-3xl p-6 text-white cursor-pointer hover:scale-105 transition-transform relative overflow-hidden ${game.locked ? 'opacity-70' : ''
                                            }`}
                                    >
                                        {game.locked && (
                                            <div className="absolute top-4 right-4">
                                                <Lock size={24} />
                                            </div>
                                        )}
                                        <div className="text-5xl mb-4">{game.emoji}</div>
                                        <h3 className="text-xl font-black mb-1">{game.name}</h3>
                                        <p className="text-white/80 text-sm">{game.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
