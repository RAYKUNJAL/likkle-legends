import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    try {
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240217_create_otp_codes.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Connecting to database...');
        await client.connect();

        console.log('Running migration...');
        await client.query(sql);

        console.log('Migration successful: 20240217_create_otp_codes.sql');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
