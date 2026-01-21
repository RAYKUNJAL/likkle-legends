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
    const { createAdminClient } = await import('@/lib/admin');
    const admin = createAdminClient();

    const results = {
        story: null as any,
        song: null as any,
        printable: null as any,
        video: null as any
    };

    try {
        // 1. Publish Storybook
        const { data: story, error: storyErr } = await admin
            .from('storybooks')
            .insert({
                title: module.content.story.title,
                summary: module.content.story.summary,
                content_json: module.content.story,
                age_track: module.ageGroup,
                island_theme: module.island,
                reading_time_minutes: module.content.story.readingTimeMinutes,
                word_count: module.content.story.wordCount || 500,
                difficulty_level: module.content.story.difficultyLevel,
                tier_required: 'legends_plus',
                cover_image_url: `https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800` // Placeholder
            })
            .select()
            .single();
        if (storyErr) throw storyErr;
        results.story = story;

        // 2. Publish Song
        const { data: song, error: songErr } = await admin
            .from('songs')
            .insert({
                title: module.content.song.title,
                artist: module.content.song.artist,
                description: module.content.song.description,
                lyrics: module.content.song.lyrics,
                category: module.content.song.category,
                island_origin: module.island,
                age_track: module.ageGroup,
                duration_seconds: module.content.song.durationSeconds,
                tier_required: 'starter_mailer',
                audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
                thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800' // Placeholder
            })
            .select()
            .single();
        if (songErr) throw songErr;
        results.song = song;

        // 3. Publish Printable
        const { data: printable, error: printErr } = await admin
            .from('printables')
            .insert({
                title: module.content.printable.title,
                description: module.content.printable.description,
                category: module.content.printable.type,
                tier_required: 'starter_mailer',
                pdf_url: '#', // Placeholder
                preview_url: 'https://images.unsplash.com/photo-1586075010633-24701fb7fe89?auto=format&fit=crop&q=80&w=800' // Placeholder
            })
            .select()
            .single();
        if (printErr) throw printErr;
        results.printable = printable;

        // 4. Publish Video
        const { data: video, error: videoErr } = await admin
            .from('videos')
            .insert({
                title: module.content.videoScript.title,
                description: module.content.videoScript.description,
                category: 'lesson',
                island_theme: module.island,
                age_track: module.ageGroup,
                duration_seconds: module.content.videoScript.totalDurationSeconds,
                tier_required: 'legends_plus',
                video_url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Placeholder
                thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800' // Placeholder
            })
            .select()
            .single();
        if (videoErr) throw videoErr;
        results.video = video;

        return { success: true, results };
    } catch (error) {
        console.error("Publishing failed:", error);
        return { success: false, error: (error as any).message };
    }
}
