const { Client } = require('pg');
require('dotenv').config();

async function testDirect() {
    const password = 'Island4Life12$';
    const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.yvoyywnxaammsfwgjvkp.supabase.co:5432/postgres`;

    console.log('Testing direct connection to db.yvoyywnxaammsfwgjvkp.supabase.co...');
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected directly to Supabase DB!');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

testDirect();
