const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const tables = res.rows.map(r => r.table_name);
        console.log(`Found ${tables.length} tables:`);
        console.log(tables.join('\n'));
    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

checkSchema();
