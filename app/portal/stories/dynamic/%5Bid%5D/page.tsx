
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import StoryReader from '@/components/portal/StoryReader';
import { SAMPLE_ANANSI_STORY } from '@/lib/mocks/sample-story';
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

        // Fallback or normal loading
        setTimeout(() => {
            setStory(SAMPLE_ANANSI_STORY);
            setIsLoading(false);
        }, 1500);
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

    if (!story) return null;

    return (
        <StoryReader
            story={story}
            onClose={() => router.push('/portal')}
        />
    );
}
