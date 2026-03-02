
const fetch = require('node-fetch');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JfiM1myzVx7xU2MZOAJS';

async function testElevenLabs() {
    console.log('Testing ElevenLabs API...');
    console.log('Voice ID:', VOICE_ID);
    if (!API_KEY) {
        console.error('ERROR: Missing ELEVENLABS_API_KEY env var.');
        process.exitCode = 1;
        return;
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY,
            },
            body: JSON.stringify({
                text: "Hello, this is Tanty Spice testing her new voice.",
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }),
        });

        if (response.ok) {
            console.log('SUCCESS: API Call worked properly.');
            const buffer = await response.buffer();
            console.log('Received audio buffer size:', buffer.length);
        } else {
            const errorText = await response.text();
            console.error('ERROR: API Call failed.');
            console.error('Status:', response.status);
            console.error('Details:', errorText);
        }
    } catch (error) {
        console.error('EXCEPTION:', error);
    }
}

testElevenLabs();
