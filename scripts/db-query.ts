import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

async function query() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = process.argv[2];
        if (!sql) {
            console.error('No SQL provided');
            return;
        }
        const res = await client.query(sql);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err: any) {
        console.error('💥 Error:', err.message);
    } finally {
        await client.end();
    }
}

query();
