"use server";

import { generateCulturalStory, StoryInputs } from "@/lib/story-engine";

export const maxDuration = 60; // Allow 60 seconds for story generation

export async function createStoryAction(inputs: StoryInputs) {
    try {
        const story = await generateCulturalStory(inputs);
        return { success: true, story };
    } catch (error) {
        console.error("Action error generating story:", error);
        return { success: false, error: "Failed to generate story" };
    }
}
