import { NextRequest, NextResponse } from 'next/server';
import { GoogleVoiceCharacter, synthesizeCharacterSpeech } from '@/lib/google-cloud-tts';
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
        const { text, voice = 'tanty_spice', voiceName } = body;

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
        const mappedVoice: GoogleVoiceCharacter =
            requestedVoice === 'steelpan_sam' ? 'roti' :
                requestedVoice === 'dilly_doubles' ? 'dilly' :
                    requestedVoice === 'tanty_spice' ? 'tanty' :
                        requestedVoice === 'roti' ? 'roti' :
                            'tanty';

        console.log(`Voice API: Using Google Cloud TTS (${mappedVoice})`);
        const googleBase64 = await synthesizeCharacterSpeech(safeText, mappedVoice, voiceName);
        if (!googleBase64) {
            return NextResponse.json({
                error: 'Failed to generate audio. Check GOOGLE_CLOUD_TTS_API_KEY.'
            }, { status: 500 });
        }

        const googleBuffer = Buffer.from(googleBase64, 'base64');
        const audioBuffer = googleBuffer.buffer.slice(
            googleBuffer.byteOffset,
            googleBuffer.byteOffset + googleBuffer.byteLength
        );
        const contentType = 'audio/mpeg';

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

