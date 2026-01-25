
import '../lib/load-env';
import fs from 'fs';
import path from 'path';
import { generateGeminiSpeech } from '../lib/gemini-tts';
import { createClient } from '@supabase/supabase-js';

const CONTENT_DIR = path.resolve(process.cwd(), 'generated-content');
const STORIES_DIR = path.join(CONTENT_DIR, 'stories');
const SONGS_DIR = path.join(CONTENT_DIR, 'songs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'songs'; // Using 'songs' bucket for all generated audio for now

async function processDirectory(dir: string, type: 'story' | 'song') {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    console.log(`📂 Processing ${files.length} ${type} files...`);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (content.audio_url) {
            console.log(`⏩ Skipping ${file} (already has audio: ${content.audio_url})`);
            continue;
        }

        console.log(`🎤 Generating audio for: ${content.title || file}`);

        let textToSpeak = "";
        if (type === 'story') {
            textToSpeak = content.pages?.map((p: any) => p.text).join(" ") || content.text || content.summary || "";
        } else {
            textToSpeak = content.lyrics?.verse_1 || content.lyrics || content.summary || "";
        }

        if (!textToSpeak) {
            console.warn(`⚠️ No text found for ${file}`);
            continue;
        }

        try {
            // Determine voice based on character or island
            let voiceName = 'Kore'; // Tanty Spice default
            if (content.characterId === 'Rasta Ray' || content.characterId === 'Ray') {
                voiceName = 'Aoede'; // Use Benny/Aoede for now or Puck
            }

            const audioBuffer = await generateGeminiSpeech(textToSpeak, { voiceName });

            if (!audioBuffer) {
                console.error(`❌ Failed to generate audio for ${file}`);
                continue;
            }

            const folderName = type === 'story' ? 'stories' : 'songs';
            const fileName = `generated/${folderName}/${path.basename(file, '.json')}.wav`;

            console.log(`📤 Uploading to Supabase [${process.env.NEXT_PUBLIC_SUPABASE_URL}]: ${fileName}`);
            const { data, error } = await supabase.storage
                .from(BUCKET)
                .upload(fileName, audioBuffer, {
                    contentType: 'audio/wav',
                    upsert: true
                });

            if (error) {
                console.error(`❌ Upload error for ${file}:`, error.message);
                continue;
            }

            const { data: urlData } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(fileName);

            content.audio_url = urlData.publicUrl;

            // Save updated JSON
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
            console.log(`✅ Success! Updated ${file}`);

            // 🕒 DELAY to avoid 429 Rate Limit (Free Tier has low limit for audio modality)
            console.log("🕒 Waiting 35 seconds to avoid rate limits...");
            await new Promise(resolve => setTimeout(resolve, 35000));

        } catch (err: any) {
            console.error(`❌ Unexpected error processing ${file}:`, err.message || err);
            if (err.message?.includes('429') || err.message?.includes('quota')) {
                console.log("🕒 Quota hit. Waiting 60 seconds...");
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        }
    }
}

async function main() {
    console.log("🚀 Starting Bulk Audio Generation...");
    await processDirectory(STORIES_DIR, 'story');
    await processDirectory(SONGS_DIR, 'song');
    console.log("\n🏁 Done!");
}

main().catch(console.error);
