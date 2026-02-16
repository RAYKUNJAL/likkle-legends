const { Client } = require('pg');
require('dotenv').config();

async function testWhole() {
    const password = 'Island4Life12$';
    const connStr = `postgresql://postgres:${encodeURIComponent(password)}@db.yvoyywnxaammsfwgjvkp.supabase.co:5432/postgres/sb_publishable_vV2w0TB3di5Isotg-A8RkA_QKw_LLIe`;

    console.log('Testing the "whole" connection string provided by user...');
    const client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('SUCCESS: The whole string worked!');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await client.end();
    }
}

testWhole();
