"use server";

import { getStoryBySlug, getStoriesByTradition, getStoriesForChild, getRandomStory } from '@/lib/stories-database';
import { StoryBook } from '@/types/story';

/**
 * Get a pre-built story from the database
 */
export async function selectStoryAction(selection: {
    tradition: string;
    level: string;
    island: string;
    childAge: number;
    childName?: string;
}): Promise<{ success: boolean; story?: StoryBook; error?: string }> {
    try {
        console.log("[StoryDatabaseAction] ✅ Starting story selection with:", selection);
        console.log("[StoryDatabaseAction] Query params - Tradition:", selection.tradition, "| Level:", selection.level, "| Island:", selection.island);

        // Get all stories matching the criteria
        console.log("[StoryDatabaseAction] 🔍 Querying stories_library for matching stories...");
        let stories = await getStoriesByTradition(selection.tradition, {
            reading_level: selection.level,
            island_code: selection.island,
            limit: 10
        });

        // Fallback 1: Query tradition & level across all islands
        if (!stories || stories.length === 0) {
            console.log("[StoryDatabaseAction] ⚠️ No exact match. Fallback 1: Querying tradition & level across all islands.");
            stories = await getStoriesByTradition(selection.tradition, {
                reading_level: selection.level,
                limit: 10
            });
        }

        // Fallback 2: same legend, any reading level or island. Never substitute a different legend.
        if (!stories || stories.length === 0) {
            console.log("[StoryDatabaseAction] ⚠️ Fallback 2: Querying tradition across all levels and islands.");
            stories = await getStoriesByTradition(selection.tradition, {
                limit: 10
            });
        }

        console.log(`[StoryDatabaseAction] 📚 Query result after fallbacks: Found ${stories?.length || 0} matching stories`);

        if (stories && stories.length > 0) {
            console.log("[StoryDatabaseAction] Story slugs found:", stories.map((s: any) => s.slug).join(", "));
        }

        if (!stories || stories.length === 0) {
            return {
                success: false,
                error: 'No matching story is ready in the library yet. Try another legend or island — Story Studio will not invent a pretend book. Use Build Your Story for a new tale with your child\'s name.',
            };
        }

        // Pick a random story from matching ones (for variety)
        const randomStory = stories[Math.floor(Math.random() * stories.length)];
        console.log("[StoryDatabaseAction] 🎲 Selected random story slug:", randomStory.slug);

        // Fetch full story content
        console.log("[StoryDatabaseAction] 📖 Fetching full story content by slug:", randomStory.slug);
        const fullStory = await getStoryBySlug(randomStory.slug);

        const pageCount = fullStory?.structure?.pages?.filter((p: any) =>
            String(p?.narrative_text || p?.text || '').trim()
        ).length || 0;

        if (!fullStory || pageCount === 0) {
            const errorMsg = `That library tale is missing readable pages (${randomStory.slug}).`;
            console.error("[StoryDatabaseAction] ❌ " + errorMsg);
            return { success: false, error: errorMsg };
        }

        console.log("[StoryDatabaseAction] ✨ Successfully loaded full story:", fullStory.book_meta?.title);
        console.log("[StoryDatabaseAction] Story structure:", {
            pageCount: fullStory.structure?.pages?.length,
            hasBookMeta: !!fullStory.book_meta,
            hasGuides: !!fullStory.guides
        });

        console.log("[StoryDatabaseAction] ✅ Story selection complete - opening the real library book");
        return { success: true, story: fullStory };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[StoryDatabaseAction] ❌ Critical error:", errorMessage);
        console.error("[StoryDatabaseAction] Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return { success: false, error: `Error: ${errorMessage}` };
    }
}

/**
 * Get stories recommended for a child based on profile
 */
export async function getRecommendedStoriesAction(childAge: number, childIsland: string) {
    try {
        const stories = await getStoriesForChild(childAge, childIsland);
        return { success: true, stories };
    } catch (error) {
        console.error("[RecommendedStoriesAction] Error:", error);
        return { success: false, error: "Failed to load recommended stories." };
    }
}

/**
 * Get a surprise story (random)
 */
export async function getSurpriseStoryAction(childAge: number, childIsland: string) {
    try {
        const age_track = childAge <= 5 ? 'mini' : 'big';
        const story = await getRandomStory(age_track, childIsland);

        if (!story) {
            return { success: false, error: "No stories available for surprise!" };
        }

        return { success: true, story };
    } catch (error) {
        console.error("[SurpriseStoryAction] Error:", error);
        return { success: false, error: "Failed to load surprise story." };
    }
}
