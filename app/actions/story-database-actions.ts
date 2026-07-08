"use server";

import { getStoryBySlug, getStoriesByTradition, getStoriesForChild, getRandomStory, getStoriesWithFilters } from '@/lib/stories-database';
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

        let originalQueryIsland = selection.island;

        // Fallback 1: Query tradition & level across all islands
        if (!stories || stories.length === 0) {
            console.log("[StoryDatabaseAction] ⚠️ No exact match. Fallback 1: Querying tradition & level across all islands.");
            stories = await getStoriesByTradition(selection.tradition, {
                reading_level: selection.level,
                limit: 10
            });
        }

        // Fallback 2: Query tradition across all levels and islands
        if (!stories || stories.length === 0) {
            console.log("[StoryDatabaseAction] ⚠️ Fallback 2: Querying tradition across all levels and islands.");
            stories = await getStoriesByTradition(selection.tradition, {
                limit: 10
            });
        }

        // Fallback 3: Query any active story in stories_library using filters
        if (!stories || stories.length === 0) {
            console.log("[StoryDatabaseAction] ⚠️ Fallback 3: Querying any active story in stories_library.");
            stories = await getStoriesWithFilters({ limit: 10 });
        }

        console.log(`[StoryDatabaseAction] 📚 Query result after fallbacks: Found ${stories?.length || 0} matching stories`);

        if (stories && stories.length > 0) {
            console.log("[StoryDatabaseAction] Story slugs found:", stories.map((s: any) => s.slug).join(", "));
        }

        if (!stories || stories.length === 0) {
            const errorMsg = `No stories found even after applying all fallback options.`;
            console.error("[StoryDatabaseAction] ❌ " + errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }

        // Pick a random story from matching ones (for variety)
        const randomStory = stories[Math.floor(Math.random() * stories.length)];
        console.log("[StoryDatabaseAction] 🎲 Selected random story slug:", randomStory.slug);

        // Fetch full story content
        console.log("[StoryDatabaseAction] 📖 Fetching full story content by slug:", randomStory.slug);
        const fullStory = await getStoryBySlug(randomStory.slug);

        if (!fullStory) {
            const errorMsg = `Failed to load story content for slug: ${randomStory.slug}`;
            console.error("[StoryDatabaseAction] ❌ " + errorMsg);
            return { success: false, error: errorMsg };
        }

        console.log("[StoryDatabaseAction] ✨ Successfully loaded full story:", fullStory.book_meta?.title);
        console.log("[StoryDatabaseAction] Story structure:", {
            pageCount: fullStory.structure?.pages?.length,
            hasBookMeta: !!fullStory.book_meta,
            hasGuides: !!fullStory.guides
        });

        // Customize island setting for a personalized connection
        if (fullStory.book_meta) {
            const islandNames: Record<string, string> = {
                'JM': 'Jamaica',
                'TT': 'Trinidad and Tobago',
                'BB': 'Barbados',
                'LC': 'Saint Lucia',
                'AG': 'Antigua and Barbuda',
                'KN': 'Saint Kitts and Nevis',
                'DM': 'Dominica',
                'GD': 'Grenada',
                'VC': 'Saint Vincent and the Grenadines',
                'GY': 'Guyana',
                'BS': 'Bahamas'
            };
            const targetIslandName = islandNames[originalQueryIsland] || originalQueryIsland;
            console.log(`[StoryDatabaseAction] 🌴 Setting story location to ${targetIslandName}`);
            fullStory.book_meta.setting_island = targetIslandName;
        }

        // Personalize the story with child's name
        if (selection.childName && fullStory.structure?.pages?.[0]) {
            console.log("[StoryDatabaseAction] 👧 Personalizing story for child:", selection.childName);
            if (!fullStory.structure.pages[0].narrative_text.includes(selection.childName)) {
                fullStory.structure.pages[0].narrative_text =
                    `${selection.childName}, let me tell you a story...\n\n${fullStory.structure.pages[0].narrative_text}`;
            }
        }

        console.log("[StoryDatabaseAction] ✅ Story selection complete - ready to store in session");
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
