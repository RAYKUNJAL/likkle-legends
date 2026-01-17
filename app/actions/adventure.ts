
"use server";

import { generateLegendStoryPages } from "@/lib/services/antigravity";
import { StoryParams } from "@/lib/types";

export async function generateAdventureAction(params: StoryParams) {
    try {
        const pages = await generateLegendStoryPages(params);
        return { success: true, pages };
    } catch (error: any) {
        console.error("Action error generating adventure:", error);
        return { success: false, error: error.message || "Failed to generate adventure" };
    }
}
