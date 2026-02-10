const { Client } = require('pg');

async function testConn() {
    const client = new Client({
        user: 'postgres',
        host: 'aws-1-us-east-1.pooler.supabase.com',
        database: 'postgres',
        password: 'Island4Life12$',
        port: 6543,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected to pooler using postgres user!');
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
