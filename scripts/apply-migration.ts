import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { readFile } from 'fs/promises';

config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

async function migrate() {
    const filename = process.argv[2];
    if (!filename) {
        console.error('❌ Usage: npx ts-node scripts/apply-migration.ts <filename>');
        process.exit(1);
    }

    if (!databaseUrl) {
        console.error('❌ DATABASE_URL missing in .env');
        process.exit(1);
    }

    console.log(`🚀 Applying migration: ${filename}...`);
    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const migrationPath = join(process.cwd(), 'supabase/migrations', filename);
        const sql = await readFile(migrationPath, 'utf-8');

        console.log('📄 Executing SQL...');
        await client.query(sql);

        console.log('✅ Migration successful!');

    } catch (err: any) {
        console.error('💥 Migration failure:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
