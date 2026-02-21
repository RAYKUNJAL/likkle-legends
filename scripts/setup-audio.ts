import { createAdminClient } from '../lib/admin';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateAndSeed() {
    console.log('🚀 Finalizing Audio Infrastructure...');
    const admin = createAdminClient();

    // 1. Create Tables (Using standard client to check for tables and then run RPC if available, 
    // or just attempt insert and catch error)

    const SAMPLE_SONGS = [
        {
            title: "Tanty's Morning Calypso",
            artist: "Likkle Legends",
            audio_url: "https://storage.googleapis.com/likkle-legends-public/radio/morning-calypso.mp3",
            duration_seconds: 185,
            category: "story",
            is_active: true,
            display_order: 1
        },
        {
            title: "The Legend of Anansi",
            artist: "Caribbean Storytellers",
            audio_url: "https://storage.googleapis.com/likkle-legends-public/radio/anansi-story.mp3",
            duration_seconds: 420,
            category: "culture",
            is_active: true,
            display_order: 2
        }
    ];

    console.log('Inserting sample songs...');
    const { error: insertError } = await admin
        .from('songs')
        .upsert(SAMPLE_SONGS, { onConflict: 'title' });

    if (insertError) {
        if (insertError.code === '42P01') {
            console.error('❌ Table "songs" is missing. You need to run the migrations in the Supabase Dashboard.');
            console.log('Migration Code (songs):\n' +
                'CREATE TABLE IF NOT EXISTS public.songs (\n' +
                '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n' +
                '    title TEXT NOT NULL,\n' +
                '    artist TEXT DEFAULT \'Likkle Legends\',\n' +
                '    audio_url TEXT NOT NULL,\n' +
                '    duration_seconds INTEGER DEFAULT 0,\n' +
                '    category TEXT DEFAULT \'story\',\n' +
                '    is_active BOOLEAN DEFAULT true,\n' +
                '    display_order INTEGER DEFAULT 0,\n' +
                '    metadata JSONB DEFAULT \'{}\'::jsonb,\n' +
                '    created_at TIMESTAMPTZ DEFAULT now(),\n' +
                '    updated_at TIMESTAMPTZ DEFAULT now()\n' +
                ');');
        } else {
            console.error('❌ Error:', insertError.message);
        }
        return;
    }

    console.log('✅ Radio seeded successfully!');
}

migrateAndSeed();
