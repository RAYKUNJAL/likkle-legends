"use server";

import { GoogleVoiceCharacter, synthesizeCharacterSpeech } from "@/lib/google-cloud-tts";

// export const maxDuration = 60; // Config not supported in Server Actions

/**
 * 🎙️ Tanty Spice Voice Action (Legacy Wrapper)
 */
export async function getTantyVoice(text: string) {
    return generateCharacterAudio(text, 'tanty');
}

/**
 * 🎧 Universal Character Voice Action
 * Supports: 'tanty', 'roti'
 */
export async function generateCharacterAudio(
    text: string,
    character: 'tanty' | 'roti' | 'dilly' = 'tanty'
): Promise<{
    success: boolean;
    audio?: string;
    error?: string;
}> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text provided" };
    }

    const cleanText = text.trim().substring(0, 2000);

    try {
        const googleCharacter: GoogleVoiceCharacter = character === 'dilly' ? 'dilly' : character;
        const audioBase64 = await synthesizeCharacterSpeech(cleanText, googleCharacter);
        if (!audioBase64) return { success: false, error: "TTS Generation Failed" };
        return { success: true, audio: `data:audio/mp3;base64,${audioBase64}` };

    } catch (error) {
        console.error("[Voice Action] Critical error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}

function estimateWordTimings(text: string) {
    const words = text.split(/\s+/).filter(Boolean);
    let currentTime = 0;
    return words.map((word) => {
        const duration = (word.length / 10) + 0.1;
        const start = currentTime;
        const end = currentTime + duration;
        currentTime = end;
        return { text: word, start, end };
    });
}

export async function generateCharacterAudioWithMetadata(
    text: string,
    character: 'tanty' | 'roti' | 'dilly' = 'tanty'
): Promise<{
    success: boolean;
    audio?: string;
    words?: { text: string; start: number; end: number }[];
    error?: string;
}> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text provided" };
    }

    const cleanText = text.trim().substring(0, 2000);

    try {
        const googleCharacter: GoogleVoiceCharacter = character === 'dilly' ? 'dilly' : character;
        const audioBase64 = await synthesizeCharacterSpeech(cleanText, googleCharacter);
        if (!audioBase64) return { success: false, error: "TTS Generation Failed" };
        return {
            success: true,
            audio: `data:audio/mp3;base64,${audioBase64}`,
            words: estimateWordTimings(cleanText)
        };
    } catch (error) {
        console.error("[Voice Action] Critical error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}
