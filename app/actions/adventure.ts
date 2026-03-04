
"use server";

import { generateLegendStoryPages } from "@/lib/services/antigravity";
import { StoryParams } from "@/lib/types";

function toFriendlyAdventureError(error: unknown): string {
    const raw = error instanceof Error ? error.message : String(error);
    const normalized = raw.toLowerCase();

    if (
        normalized.includes("503") ||
        normalized.includes("unavailable") ||
        normalized.includes("high demand") ||
        normalized.includes("resource_exhausted") ||
        normalized.includes("429")
    ) {
        return "Story studio is busy right now. Try again in a few seconds.";
    }

    return "We hit a story generation issue. Please try again.";
}

export async function generateAdventureAction(params: StoryParams) {
    try {
        const pages = await generateLegendStoryPages(params);
        return { success: true, pages };
    } catch (error: any) {
        console.error("Action error generating adventure:", error);
        return { success: false, error: toFriendlyAdventureError(error) };
    }
}
