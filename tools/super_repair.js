const { Client } = require('pg');
require('dotenv').config();

async function superRepair() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('--- STARTING SUPER REPAIR ---');

        // 1. Repair children
        console.log('Checking children table...');
        const childRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'children'");
        const childCols = childRes.rows.map(r => r.column_name);

        if (!childCols.includes('family_group_id')) {
            console.log('Adding children.family_group_id...');
            await client.query('ALTER TABLE children ADD COLUMN family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL');
        }
        if (!childCols.includes('name')) {
            // Existing table has first_name
            if (childCols.includes('first_name')) {
                console.log('Renaming children.first_name to name...');
                await client.query('ALTER TABLE children RENAME COLUMN first_name TO name');
            } else {
                console.log('Adding children.name...');
                await client.query('ALTER TABLE children ADD COLUMN name TEXT');
            }
        }
        if (!childCols.includes('age_band')) {
            console.log('Adding children.age_band...');
            await client.query('ALTER TABLE children ADD COLUMN age_band public.child_age_band');
        }

        // 2. Repair users
        console.log('Checking users table...');
        const userRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        const userCols = userRes.rows.map(r => r.column_name);

        const expectedUserCols = [
            ['first_name', 'TEXT'],
            ['email', 'TEXT UNIQUE'],
            ['whatsapp_number', 'TEXT UNIQUE'],
            ['origin_island', 'TEXT'],
            ['preferred_island_code', 'TEXT'],
            ['location_type', 'public.location_type'],
            ['consent_marketing', 'BOOLEAN DEFAULT false'],
            ['marketing_opt_in_whatsapp', 'BOOLEAN DEFAULT false'],
            ['preferred_channel', "public.preferred_channel DEFAULT 'email'"]
        ];

        for (const [col, type] of expectedUserCols) {
            if (!userCols.includes(col)) {
                console.log(`Adding users.${col}...`);
                try {
                    await client.query(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
                } catch (e) {
                    console.error(`Error adding users.${col}: ${e.message}`);
                }
            }
        }

        console.log('--- SUPER REPAIR COMPLETE ---');

    } catch (err) {
        console.error('FATAL REPAIR ERROR:', err.message);
    } finally {
        await client.end();
    }
}

superRepair();
