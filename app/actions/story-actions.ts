
"use server";

import { generateStory, generateStoryImages } from "@/lib/story-engine";
import { StoryBook } from "@/types/story";
import { supabase } from "@/lib/storage";

export async function createStoryAction(selection: {
    tradition: string;
    level: string;
    island: string;
    childName?: string;
}): Promise<{ success: boolean; story?: StoryBook; error?: string }> {
    try {
        const story = await generateStory(selection);

        if (!story) {
            return { success: false, error: "Failed to generate story content." };
        }

        // Add client-side metadata that AI might have missed
        story.book_meta.reading_level = selection.level as any;
        story.book_meta.setting_island = selection.island;

        return { success: true, story };
    } catch (error) {
        console.error("[StoryAction] Error:", error);
        return { success: false, error: "An unexpected error occurred during story creation." };
    }
}

/**
 * ⚡ Kick off background image generation
 */
export async function generateImagesAction(story: StoryBook) {
    try {
        const updatedStory = await generateStoryImages(story);
        return { success: true, story: updatedStory };
    } catch (error) {
        console.error("[ImageGenAction] Error:", error);
        return { success: false, story };
    }
}

/**
 * 📚 Save story to permanent collection
 */
export async function saveStoryToLibraryAction(story: StoryBook, childId: string) {
    try {
        const { data, error } = await supabase
            .from('content_items')
            .insert({
                content_type: 'story',
                title: story.book_meta.title,
                slug: `auto-${story.id}`,
                island_code: story.book_meta.setting_island,
                age_track: story.book_meta.target_age <= 5 ? 'mini' : 'big',
                published: true,
                metadata: {
                    ...story,
                    saved_by_child: childId
                }
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, id: data.id };
    } catch (error) {
        console.error("[SaveStoryAction] Error:", error);
        return { success: false, error: "Tanty's bookshelf is full right now! Try again later." };
    }
}
