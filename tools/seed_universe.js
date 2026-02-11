const { Client } = require('pg');
require('dotenv').config();

async function seedUniverse() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Seeding the Likkle Legends Universe...');

        // 1. Seed Core Characters/Stories as Content Items
        const contentItems = [
            { slug: 'anansi-pot-of-beans', type: 'story', title: 'Anansi and the Pot of Beans', island: 'JM' },
            { slug: 'papa-bois-guardian', type: 'story', title: 'Papa Bois: Guardian of the Forest', island: 'TT' },
            { slug: 'compere-lapin-race', type: 'story', title: 'Compere Lapin and the Race', island: 'SL' },
            { slug: 'bouki-malice-garden', type: 'story', title: 'Bouki and Malice in the Garden', island: 'HT' }
        ];

        for (const item of contentItems) {
            const res = await client.query(`
        INSERT INTO public.content_items (content_type, slug, title, island_code, has_dialect_toggle)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
        RETURNING id;
      `, [item.type, item.slug, item.title, item.island]);

            const itemId = res.rows[0].id;

            // 2. Add Dialect Localizations for each (The Soul of the Universe)
            if (item.slug === 'anansi-pot-of-beans') {
                await seedLocalization(client, itemId, 'standard_english', 'Anansi used his wit to outsmart the villagers and take the beans.');
                await seedLocalization(client, itemId, 'local_dialect', 'Anansi, dat crafty spider, use him head-piece fi trick di whole village an’ tek di beans fi him-self.');
            }
            else if (item.slug === 'papa-bois-guardian') {
                await seedLocalization(client, itemId, 'standard_english', 'Papa Bois protected the deer from the hunters in the deep forest.');
                await seedLocalization(client, itemId, 'local_dialect', 'Papa Bois, de old man a-de woods, hide de deer from dem hunters in de deep-deep bush.');
            }
        }

        console.log('✅ Legends successfully migrated to v2 architecture.');

    } catch (err) {
        console.error('Error seeding legends:', err);
    } finally {
        await client.end();
    }
}

async function seedLocalization(client, itemId, dialect, text) {
    await client.query(`
    INSERT INTO public.content_localizations (content_item_id, dialect_type, display_title, body_text)
    VALUES ($1, $2, (SELECT title FROM public.content_items WHERE id = $1), $3)
    ON CONFLICT (content_item_id, dialect_type, language_code) DO UPDATE SET body_text = EXCLUDED.body_text;
  `, [itemId, dialect, text]);
}

seedUniverse();
