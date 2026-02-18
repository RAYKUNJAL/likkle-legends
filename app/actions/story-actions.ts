
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

/**
 * 🗑️ Erase a story from your personal library
 */
export async function deleteStorybookAction(storyId: string) {
    try {
        const { error } = await supabase
            .from('storybooks')
            .delete()
            .eq('id', storyId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("[DeleteStoryAction] Error:", error);
        return { success: false, error: "Could not sweep this story away. Please try again." };
    }
}
/**
 * 💾 Save a manually generated/simple story to the library
 */
export async function saveManualStoryAction(title: string, pages: any[], island: string) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Convert simple pages to a standard storybook format
        const storyData = {
            metadata: { title, language: "en", age_range: "all", target_reading_level: "mixed", estimated_page_count: pages.length, created_at_iso: new Date().toISOString() },
            pages: pages.map((p, i) => ({
                page_number: i + 1,
                story_text: p.text,
                illustration_prompt: { short_prompt: "Illustration", detailed_prompt: "Illustration", style: "vibrant", safety_and_constraints: [] }
            }))
        };

        const { data, error } = await supabase
            .from('storybooks')
            .insert({
                title,
                summary: pages[0]?.text?.substring(0, 100) + '...',
                content_json: storyData,
                cover_image_url: pages[0]?.imageUrl || null,
                island_theme: island,
                user_id: user.id,
                is_active: false
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, id: data.id };
    } catch (error) {
        console.error("[SaveManualStoryAction] Error:", error);
        return { success: false, error: "Failed to pin this story to the village board." };
    }
}
