
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import StoryReader from '@/components/portal/StoryReader';
import { StoryBook } from '@/types/story';

export default function DynamicStoryPage() {
    const params = useParams();
    const router = useRouter();
    const [story, setStory] = useState<StoryBook | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id === 'session') {
            const draft = sessionStorage.getItem('current_story_draft');
            if (draft) {
                try {
                    setStory(JSON.parse(draft));
                    setIsLoading(false);
                    return;
                } catch (e) {
                    console.error("Failed to parse draft");
                }
            }
        }

        setIsLoading(false);
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                    <p className="text-white/40 font-black uppercase tracking-[0.2em] text-sm italic">
                        Polishing the pages...
                    </p>
                </div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-8 text-center">
                <div className="space-y-4 max-w-md">
                    <p className="text-white font-black text-2xl">No story is ready</p>
                    <p className="text-white/50 font-bold">Story Studio only opens a real library tale. Nothing was found for this session.</p>
                    <button
                        onClick={() => router.push('/portal/stories')}
                        className="px-6 py-3 bg-primary text-white rounded-2xl font-black"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <StoryReader
            story={story}
            onClose={() => router.push('/portal')}
        />
    );
}
