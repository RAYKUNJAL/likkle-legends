"use server";

import { BUCKETS } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase-client";
import { estimateNarrationTimings } from "@/lib/story-narration-policy";
import { synthesizeWarmNarration } from "@/lib/story-narration";

interface EnsureStoryPageAudioInput {
    storyId: string;
    pageIndex: number;
    text: string;
}

export async function ensureStoryPageAudio(input: EnsureStoryPageAudioInput): Promise<{
    success: boolean;
    audioUrl?: string;
    words?: { text: string; start: number; end: number }[];
    provider?: 'elevenlabs' | 'gemini';
    fromCache?: boolean;
    code?: 'missing_key' | 'generation_failed';
    error?: string;
}> {
    const cleanText = input.text.replace(/\s+/g, " ").trim().slice(0, 1800);
    if (!cleanText) {
        return { success: false, code: 'generation_failed', error: "Missing story audio input" };
    }

    const spoken = await synthesizeWarmNarration(cleanText);
    if (!spoken.ok) {
        return { success: false, code: spoken.code, error: spoken.error };
    }

    const words = estimateNarrationTimings(cleanText);
    const dataUrl = `data:${spoken.contentType};base64,${spoken.audio.toString('base64')}`;

    if (input.storyId) {
        try {
            const { data: storybook } = await supabaseAdmin
                .from("storybooks")
                .select("id, content_json")
                .eq("id", input.storyId)
                .maybeSingle();

            if (storybook) {
                const contentJson = (storybook.content_json && typeof storybook.content_json === "object")
                    ? storybook.content_json as Record<string, any>
                    : {};
                const pages = Array.isArray(contentJson.pages) ? [...contentJson.pages] : [];
                const page = (pages[input.pageIndex] && typeof pages[input.pageIndex] === "object")
                    ? { ...pages[input.pageIndex] }
                    : {};
                const storagePath = `audio/${input.storyId}/page-${input.pageIndex + 1}-warm-narrator.${spoken.contentType === 'audio/wav' ? 'wav' : 'mp3'}`;
                const upload = await supabaseAdmin.storage
                    .from(BUCKETS.STORYBOOKS)
                    .upload(storagePath, spoken.audio, {
                        contentType: spoken.contentType,
                        upsert: true,
                    });
                const publicUrl = upload.error
                    ? dataUrl
                    : supabaseAdmin.storage.from(BUCKETS.STORYBOOKS).getPublicUrl(storagePath).data.publicUrl;
                pages[input.pageIndex] = {
                    ...page,
                    audioUrl: publicUrl,
                    audio_url: publicUrl,
                    audioWords: words,
                    audio_words: words,
                    audio_character: `warm_island_narrator_${spoken.provider}`,
                    narrated_by: `warm_island_narrator_${spoken.provider}`,
                };
                await supabaseAdmin
                    .from("storybooks")
                    .update({
                        content_json: {
                            ...contentJson,
                            narrated_by: `warm_island_narrator_${spoken.provider}`,
                            pages,
                        },
                    })
                    .eq("id", input.storyId);
                return { success: true, audioUrl: publicUrl, words, provider: spoken.provider, fromCache: false };
            }
        } catch (error) {
            console.warn("[story-audio] Cache skipped", error);
        }
    }

    return { success: true, audioUrl: dataUrl, words, provider: spoken.provider, fromCache: false };
}
