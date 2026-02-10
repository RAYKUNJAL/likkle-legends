import '../lib/load-env';
import { generateSpeechWithMetadata } from '../lib/elevenlabs';

async function quickVerify() {
    console.log('=== STEP 1: Env Check ===');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET (' + process.env.GEMINI_API_KEY!.substring(0, 10) + '...)' : 'MISSING');
    console.log('ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? 'SET' : 'MISSING');
    console.log('ELEVENLABS_TANTY_VOICE_ID:', process.env.ELEVENLABS_TANTY_VOICE_ID || 'MISSING');
    console.log('ELEVENLABS_ROTI_VOICE_ID:', process.env.ELEVENLABS_ROTI_VOICE_ID || 'MISSING');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '[NEEDS_KEY]' ? 'SET' : 'MISSING/PLACEHOLDER');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== '[NEEDS_KEY]' ? 'SET' : 'MISSING/PLACEHOLDER');

    console.log('\n=== STEP 2: ElevenLabs TTS (Tanty Spice) ===');
    try {
        const tantyResult = await generateSpeechWithMetadata(
            "Come likkle one, let me tell you a story about the magic steelpan.",
            { voice: 'tanty_spice' as any }
        );
        if (tantyResult) {
            console.log('TANTY OK - Audio URL length:', tantyResult.audioUrl.length);
            console.log('TANTY OK - Word count:', tantyResult.words.length);
            console.log('TANTY OK - First 3 words:', tantyResult.words.slice(0, 3).map(w => `"${w.text}" @${w.start.toFixed(2)}s`).join(', '));
        } else {
            console.log('TANTY FAIL - null result');
        }
    } catch (e: any) {
        console.log('TANTY ERROR:', e.message);
    }

    console.log('\n=== STEP 3: ElevenLabs TTS (R.O.T.I.) ===');
    try {
        const rotiResult = await generateSpeechWithMetadata(
            "Did you know? The steelpan was invented in Trinidad and Tobago!",
            { voice: 'roti' as any }
        );
        if (rotiResult) {
            console.log('ROTI OK - Audio URL length:', rotiResult.audioUrl.length);
            console.log('ROTI OK - Word count:', rotiResult.words.length);
            console.log('ROTI OK - First 3 words:', rotiResult.words.slice(0, 3).map(w => `"${w.text}" @${w.start.toFixed(2)}s`).join(', '));
        } else {
            console.log('ROTI FAIL - null result');
        }
    } catch (e: any) {
        console.log('ROTI ERROR:', e.message);
    }

    console.log('\n=== VERIFICATION COMPLETE ===');
}

quickVerify();
