"use server";

/**
 * 🤖 R.O.T.I. VOICE SERVER ACTIONS v2.0.0
 * 
 * Server-side voice generation for R.O.T.I.
 * Uses premium Gemini TTS for human-like voices
 */

import { GoogleGenAI, Modality } from "@google/genai";
import {
    ROTIVoiceMode,
    ROTITTSOptions,
    ROTI_VOICE_MODES,
    ROTI_VOICE_ENGINE
} from "./roti-voice-config";

/**
 * Generate R.O.T.I. speech using Gemini TTS
 * Returns WAV audio as ArrayBuffer
 */
export async function generateROTISpeech(
    text: string,
    options: ROTITTSOptions = {}
): Promise<ArrayBuffer | null> {
    const { voiceMode = "default", customVoiceName } = options;

    const voiceConfig = ROTI_VOICE_MODES[voiceMode];
    const voiceName = customVoiceName || voiceConfig.voiceName;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.warn('[ROTI Voice] No Gemini API key configured');
        return null;
    }

    // Clean text for TTS
    const cleanText = text
        .replace(/\*+/g, '')         // Remove asterisks (markdown)
        .replace(/\[.*?\]/g, '')     // Remove markdown links
        .replace(/[🤖🌴🎮📚🧮🌊✨⭐🔊😊🚀]/g, '') // Remove emojis for cleaner speech
        .replace(/\.{3,}/g, '...')   // Normalize ellipsis
        .trim();

    if (!cleanText) {
        console.warn('[ROTI Voice] Empty text after cleaning');
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Craft voice direction for more natural, human-like output
        const voiceDirection = `[Voice Direction: ${voiceConfig.prosodyProfile}. ` +
            `Tone: ${voiceConfig.emotionalTone}. ` +
            `Speaking to a child aged 6-9. ` +
            `Pace: ${voiceConfig.speakingRate < 1 ? 'Slightly slower for clarity' : voiceConfig.speakingRate > 1 ? 'Energetic and dynamic' : 'Natural conversational'}. ` +
            `Personality: Friendly Caribbean robot who loves helping kids learn!]`;

        const response = await ai.models.generateContent({
            model: ROTI_VOICE_ENGINE.technical_stack.vocal_model,
            contents: [{
                parts: [{
                    text: `${voiceDirection} ${cleanText}`
                }]
            }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voiceName
                        }
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            // Convert base64 to Buffer
            const pcmBuffer = Buffer.from(base64Audio, 'base64');
            const numChannels = 1;
            const sampleRate = ROTI_VOICE_ENGINE.technical_stack.audio_sample_rate;
            const bitsPerSample = 16;

            // Create WAV header
            const header = Buffer.alloc(44);
            header.write('RIFF', 0);
            header.writeUInt32LE(36 + pcmBuffer.length, 4);
            header.write('WAVE', 8);
            header.write('fmt ', 12);
            header.writeUInt32LE(16, 16);
            header.writeUInt16LE(1, 20); // PCM format
            header.writeUInt16LE(numChannels, 22);
            header.writeUInt32LE(sampleRate, 24);
            header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
            header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
            header.writeUInt16LE(bitsPerSample, 34);
            header.write('data', 36);
            header.writeUInt32LE(pcmBuffer.length, 40);

            const finalBuffer = Buffer.concat([header, pcmBuffer]);
            console.log(`[ROTI Voice] Generated audio with ${voiceName} voice (${voiceMode} mode)`);
            return finalBuffer.buffer.slice(finalBuffer.byteOffset, finalBuffer.byteOffset + finalBuffer.byteLength);
        }

        console.warn('[ROTI Voice] No audio data in response');
        return null;
    } catch (error) {
        console.error('[ROTI Voice] TTS generation error:', error);
        return null;
    }
}

/**
 * Generate R.O.T.I. speech as a playable data URL
 */
export async function generateROTISpeechBase64(
    text: string,
    options: ROTITTSOptions = {}
): Promise<string | null> {
    const audioBuffer = await generateROTISpeech(text, options);
    if (!audioBuffer) return null;

    const base64 = Buffer.from(audioBuffer).toString('base64');
    return `data:audio/wav;base64,${base64}`;
}

/**
 * Server action to get R.O.T.I. voice audio
 * Used by ROTIChat component
 */
export async function getROTIVoice(
    text: string,
    voiceMode: ROTIVoiceMode = "default"
): Promise<{
    success: boolean;
    audio?: string;
    voiceMode?: ROTIVoiceMode;
    error?: string;
}> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text provided" };
    }

    // Limit text length to prevent huge API calls
    const limitedText = text.trim().substring(0, 800);

    try {
        const audioUrl = await generateROTISpeechBase64(limitedText, { voiceMode });

        if (audioUrl) {
            return {
                success: true,
                audio: audioUrl,
                voiceMode
            };
        }

        return {
            success: false,
            error: "Server TTS unavailable. Using browser voice as fallback."
        };
    } catch (error) {
        console.error('[ROTI Voice Action] Error:', error);
        return { success: false, error: "Voice generation failed" };
    }
}
