require('dotenv').config();
const { Client } = require('pg');

async function testConn() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected to pooler using DATABASE_URL!');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('FAILURE:', err.message);
        console.error('Full Error Code:', err.code);
    } finally {
        await client.end();
    }
}

testConn();
