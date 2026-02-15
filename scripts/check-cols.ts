import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

async function checkColumns() {
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL missing in .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('📊 Column Check for "storybooks":');
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'storybooks'
        `);

        res.rows.forEach(row => {
            console.log(` - ${row.column_name}: ${row.data_type}`);
        });

    } catch (err: any) {
        console.error('💥 Error:', err.message);
    } finally {
        await client.end();
    }
}

checkColumns();
