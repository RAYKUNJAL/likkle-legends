"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft, Play, Clock, Star, Lock, Video, CheckCircle
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import VideoPlayer from '@/components/VideoPlayer';
import { EmptyState } from '@/components/EmptyState';

interface Video {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration_seconds: number;
    tier_required: string;
    is_active: boolean;
}

export default function LessonsPage() {
    const { activeChild, canAccess } = useUser();
    const [videos, setVideos] = useState<Video[]>([]);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadVideos() {
            try {
                // Dynamic import to avoid server-side issues if any
                const { getVideos } = await import('@/lib/database');
                // Cast to any because the definition might assume generic DB return type
                const data: any[] = await getVideos();

                const mappedVideos: Video[] = data.map((v) => ({
                    id: v.id,
                    title: v.title,
                    description: v.description || '',
                    video_url: v.video_url,
                    thumbnail_url: v.thumbnail_url || 'https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d',
                    duration_seconds: v.duration_seconds || 0,
                    tier_required: v.tier_required || 'free',
                    is_active: v.is_active
                }));

                setVideos(mappedVideos);

                // If there's a featured video or just the first one, we could auto-select?
                // But let's leave it for user to click.
            } catch (error) {
                console.error('Failed to load videos:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadVideos();
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/portal" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-gray-900">Video Lessons</h1>
                            <p className="text-xs text-gray-400">Learn with Likkle Legends</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Active Video Player */}
                {activeVideo && (
                    <div className="mb-12 animate-fade-in">
                        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-4xl aspect-video relative">
                            <VideoPlayer
                                src={activeVideo.video_url}
                                autoPlay={true}
                                onEnded={() => {
                                    // Mark as complete in DB here if needed
                                }}
                            />
                        </div>
                        <div className="max-w-4xl mx-auto mt-6">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">{activeVideo.title}</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">{activeVideo.description}</p>
                            <div className="flex items-center gap-4 mt-4">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold flex items-center gap-2">
                                    <Clock size={16} /> {formatTime(activeVideo.duration_seconds)}
                                </span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold flex items-center gap-2">
                                    <Star size={16} /> +50 XP
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Grid */}
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Video className="text-primary" /> Library
                </h2>

                {isLoading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-2xl mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => {
                            const isLocked = !canAccess(video.tier_required);
                            const isActive = activeVideo?.id === video.id;

                            return (
                                <button
                                    key={video.id}
                                    onClick={() => !isLocked && setActiveVideo(video)}
                                    className={`group text-left bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all border-2 ${isActive ? 'border-primary ring-4 ring-primary/10' : 'border-transparent'
                                        } ${isLocked ? 'opacity-70 grayscale' : ''}`}
                                >
                                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                        {video.thumbnail_url && (
                                            <Image
                                                src={video.thumbnail_url}
                                                alt={video.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}

                                        {isLocked ? (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Lock className="text-white" size={32} />
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                                <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-all ${isActive ? 'scale-100' : 'scale-90 group-hover:scale-100'}`}>
                                                    <Play className="text-primary ml-1" size={24} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className={`font-bold text-lg mb-1 leading-tight ${isActive ? 'text-primary' : 'text-gray-900 '}`}>{video.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> {formatTime(video.duration_seconds)}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!isLoading && videos.length === 0 && (
                    <EmptyState
                        icon="🎥"
                        title="No Lessons Found"
                        message="Our island teachers are preparing new video lessons. Stay tuned for fresh content!"
                    />
                )}
            </main>
        </div>
    );
}
