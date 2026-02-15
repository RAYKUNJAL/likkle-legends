import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

async function seed() {
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL missing in .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to DB');

        const characters = [
            {
                name: 'R.O.T.I.',
                role_description: 'Island Learning Buddy',
                bio: 'A friendly guide who helps children learn step by step through stories, games, and gentle encouragement.',
                personality_traits: ['friendly', 'helpful', 'logical', 'encouraging'],
                image_url: '/images/roti-new.jpg',
                display_order: 1
            },
            {
                name: 'Tanty Spice',
                role_description: 'Village Heart & Wisdom',
                bio: 'A warm, caring presence who helps lessons land with kindness, patience, and reassurance.',
                personality_traits: ['warm', 'caring', 'wise', 'patient'],
                image_url: '/images/tanty_spice_avatar.jpg',
                display_order: 2
            },
            {
                name: 'Dilly Doubles',
                role_description: 'Joy & Sharing Guide',
                bio: 'A playful island friend who teaches curiosity, sharing, and community through fun and laughter.',
                personality_traits: ['playful', 'joyful', 'generous', 'funny'],
                image_url: '/images/dilly-doubles.jpg',
                display_order: 3
            },
            {
                name: 'Mango Moko',
                role_description: 'Nature & Balance Guardian',
                bio: 'A calm, observant guide who helps children slow down, listen, and learn from the world around them.',
                personality_traits: ['calm', 'observant', 'patient', 'steady'],
                image_url: '/images/mango_moko.png',
                display_order: 4
            },
            {
                name: 'Benny of Shadows',
                role_description: 'Guardian of Secrets & Nature',
                bio: 'A mysterious and quiet guide who helps children connect with the hidden wonders of nature.',
                personality_traits: ['mysterious', 'quiet', 'nature-loving', 'curious'],
                image_url: '/images/benny-of-shadows.jpg',
                display_order: 5
            },
            {
                name: 'Steelpan Sam',
                role_description: 'Rhythm & Music Master',
                bio: 'A musical genius who turns every lesson into a song, helping children enjoy their learning.',
                personality_traits: ['musical', 'energetic', 'creative', 'fun'],
                image_url: '/images/steelpan_sam.png',
                display_order: 6
            }
        ];

        for (const char of characters) {
            await client.query(`
                INSERT INTO public.characters (name, role_description, bio, personality_traits, image_url, display_order)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (name) DO UPDATE SET
                    role_description = EXCLUDED.role_description,
                    bio = EXCLUDED.bio,
                    personality_traits = EXCLUDED.personality_traits,
                    image_url = EXCLUDED.image_url,
                    display_order = EXCLUDED.display_order
            `, [char.name, char.role_description, char.bio, char.personality_traits, char.image_url, char.display_order]);
            console.log(`✅ Seeded character: ${char.name}`);
        }

        console.log('\n🌟 All characters seeded successfully!');

    } catch (err: any) {
        console.error('💥 Seed failed:', err.message);
    } finally {
        await client.end();
    }
}

seed();
