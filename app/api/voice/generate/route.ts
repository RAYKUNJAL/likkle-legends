import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiSpeech } from '@/lib/gemini-tts';
import { generateSpeech as generateElevenLabsSpeech, VOICES, VoiceCharacter } from '@/lib/elevenlabs';
import { synthesizeSpeech } from '@/lib/google-cloud-tts';
import { supabase } from '@/lib/storage';

const MAX_TTS_CHARS = 900;
const BLOCKED_TTS_PATTERN = /\b(kill|weapon|suicide|porn|sex|address|phone number|email me|meet me)\b/i;

function sanitizeTtsText(text: string) {
    return text
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/\b\S+@\S+\.\S+\b/g, '')
        .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, voice = 'tanty_spice', voiceName, provider = 'auto' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length > MAX_TTS_CHARS) {
            return NextResponse.json({ error: `Text too long (max ${MAX_TTS_CHARS} characters)` }, { status: 400 });
        }

        if (BLOCKED_TTS_PATTERN.test(text)) {
            return NextResponse.json({ error: 'Cannot speak that content.' }, { status: 400 });
        }

        const safeText = sanitizeTtsText(text);
        if (!safeText) {
            return NextResponse.json({ error: 'Text is empty after sanitization' }, { status: 400 });
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

        const requestedVoice = String(voice || 'tanty_spice');
        const mappedVoice =
            requestedVoice === 'steelpan_sam' ? 'roti' :
                requestedVoice === 'dilly_doubles' ? 'dilly' :
                    requestedVoice === 'tanty_spice' ? 'tanty' :
                        requestedVoice === 'roti' ? 'roti' :
                            'tanty';

        let audioBuffer: ArrayBuffer | null = null;
        let contentType = 'audio/mpeg';

        const useGoogleFirst = provider === 'auto' || provider === 'google';
        const useGeminiOnly = provider === 'gemini';
        const useElevenOnly = provider === 'elevenlabs';

        // 1) Google Cloud TTS first for buddy chat stability and consistent voices.
        if (useGoogleFirst) {
            console.log('Voice API: Using Google Cloud TTS');

            const googleVoiceConfig =
                mappedVoice === 'roti'
                    ? { languageCode: 'en-US', voiceName: 'en-US-Neural2-J', pitch: 1.5, speakingRate: 1.05, volumeGainDb: 1.0 }
                    : mappedVoice === 'dilly'
                        ? { languageCode: 'en-US', voiceName: 'en-US-Neural2-I', pitch: 2.0, speakingRate: 1.1, volumeGainDb: 1.0 }
                        : { languageCode: 'en-GB', voiceName: 'en-GB-Neural2-C', pitch: -2.0, speakingRate: 0.9, volumeGainDb: 1.0 };

            const googleBase64 = await synthesizeSpeech(safeText, {
                ...googleVoiceConfig,
                voiceName: voiceName || googleVoiceConfig.voiceName
            });

            if (googleBase64) {
                const googleBuffer = Buffer.from(googleBase64, 'base64');
                audioBuffer = googleBuffer.buffer.slice(
                    googleBuffer.byteOffset,
                    googleBuffer.byteOffset + googleBuffer.byteLength
                );
                contentType = 'audio/mpeg';
            }
        }

        // 2) Gemini TTS fallback (or explicit provider request)
        if (!audioBuffer && (useGoogleFirst || useGeminiOnly)) {
            console.log('Voice API: Falling back to Gemini TTS');
            const character = mappedVoice === 'roti' ? 'roti' : mappedVoice === 'dilly' ? 'dilly' : 'tanty';
            audioBuffer = await generateGeminiSpeech(safeText, { voiceName, character });
            if (audioBuffer) {
                contentType = 'audio/wav'; // Gemini returns PCM/WAV
            }
        }

        // 3) ElevenLabs final fallback (or explicit provider request)
        if (!audioBuffer && !useGeminiOnly) {
            const elevenApiKey = process.env.ELEVENLABS_API_KEY;
            if (elevenApiKey && (useGoogleFirst || useElevenOnly)) {
                console.log('Voice API: Falling back to ElevenLabs');
                const finalVoice: VoiceCharacter = mappedVoice === 'dilly' ? 'dilly_doubles' : mappedVoice === 'roti' ? 'roti' : 'tanty_spice';
                if (VOICES[finalVoice]) {
                    audioBuffer = await generateElevenLabsSpeech(safeText, { voice: finalVoice });
                    if (audioBuffer) contentType = 'audio/mpeg';
                }
            }
        }

        if (!audioBuffer) {
            return NextResponse.json({
                error: 'Failed to generate audio. Check GOOGLE_CLOUD_TTS_API_KEY, GEMINI_API_KEY, or ELEVENLABS_API_KEY.'
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

