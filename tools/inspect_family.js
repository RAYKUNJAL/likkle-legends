const { Client } = require('pg');
require('dotenv').config();

async function inspectSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const tables = ['children', 'family_members', 'family_groups'];

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
    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

inspectSchema();
