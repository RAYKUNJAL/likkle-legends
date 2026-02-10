const { Client } = require('pg');

async function testFinal() {
    const password = 'Island4Life12$';
    const encodedPassword = encodeURIComponent(password);
    const connectionString = `postgresql://postgres.yvoyywnxaammsfwgjvkp:${encodedPassword}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;

    console.log('Testing with URL Encoded Connection String...');
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ SUCCESS: Connected with URL encoding!');
        const res = await client.query('SELECT NOW()');
        console.log('DB Time:', res.rows[0]);
    } catch (err) {
        console.error('❌ URL Encoding Failed:', err.message);

        console.log('\nTesting with Object Config (Literal Password)...');
        const clientObj = new Client({
            user: 'postgres.yvoyywnxaammsfwgjvkp',
            host: 'aws-1-us-east-1.pooler.supabase.com',
            database: 'postgres',
            password: password,
            port: 6543,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await clientObj.connect();
            console.log('✅ SUCCESS: Connected with Object Config!');
            const res = await clientObj.query('SELECT NOW()');
            console.log('DB Time:', res.rows[0]);
        } catch (errObj) {
            console.error('❌ Object Config Failed:', errObj.message);
            console.log('\nIf both failed, please verify the password in Supabase Dashboard > Settings > Database > Reset Database Password.');
        } finally {
            await clientObj.end();
        }
    } finally {
        await client.end();
    }
}

testFinal();
