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
        console.log("[StoryDatabaseAction] Starting story selection with:", selection);

        // Get all stories matching the criteria
        const stories = await getStoriesByTradition(selection.tradition, {
            reading_level: selection.level,
            island_code: selection.island,
            limit: 10
        });

        console.log(`[StoryDatabaseAction] Found ${stories?.length || 0} matching stories`);

        if (!stories || stories.length === 0) {
            return {
                success: false,
                error: `No ${selection.tradition} stories found for ${selection.island} at ${selection.level} level.`
            };
        }

        // Pick a random story from matching ones (for variety)
        const randomStory = stories[Math.floor(Math.random() * stories.length)];
        console.log("[StoryDatabaseAction] Selected story slug:", randomStory.slug);

        // Fetch full story content
        const fullStory = await getStoryBySlug(randomStory.slug);

        if (!fullStory) {
            console.error("[StoryDatabaseAction] Failed to fetch full story by slug:", randomStory.slug);
            return { success: false, error: "Failed to load story content." };
        }

        console.log("[StoryDatabaseAction] Successfully loaded full story:", fullStory.book_meta?.title);

        // Personalize the story with child's name
        if (selection.childName && fullStory.structure?.pages?.[0]) {
            fullStory.structure.pages[0].narrative_text =
                `${selection.childName}, let me tell you a story...\n\n${fullStory.structure.pages[0].narrative_text}`;
        }

        return { success: true, story: fullStory };
    } catch (error) {
        console.error("[StoryDatabaseAction] Critical error:", error);
        return { success: false, error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
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
