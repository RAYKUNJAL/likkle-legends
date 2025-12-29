"use server";

import { generateCulturalStory, StoryInputs } from "@/lib/story-engine";

export async function createStoryAction(inputs: StoryInputs) {
    try {
        const story = await generateCulturalStory(inputs);
        if (!story) {
            throw new Error("Failed to generate story");
        }
        return story;
    } catch (error) {
        console.error("Story Action Error:", error);
        return {
            error: "Tanty is having trouble finding her glasses. Could you try asking for a story again later?",
            title: "Oh No!",
            content: "Something went wrong, little legend.",
            glossary: [],
            parentPrompt: "Should we try again?"
        };
    }
}
