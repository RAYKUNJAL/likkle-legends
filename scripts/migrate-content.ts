import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not defined in environment variables');
        process.exit(1);
    }

    const { Client } = pg;
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔄 Connecting to database...');
        await client.connect();

        const migrationPath = join(process.cwd(), 'supabase/migrations/20240214_professional_content.sql');
        const sql = await readFile(migrationPath, 'utf-8');

        console.log('📄 Migration file loaded');
        console.log('📊 Executing SQL...\n');

        await client.query(sql);

        console.log('✅ Professional Content Schema applied successfully!');
    } catch (error: any) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
