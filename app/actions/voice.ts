"use server";

import { generateSpeechBase64 } from "@/lib/elevenlabs";

export async function getTantyVoice(text: string) {
    try {
        const audioData = await generateSpeechBase64(text, { voice: 'tanty_spice' });
        if (audioData) {
            return { success: true, audio: audioData };
        }
        return { success: false, error: "No audio generated" };
    } catch (e) {
        console.error("Voice generation error:", e);
        return { success: false, error: "Server error" };
    }
}
