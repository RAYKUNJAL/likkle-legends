const { Client } = require('pg');
require('dotenv').config();

async function testConn() {
    const client = new Client({
        user: 'postgres',
        host: 'db.yvoyywnxaammsfwgjvkp.supabase.co',
        database: 'postgres',
        password: 'Island4Life12$',
        port: 5432,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected to Supabase!');
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
