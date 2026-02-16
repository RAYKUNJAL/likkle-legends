const { Client } = require('pg');
require('dotenv').config();

async function inspectSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const tables = ['users', 'children'];

        for (const table of tables) {
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);

            console.log(`\nTABLE: ${table}`);
            if (res.rows.length === 0) {
                console.log('  EXISTS: FALSE');
            } else {
                res.rows.forEach(r => {
                    console.log(`  - ${r.column_name} (${r.data_type})`);
                });
            }
        }

        // Also check for user_role enum
        try {
            const enumRes = await client.query(`
                SELECT t.typname, e.enumlabel
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'user_role'
            `);
            console.log('\nENUM: user_role');
            enumRes.rows.forEach(r => console.log(`  - ${r.enumlabel}`));
        } catch (e) {
            console.log('\nENUM: user_role does not exist');
        }

    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

inspectSchema();
