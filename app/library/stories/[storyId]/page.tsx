"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import PremiumStoryReader from "@/components/PremiumStoryReader";
import { fetchKidsLibraryStory, toReaderStory } from "@/lib/library-stories";

interface StoryPlayerProps {
    params: {
        storyId: string;
    }
}

export default function StoryPlayerPage({ params }: StoryPlayerProps) {
    const router = useRouter();
    const [story, setStory] = useState<ReturnType<typeof toReaderStory>>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const libraryStory = await fetchKidsLibraryStory(params.storyId);
                setStory(libraryStory ? toReaderStory(libraryStory) : null);
            } catch (error) {
                console.error("Story not found", error);
                setStory(null);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [params.storyId]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#FDF6E3]">
                <Loader2 className="animate-spin h-10 w-10 text-orange-500" />
            </div>
        );
    }

    if (!story?.content_json?.pages?.length) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#FDF6E3] text-center p-8 gap-4">
                <BookOpen className="h-12 w-12 text-orange-400" />
                <p className="text-xl font-bold text-gray-700">This story is not ready to read.</p>
                <p className="text-gray-500 max-w-md">We only open real Caribbean books with covers and pages. No pretend titles.</p>
                <Link href="/portal/stories" className="text-orange-600 font-black">Back to library</Link>
            </div>
        );
    }

    return (
        <PremiumStoryReader
            story={story}
            onClose={() => router.push('/portal/stories')}
            onComplete={() => router.push('/portal/stories')}
        />
    );
}
