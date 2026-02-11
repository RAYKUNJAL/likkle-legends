
import { NextRequest, NextResponse } from 'next/server';

// Voice IDs for Likkle Legends characters
const VOICE_IDS = {
    tanty_spice: 'JfiM1myzVx7xU2MZOAJS',
    roti: 'nQG6qMEBUTxBc8zgoyIY',
};

// Character-specific voice settings
const VOICE_SETTINGS = {
    tanty_spice: {
        stability: 0.35,
        similarity_boost: 0.62,
        style: 0.12,
        use_speaker_boost: true
    },
    roti: {
        stability: 0.32,
        similarity_boost: 0.60,
        style: 0.16,
        use_speaker_boost: true
    }
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, voice = 'tanty_spice' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const API_KEY = process.env.ELEVENLABS_API_KEY;
        const VOICE_ID = VOICE_IDS[voice as keyof typeof VOICE_IDS] || VOICE_IDS.tanty_spice;
        const settings = VOICE_SETTINGS[voice as keyof typeof VOICE_SETTINGS] || VOICE_SETTINGS.tanty_spice;

        if (!API_KEY) {
            console.error('[ElevenLabs Proxy] Missing API Key');
            return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
        }

        console.log(`[ElevenLabs Proxy] Generating speech for voice: ${voice} (${VOICE_ID})`);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: settings
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
