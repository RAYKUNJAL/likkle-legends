// AI Agent Server Actions
"use server";

import { verifyAdmin } from "./admin";
import { storyGenerator } from "@/lib/ai-content-generator/generators/story-generator";
import { songGenerator } from "@/lib/ai-content-generator/generators/song-generator";
import { printableGenerator } from "@/lib/ai-content-generator/generators/printable-generator";
import { videoGenerator } from "@/lib/ai-content-generator/generators/video-generator";
import { moduleManagerAgent } from "@/lib/ai-content-generator/agents/ModuleManager";

export async function runStoryAgent(token: string, params: any) {
    await verifyAdmin(token);
    return await storyGenerator.generateStory(params);
}

export async function runSongAgent(token: string, params: any) {
    await verifyAdmin(token);
    return await songGenerator.generateSong(params);
}

export async function runPrintableAgent(token: string, params: any) {
    await verifyAdmin(token);
    return await printableGenerator.generatePrintable(params);
}

export async function runVideoAgent(token: string, params: any) {
    await verifyAdmin(token);
    return await videoGenerator.generateScript(params);
}

export async function runModuleManagerAgent(token: string, objective: string, ageGroup: 'mini' | 'big') {
    await verifyAdmin(token);
    return await moduleManagerAgent.buildCompleteModule(objective, ageGroup);
}

export async function publishModuleToLive(token: string, module: any) {
    await verifyAdmin(token);
    const { databasePoster } = await import('@/lib/ai-content-generator/database-poster');

    console.log(`🚀 Publishing complete module: "${module.title}"...`);

    try {
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

