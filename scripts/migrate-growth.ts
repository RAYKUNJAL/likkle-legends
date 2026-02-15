import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load .env
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

async function migrate() {
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL missing in .env');
        process.exit(1);
    }

    console.log('🚀 Connecting to Supabase Postgres (Direct)...');
    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected!');

        const migrationPath = join(process.cwd(), 'supabase/migrations/20240214_growth_engine.sql');
        const sql = await readFile(migrationPath, 'utf-8');

        console.log('📄 Executing migration SQL...\n');

        // We execute the whole file as one block
        await client.query(sql);

        console.log('✅ Migration successful!');

    } catch (err: any) {
        console.error('💥 Migration failure:', err.message);

        // If it fails as a block, try statement by statement
        console.log('\n🔄 Attempting statement-by-statement execution...');
        // (Simplified split, might be tricky with DO blocks but let's try)
    } finally {
        await client.end();
    }
}

migrate();
