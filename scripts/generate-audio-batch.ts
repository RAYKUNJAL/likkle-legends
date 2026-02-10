
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { elevenLabsService, VoiceResponse } from '../lib/services/elevenlabs';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase Configuration');
    console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? '✅ Found' : '❌ Missing'}`);
    console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Found' : '❌ Missing'}`);
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (consistent default)
// const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella (Narrator style)
// const VOICE_ID = 'MF3mGyEYCl7XYWbV9V6O'; // Elli (Calm/Deep)

interface StoryPage {
    pageNumber: number;
    text: string;
    audioUrl?: string; // Legacy
    audio?: {
        alignment: {
            characters: string[];
            character_start_times_seconds: number[];
            character_end_times_seconds: number[];
        };
        duration: number; // Placeholder
    };
    // ... other fields
    [key: string]: any;
}

async function uploadAudio(buffer: Buffer, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from('stories')
        .upload(path, buffer, {
            contentType: 'audio/mpeg',
            upsert: true
        });

    if (error) {
        console.error('❌ Upload failed:', error.message);
        return null;
    }

    const { data: publicUrlData } = supabase.storage
        .from('stories')
        .getPublicUrl(path);

    return publicUrlData.publicUrl;
}

async function processStory(story: any) {
    console.log(`📖 Processing Story: "${story.title}" (ID: ${story.id})`);

    // Parse content_json if it's a string, or use directly
    let content = typeof story.content_json === 'string'
        ? JSON.parse(story.content_json)
        : story.content_json;

    const pages: StoryPage[] = content.pages || [];
    let updated = false;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Skip if heavy-weight alignment data already exists? 
        // Or force update if requested. 
        // For now, check if audioUrl exists AND alignment exists.
        if (page.audioUrl && page.audio?.alignment) {
            console.log(`   Page ${i + 1}: ✅ Already has aligned audio.`);
            continue;
        }

        console.log(`   Page ${i + 1}: 🎤 Generating audio...`);

        try {
            // Generate Speech with Timestamps
            const result: VoiceResponse = await elevenLabsService.generateSpeech(
                page.text,
                VOICE_ID,
                { stability: 0.5, similarity: 0.8 }
            );

            // Upload Audio
            const fileName = `${story.id}/page-${i + 1}-${Date.now()}.mp3`;
            const publicUrl = await uploadAudio(result.audioBuffer, fileName);

            if (publicUrl) {
                // Formatting alignment for the Reader
                // Reader expects: pageData.audio.alignment.words = [{ text, startTimeSeconds, endTimeSeconds }]
                // But the raw alignment from ElevenLabs is character-level.
                // We need to convert character-level alignment to WORD-level alignment.
                // Or just store the raw data and let the frontend handle it?
                // The Reader code I wrote expected:
                // audio.alignment.words.map(...)
                // AND the alignment object from ElevenLabs service returns:
                // { characters: [], character_start_times_seconds: [], ... }

                // Let's perform the conversion here to be safe and "Commercial-Grade".
                const wordAlignment = convertToWordAlignment(result.alignment, result.normalizedText);

                // Structure update
                page.audioUrl = publicUrl; // For basic compatibility
                page.audio = {
                    alignment: {
                        words: wordAlignment // Using the "Pro" word structure
                    },
                    // We can also store raw if needed
                    // raw: result.alignment 
                };

                updated = true;
                console.log(`     ✅ Audio generated & uploaded.`);
            }

        } catch (err: any) {
            console.error(`     ❌ Generation failed:`, err.message);
        }

        // Rate limit strictness
        await new Promise(r => setTimeout(r, 1000));
    }

    if (updated) {
        // Save back to DB
        const { error } = await supabase
            .from('storybooks')
            .update({ content_json: content })
            .eq('id', story.id);

        if (error) console.error('❌ Failed to update story in DB:', error.message);
        else console.log('✅ Story updated in database!');
    }
}

/**
 * Converts ElevenLabs character alignment to word-level alignment
 */
function convertToWordAlignment(alignment: any, text: string) {
    if (!alignment || !alignment.characters) return [];

    const words: any[] = [];
    let currentWord = "";
    let start = -1;
    let end = -1;

    for (let i = 0; i < alignment.characters.length; i++) {
        const char = alignment.characters[i];
        const s = alignment.character_start_times_seconds[i];
        const e = alignment.character_end_times_seconds[i];

        if (char === ' ') {
            if (currentWord.trim().length > 0) {
                words.push({
                    text: currentWord.trim(),
                    startTimeSeconds: start,
                    endTimeSeconds: end
                });
            }
            currentWord = "";
            start = -1;
        } else {
            if (start === -1) start = s;
            end = e;
            currentWord += char;
        }
    }

    // Final word
    if (currentWord.trim().length > 0) {
        words.push({
            text: currentWord.trim(),
            startTimeSeconds: start,
            endTimeSeconds: end
        });
    }

    return words;
}

async function main() {
    console.log('🚀 Starting Batch Audio Generation (with Exact Sync)...');

    // 1. Fetch stories without aligned audio
    // Actually, just fetch all active stories for now or specific ones.
    const { data: stories, error } = await supabase
        .from('storybooks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ DB Error:', error.message);
        return;
    }

    console.log(`Found ${stories.length} stories.`);

    for (const story of stories) {
        await processStory(story);
    }
}

main().catch(console.error);
