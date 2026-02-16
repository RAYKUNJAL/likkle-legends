const { Client } = require('pg');
require('dotenv').config();

async function seedSettings() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Seeding site_settings...');

        const settings = [
            {
                key: 'landing_hero',
                content: {
                    title: 'Likkle Legends',
                    subtitle: 'Caribbean Stories for Global Kids',
                    cta: 'Join the Club'
                }
            },
            {
                key: 'radio_station',
                content: {
                    stream_url: 'https://example.com/stream',
                    station_name: 'Tanty Spice Radio'
                }
            }
        ];

        for (const s of settings) {
            await client.query(`
                INSERT INTO site_settings (key, content, updated_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
            `, [s.key, s.content]);
            console.log(`Seeded ${s.key}`);
        }

        console.log('✅ Seeding complete.');

    } catch (err) {
        console.error('SEEDING ERROR:', err.message);
    } finally {
        await client.end();
    }
}

seedSettings();
