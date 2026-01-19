
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY || 'sk_a6d13d625a2cb1d95fc41ef29736b92cecd11b39351eb7c9';
        const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || process.env.VITE_ELEVENLABS_VOICE_ID || 'JfiM1myzVx7xU2MZOAJS';

        if (!API_KEY) {
            console.error('[ElevenLabs Proxy] Missing API Key');
            return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
        }

        console.log(`[ElevenLabs Proxy] Generating speech for voice: ${VOICE_ID} (Key length: ${API_KEY.length})`);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.50,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ElevenLabs Proxy] External API Error: ${response.status} - ${errorText}`);
            return NextResponse.json({ error: `ElevenLabs API Error: ${errorText}` }, { status: response.status });
        }

        // Stream the audio back
        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });

    } catch (error: any) {
        console.error('[ElevenLabs Proxy] Internal Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
