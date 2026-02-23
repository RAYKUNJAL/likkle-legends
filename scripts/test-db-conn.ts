import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        console.log('✅ Connected to Database successfully!');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Connected to:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ Database connection failed:', (err as Error).message);
    }
}

testDb();
