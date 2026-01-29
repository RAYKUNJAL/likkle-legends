// AI Agent Server Actions
"use server";

import { verifyAdmin } from "./admin";
import { storyGenerator } from "@/lib/ai-content-generator/generators/story-generator";
import { songGenerator } from "@/lib/ai-content-generator/generators/song-generator";
import { printableGenerator } from "@/lib/ai-content-generator/generators/printable-generator";
import { videoGenerator } from "@/lib/ai-content-generator/generators/video-generator";
import { moduleManagerAgent } from "@/lib/ai-content-generator/agents/ModuleManager";

/**
 * Wrapper to prevent AI agents from hanging forever
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 25000): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs / 1000}s`)), timeoutMs)
    );
    return Promise.race([promise, timeout]);
}

export async function runStoryAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        return await withTimeout(storyGenerator.generateStory(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runSongAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        return await withTimeout(songGenerator.generateSong(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runPrintableAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        return await withTimeout(printableGenerator.generatePrintable(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runVideoAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        return await withTimeout(videoGenerator.generateScript(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runModuleManagerAgent(token: string, objective: string, ageGroup: 'mini' | 'big') {
    try {
        console.log(`[Agent] Start Module Manager. Objective: ${objective}`);

        // Relaxed auth: If verifyAdmin fails due to timeout, we might still proceed for demo,
        // but for now, we'll just catch the error and return it.
        await verifyAdmin(token);

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

        const data = await withTimeout(moduleManagerAgent.buildCompleteModule(objective, ageGroup), 35000);
        return { success: true, data };
    } catch (error: any) {
        console.error("Agent Execution Failed:", error);
        return { success: false, error: error.message || "Unknown error occurred during generation." };
    }
}

export async function publishModuleToLive(token: string, module: any) {
    try {
        await verifyAdmin(token);
        const { databasePoster } = await import('@/lib/ai-content-generator/database-poster');

        console.log(`🚀 Publishing complete module: "${module.title}"...`);

        const results = {
            story: await databasePoster.postStory(module.content.story),
            song: await databasePoster.postSong(module.content.song),
            printable: await databasePoster.postPrintable(module.content.printable),
            video: await databasePoster.postVideo(module.content.videoScript, {
                island: module.island,
                ageGroup: module.ageGroup
            })
        };

        const hasError = Object.values(results).some((r: any) => !r.success);

        return {
            success: !hasError,
            results,
            error: hasError ? "Some assets failed to publish. Check results for details." : null
        };
    } catch (error: any) {
        console.error("Publishing failed:", error);
        return { success: false, error: error.message };
    }
}
