const { Client } = require('pg');
require('dotenv').config();

async function testConn() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected to Supabase via DATABASE_URL!');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time from DB:', res.rows[0]);
    } catch (err) {
        console.error('FAILURE: Could not connect to Supabase.');
        console.error(err);
    } finally {
        await client.end();
    }
}

testConn();
