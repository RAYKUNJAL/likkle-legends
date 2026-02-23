import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function checkTables() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    console.log('🔍 Checking for tables or views with "Tanty" in name...');
    const { data: tables, error } = await admin
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .ilike('tablename', '%tanty%');

    // Note: the above might not work if 'pg_tables' isn't accessible via PostgREST
    // Let's try a direct query if possible, or just list common suspected tables

    try {
        const { data: songsTable } = await admin.from('songs').select('count');
        console.log('Songs table exists.');
    } catch (e) { }

    // Let's try to list all tables via RPC or just query information_schema if enabled
    const { data: schemaTables, error: schemaError } = await admin
        .rpc('get_tables'); // If we have this rpc

    if (schemaError) {
        console.log('RPC get_tables failed. Trying direct query on information_schema...');
    }
}

checkTables().catch(console.error);
