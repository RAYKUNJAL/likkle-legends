const { Client } = require('pg');

async function testConn() {
    const client = new Client({
        connectionString: "postgresql://postgres.yvoyywnxaammsfwgjvkp:Island4Life12$@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected to pooler!');
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
