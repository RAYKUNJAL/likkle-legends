"use server";

import { BUCKETS } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase-client";
import { GoogleVoiceCharacter, synthesizeCharacterSpeech } from "@/lib/google-cloud-tts";

type StoryAudioVoice = GoogleVoiceCharacter;

interface StoryPageAudioWord {
    text: string;
    start: number;
    end: number;
}

interface EnsureStoryPageAudioInput {
    storyId: string;
    pageIndex: number;
    text: string;
    voice: StoryAudioVoice;
}

function estimateWordTimings(text: string): StoryPageAudioWord[] {
    const words = text.split(/\s+/).filter(Boolean);
    let currentTime = 0;

    return words.map((word) => {
        const duration = Math.max(0.12, (word.length / 10) + 0.08);
        const start = currentTime;
        const end = currentTime + duration;
        currentTime = end;

        return { text: word, start, end };
    });
}

function sanitizeNarrationText(text: string) {
    return text.replace(/\s+/g, " ").trim().slice(0, 2000);
}

export async function ensureStoryPageAudio(input: EnsureStoryPageAudioInput): Promise<{
    success: boolean;
    audioUrl?: string;
    words?: StoryPageAudioWord[];
    fromCache?: boolean;
    error?: string;
}> {
    const cleanText = sanitizeNarrationText(input.text);

    if (!input.storyId || !cleanText) {
        return { success: false, error: "Missing story audio input" };
    }

    const { data: storybook, error: storyError } = await supabaseAdmin
        .from("storybooks")
        .select("id, content_json")
        .eq("id", input.storyId)
        .single();

    if (storyError || !storybook) {
        return { success: false, error: "Story not found" };
    }

    const contentJson = (storybook.content_json && typeof storybook.content_json === "object")
        ? storybook.content_json as Record<string, any>
        : {};
    const pages = Array.isArray(contentJson.pages) ? [...contentJson.pages] : [];
    const page = (pages[input.pageIndex] && typeof pages[input.pageIndex] === "object")
        ? { ...pages[input.pageIndex] }
        : {};

    const existingAudioUrl = page.audioUrl || page.audio_url;
    const existingAudioWords = page.audioWords || page.audio_words;
    const existingAudioCharacter = page.audioCharacter || page.audio_character;

    if (existingAudioUrl && (!existingAudioCharacter || existingAudioCharacter === input.voice)) {
        return {
            success: true,
            audioUrl: existingAudioUrl,
            words: Array.isArray(existingAudioWords) ? existingAudioWords : estimateWordTimings(cleanText),
            fromCache: true,
        };
    }

    const base64Audio = await synthesizeCharacterSpeech(cleanText, input.voice);
    if (!base64Audio) {
        return { success: false, error: "Failed to generate story narration" };
    }

    const buffer = Buffer.from(base64Audio, "base64");
    const storagePath = `audio/${input.storyId}/page-${input.pageIndex + 1}-${input.voice}.mp3`;
    const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKETS.STORYBOOKS)
        .upload(storagePath, buffer, {
            contentType: "audio/mpeg",
            upsert: true,
        });

    if (uploadError) {
        console.error("[story-audio] Upload error:", uploadError);
        return { success: false, error: "Failed to store story narration" };
    }

    const publicUrl = supabaseAdmin.storage.from(BUCKETS.STORYBOOKS).getPublicUrl(storagePath).data.publicUrl;
    const words = estimateWordTimings(cleanText);

    pages[input.pageIndex] = {
        ...page,
        audioUrl: publicUrl,
        audio_url: publicUrl,
        audioWords: words,
        audio_words: words,
        audioCharacter: input.voice,
        audio_character: input.voice,
    };

    const { error: updateError } = await supabaseAdmin
        .from("storybooks")
        .update({
            content_json: {
                ...contentJson,
                pages,
            },
        })
        .eq("id", input.storyId);

    if (updateError) {
        console.error("[story-audio] Storybook update error:", updateError);
    }

    return {
        success: true,
        audioUrl: publicUrl,
        words,
        fromCache: false,
    };
}
