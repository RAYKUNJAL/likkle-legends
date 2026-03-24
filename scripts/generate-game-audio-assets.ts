
import * as dotenv from 'dotenv';
import { ElevenLabsClient } from 'elevenlabs';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
    console.error('❌ Missing ELEVENLABS_API_KEY');
    process.exit(1);
}

const client = new ElevenLabsClient({ apiKey });
const VOICE_ID = 'JfiM1myzVx7xU2MZOAJS'; // Tanty Spice

const audios = [
    { name: 'pepper_no', text: 'No pepper, please.' },
    { name: 'pepper_slight', text: 'Slight pepper, please.' },
    { name: 'pepper_full', text: 'Full pepper, please!' },
    { name: 'pepper_double', text: 'Slight, slight pepper.' },
    { name: 'order_complete', text: 'Enjoy your doubles!' },
    { name: 'order_failed', text: 'Oh no, too slow!' }
];

async function generate() {
    const outputDir = path.join(process.cwd(), 'public', 'assets', 'game', 'audio');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🎙️ Generating ${audios.length} audio files...`);

    for (const item of audios) {
        const filePath = path.join(outputDir, `${item.name}.mp3`);
        console.log(`   🔊 Generating: ${item.name}...`);
        
        try {
            const audioStream = await client.generate({
                voice: VOICE_ID,
                text: item.text,
                model_id: 'eleven_multilingual_v1' // Try v1 if v2 is unstable, but v2 is usually better for multilingual.
            });

            const chunks: Buffer[] = [];
            // ElevenLabs stream is an AsyncIterable
            for await (const chunk of (audioStream as any)) {
                chunks.push(Buffer.from(chunk));
            }
            const content = Buffer.concat(chunks);
            fs.writeFileSync(filePath, content);
            
            console.log(`     ✅ Saved to ${filePath}`);
        } catch (err) {
            console.error(`     ❌ Failed: ${err}`);
        }
    }
}

generate().catch(console.error);
