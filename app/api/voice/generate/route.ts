import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiSpeech } from '@/lib/gemini-tts';
import { generateSpeech as generateElevenLabsSpeech, VOICES, VoiceCharacter } from '@/lib/elevenlabs';
import { supabase } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, voice = 'tanty_spice', voiceName, provider = 'auto' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length > 5000) {
            return NextResponse.json({ error: 'Text too long (max 5000 characters)' }, { status: 400 });
        }

        // SECURITY: Verify Authorization (optional in dev mode)
        const authHeader = request.headers.get('Authorization');
        const isDev = process.env.NODE_ENV === 'development';

        if (authHeader) {
            const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
            if (authError || !user) {
                console.warn('Voice API: Invalid token, proceeding anyway in dev mode');
                if (!isDev) {
                    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
                }
            }
        } else if (!isDev) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }

        let audioBuffer: ArrayBuffer | null = null;
        let contentType = 'audio/mpeg';

        const useGeminiFirst = provider === 'gemini';

        // 1. Try ElevenLabs first (unless explicit Gemini-first requested)
        const elevenApiKey = process.env.ELEVENLABS_API_KEY;
        if (!useGeminiFirst && elevenApiKey) {
            console.log('Voice API: Using ElevenLabs');
            const voiceId = voice as VoiceCharacter;
            // Map 'steelpan_sam' to 'roti' if needed
            const finalVoice = (voiceId as string) === 'steelpan_sam' ? 'roti' : voiceId;

            if (VOICES[finalVoice as VoiceCharacter]) {
                audioBuffer = await generateElevenLabsSpeech(text, { voice: finalVoice as VoiceCharacter });
                if (audioBuffer) contentType = 'audio/mpeg';
            }
        }

        // 2. Gemini TTS (primary for buddy mode, fallback for all)
        if (!audioBuffer) {
            console.log('Voice API: Falling back to Gemini TTS');
            const character =
                (voice as string) === 'roti' || (voice as string) === 'steelpan_sam' ? 'roti'
                    : (voice as string) === 'dilly_doubles' ? 'dilly'
                        : 'tanty';
            audioBuffer = await generateGeminiSpeech(text, { voiceName, character });
            if (audioBuffer) {
                contentType = 'audio/wav'; // Gemini returns PCM/WAV
            }
        }

        if (!audioBuffer) {
            return NextResponse.json({
                error: 'Failed to generate audio. Check API keys (NEXT_PUBLIC_GEMINI_API_KEY or ELEVENLABS_API_KEY)'
            }, { status: 500 });
        }

        // Return audio as response
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error('Voice generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

