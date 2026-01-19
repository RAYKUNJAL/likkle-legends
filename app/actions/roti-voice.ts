"use server";

/**
 * 🤖 R.O.T.I. Voice Server Action
 * 
 * Unified voice action for R.O.T.I. chat
 * Uses premium Gemini TTS with human-like voices
 */

import { getROTIVoice } from "@/lib/roti-voice";
import { ROTIVoiceMode } from "@/lib/roti-voice-config";

export async function getROTIVoiceAction(
    text: string,
    voiceMode: ROTIVoiceMode = "default"
): Promise<{
    success: boolean;
    audio?: string;
    voiceMode?: ROTIVoiceMode;
    error?: string;
}> {
    return getROTIVoice(text, voiceMode);
}

export { type ROTIVoiceMode } from "@/lib/roti-voice-config";
