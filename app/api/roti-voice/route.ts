import { NextRequest, NextResponse } from 'next/server';
import { getROTIVoice } from '@/lib/roti-voice';
import { ROTIVoiceMode } from '@/lib/roti-voice-config';

/**
 * 🤖 R.O.T.I. Voice API Route
 * 
 * POST /api/roti-voice
 * Body: { text: string, voiceMode?: "default" | "kid" | "playful" | "calm" }
 * 
 * Returns JSON: { success: boolean, audio?: string (data URL), error?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { text, voiceMode = "default" } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Text is required' },
                { status: 400 }
            );
        }

        // Validate voice mode
        const validModes: ROTIVoiceMode[] = ["default", "kid", "playful", "calm"];
        const mode = validModes.includes(voiceMode) ? voiceMode : "default";

        const result = await getROTIVoice(text, mode);

        return NextResponse.json(result);

    } catch (error) {
        console.error('[ROTI_VOICE_API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Voice generation failed' },
            { status: 500 }
        );
    }
}
