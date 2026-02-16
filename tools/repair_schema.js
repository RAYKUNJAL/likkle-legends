const { Client } = require('pg');
require('dotenv').config();

async function runRepair() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Repairing schema mismatches...');

        // 1. Repair Children table
        const childrenCols = await client.query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'children'
        `);
        const colNames = childrenCols.rows.map(r => r.column_name);

        if (colNames.includes('parent_id') && !colNames.includes('primary_user_id')) {
            console.log('Renaming children.parent_id to primary_user_id...');
            await client.query('ALTER TABLE children RENAME COLUMN parent_id TO primary_user_id');
        }

        // 2. Repair Users table
        const usersCols = await client.query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'users'
        `);
        const userColNames = usersCols.rows.map(r => r.column_name);

        const expectedUserCols = ['first_name', 'whatsapp_number', 'origin_island', 'preferred_island_code', 'location_type', 'consent_marketing', 'marketing_opt_in_whatsapp', 'preferred_channel'];

        for (const col of expectedUserCols) {
            if (!userColNames.includes(col)) {
                console.log(`Adding missing column users.${col}...`);
                // Note: Types might vary, but we'll use TEXT/BOOLEAN as per schema.sql
                let type = 'TEXT';
                if (col.startsWith('consent_') || col.startsWith('marketing_')) type = 'BOOLEAN DEFAULT false';
                if (col === 'preferred_channel') type = 'public.preferred_channel DEFAULT \'email\'';
                if (col === 'location_type') type = 'public.location_type';

                try {
                    await client.query(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
                } catch (e) {
                    console.error(`Error adding ${col}: ${e.message}`);
                }
            }
        }

        console.log('✅ Schema repair complete. Retrying db_init...');

    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

runRepair();
