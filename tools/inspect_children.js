const { Client } = require('pg');
require('dotenv').config();

async function inspectTable() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'children'
        `);
        console.log(res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

inspectTable();
