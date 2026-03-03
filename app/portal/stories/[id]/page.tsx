"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Star, Loader2 } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { supabase } from '@/lib/storage';
import { logActivity } from '@/lib/database';
import PremiumStoryReader from '@/components/PremiumStoryReader';
import { STARTER_STORIES } from '@/lib/story-starter-pack';

interface StoryPage {
    pageNumber: number;
    text: string;
    imageUrl?: string;
    glossaryWords?: string[];
    question?: string;
}

interface Story {
    id: string;
    title: string;
    summary: string;
    cover_image_url: string;
    content_json: {
        pages: StoryPage[];
        glossary: { word: string; meaning: string }[];
    };
    audio_narration_url?: string;
    character_id?: string;
    tier_required: string;
    reading_time_minutes: number;
}

export default function StoryReaderPage() {
    const params = useParams();
    const router = useRouter();
    const { user, activeChild, canAccess } = useUser();
    const storyId = params.id as string;

    const [story, setStory] = useState<Story | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [readingStartTime] = useState(Date.now());

    const loadStory = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('storybooks')
                .select('*')
                .eq('id', storyId)
                .single();

            if (error) throw error;
            if (!data?.content_json || !data.content_json.pages?.length) {
                const fallback = STARTER_STORIES.find(s => s.id === storyId) || STARTER_STORIES[0];
                setStory(fallback as unknown as Story);
                return;
            }
            setStory(data as Story);
        } catch (error) {
            console.error('Failed to load story:', error);
            const fallback = STARTER_STORIES.find(s => s.id === storyId) || STARTER_STORIES[0];
            if (fallback) {
                setStory(fallback as unknown as Story);
            }
        } finally {
            setIsLoading(false);
        }
    }, [storyId]);

    useEffect(() => {
        loadStory();
    }, [loadStory]);

    const handleStoryComplete = useCallback(async (xpEarned: number) => {
        if (!user || !activeChild || !story) return;

        // Calculate reading time
        const readingTime = Math.round((Date.now() - readingStartTime) / 1000);

        try {
            // Log activity and award XP
            await logActivity(
                user.id,
                activeChild.id,
                'story',
                storyId,
                xpEarned,
                readingTime,
                { title: story.title, type: 'storybook' }
            );

            setIsCompleted(true);
            router.push('/portal?completed=story&xp=' + xpEarned);
        } catch (error) {
            console.error("Failed to save completion:", error);
            router.push('/portal');
        }
    }, [user, activeChild, story, readingStartTime, storyId, router]);

    const handleClose = useCallback(() => {
        router.push('/portal');
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sky-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-primary mb-4 mx-auto animate-spin" />
                    <p className="text-white/60 font-black uppercase tracking-widest text-sm">Opening Book...</p>
                </div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen bg-sky-950 flex items-center justify-center p-8">
                <div className="text-center bg-white rounded-[3rem] p-12 shadow-2xl">
                    <BookOpen size={64} className="text-red-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-blue-900 mb-2">Book Not Found</h2>
                    <p className="text-blue-700/60 mb-8 font-bold">This storybook seems to have sailed away!</p>
                    <Link href="/portal" className="px-8 py-4 bg-primary text-white rounded-2xl font-black inline-block">
                        Return to Portal
                    </Link>
                </div>
            </div>
        );
    }

    // Check access
    if (!canAccess(story.tier_required)) {
        return (
            <div className="min-h-screen bg-sky-950 flex items-center justify-center p-8">
                <div className="text-center bg-white rounded-[3rem] p-12 shadow-2xl max-w-md">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star size={40} className="text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-black text-blue-900 mb-2">Legends Plus Only</h2>
                    <p className="text-blue-700/60 mb-8 font-bold">This adventure is for our special Legends Plus explorers!</p>
                    <Link href="/checkout?plan=legends_plus" className="w-full py-4 bg-primary text-white rounded-2xl font-black inline-block mb-4">
                        Upgrade Now
                    </Link>
                    <Link href="/portal" className="block text-blue-400 font-bold hover:text-blue-600">
                        Back to Library
                    </Link>
                </div>
            </div>
        );
    }

    if (!story || !story.content_json) {
        return (
            <div className="min-h-screen bg-sky-950 flex items-center justify-center p-8">
                <div className="text-center bg-white rounded-[3rem] p-12 shadow-2xl max-w-md">
                    <BookOpen size={64} className="text-amber-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-blue-900 mb-2">Book is Empty</h2>
                    <p className="text-blue-700/60 mb-8 font-bold">This storybook has no pages yet. Tanty is still writing it!</p>
                    <Link href="/portal" className="px-8 py-4 bg-primary text-white rounded-2xl font-black inline-block">
                        Return to Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <PremiumStoryReader
            story={story}
            onClose={handleClose}
            onComplete={handleStoryComplete}
        />
    );
}
