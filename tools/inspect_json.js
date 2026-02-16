const { Client } = require('pg');
require('dotenv').config();

async function inspectSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const results = {};

        const tables = ['users', 'children', 'family_groups', 'family_members', 'site_settings'];
        for (const table of tables) {
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            results[table] = res.rows;
        }

        const enums = await client.query(`
            SELECT t.typname, array_agg(e.enumlabel) as labels
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid
            GROUP BY t.typname
        `);
        results.enums = enums.rows;

        process.stdout.write('---JSON_START---\n');
        process.stdout.write(JSON.stringify(results, null, 2));
        process.stdout.write('\n---JSON_END---\n');

    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

inspectSchema();
