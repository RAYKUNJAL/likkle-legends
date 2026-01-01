import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech, VOICES, VoiceCharacter } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, voice = 'tanty_spice' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length > 5000) {
            return NextResponse.json({ error: 'Text too long (max 5000 characters)' }, { status: 400 });
        }

        // Validate voice
        const voiceId = voice as VoiceCharacter;
        if (!VOICES[voiceId]) {
            return NextResponse.json({ error: 'Invalid voice' }, { status: 400 });
        }

        const audioBuffer = await generateSpeech(text, { voice: voiceId });

        if (!audioBuffer) {
            return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
        }

        // Return audio as response
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error('Voice generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
