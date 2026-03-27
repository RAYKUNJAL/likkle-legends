import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env before ANY other imports that might use them
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const SAMPLE_SONGS = [
    {
        title: "likkle Legends jingle",
        artist: "Island Legend",
        audio_url: "https://cdn1.suno.ai/b792349c-09ad-4d94-8e96-ef4077b39209.mp3",
        duration_seconds: 61,
        category: "story",
        is_active: true,
        display_order: 1
    },
    {
        title: "Tanty's Morning Calypso",
        artist: "Likkle Legends",
        audio_url: "https://storage.googleapis.com/likkle-legends-public/radio/morning-calypso.mp3",
        duration_seconds: 185,
        category: "story",
        is_active: true,
        display_order: 2
    },
    {
        title: "The Legend of Anansi",
        artist: "Caribbean Storytellers",
        audio_url: "https://storage.googleapis.com/likkle-legends-public/radio/anansi-story.mp3",
        duration_seconds: 420,
        category: "culture",
        is_active: true,
        display_order: 3
    },
    {
        title: "Island Lullaby (Soft Steelpan)",
        artist: "Steelpan Sam",
        audio_url: "https://storage.googleapis.com/likkle-legends-public/radio/island-lullaby.mp3",
        duration_seconds: 310,
        category: "lullaby",
        is_active: true,
        display_order: 4
    },
    {
        title: "A-B-C Island Style",
        artist: "Likkle Legends",
        audio_url: "https://storage.googleapis.com/likkle-legends-public/radio/abc-island.mp3",
        duration_seconds: 145,
        category: "learning",
        is_active: true,
        display_order: 5
    },
    {
        title: "Reggae Rhythms for Roti",
        artist: "Mango Moko",
        audio_url: "https://storage.googleapis.com/likkle-legends-public/radio/reggae-roti.mp3",
        duration_seconds: 220,
        category: "culture",
        is_active: true,
        display_order: 6
    }
];

async function seedRadio() {
    console.log('📻 Seeding Likkle Legends Radio...');

    // Dynamic import inside the function to avoid top-level await and ensure env is loaded
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    let count = 0;
    for (const song of SAMPLE_SONGS) {
        // Check if song exists by title (safer than strict DB constraint names)
        const { data: existing } = await admin
            .from('songs')
            .select('id')
            .eq('title', song.title)
            .maybeSingle();

        if (existing) {
            const { error: updateError } = await admin
                .from('songs')
                .update(song)
                .eq('id', existing.id);
            if (!updateError) count++;
        } else {
            const { error: insertError } = await admin
                .from('songs')
                .insert(song);
            if (!insertError) count++;
        }
    }

    console.log(`✅ Radio seeded successfully with ${count} tracks!`);
}

seedRadio().catch(err => {
    console.error('💥 Fatal error during seeding:', err);
    process.exit(1);
});
