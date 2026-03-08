"use server";

import { generateCulturalStory, StoryInputs } from "@/lib/story-engine";
import { getTantyVoice } from "./voice";
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


export async function readStorySegment(text: string) {
    try {
        const result = await getTantyVoice(text);
        if (result.success && result.audio) {
            return { success: true, audio: result.audio };
        }
        return { success: false, error: result.error || "Failed to generate audio" };
    } catch (error) {
        return { success: false, error: "Audio generation failed" };
    }
}
