import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function applyMigration() {
    const migrationPath = path.join(process.cwd(), 'supabase', 'manual_migration_v5.sql');
    if (!fs.existsSync(migrationPath)) {
        console.error('❌ Migration file not found:', migrationPath);
        return;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('🚀 Applying manual_migration_v5.sql...');
        await client.connect();
        await client.query(sql);
        console.log('✅ Migration applied successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', (err as Error).message);
    } finally {
        await client.end();
    }
}

applyMigration();
