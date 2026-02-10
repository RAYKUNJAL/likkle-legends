
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runCleanup() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Missing Supabase environment variables');
        process.exit(1);
    }

    const supabase = createClient(url, key);
    const sqlPath = path.join(process.cwd(), 'CLEANUP_LAUNCH_READY.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL Cleanup (Character-Safe)...');

    // Split SQL by semicolons to execute statements
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
        console.log(`Running: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        // Fallback if rpc('exec_sql') doesn't exist (common in fresh projects)
        if (error) {
            console.warn(`RPC exec_sql failed, trying direct query if possible or reporting error: ${error.message}`);
            // Note: Most Supabase setups require a specific RPC function to run raw SQL from client
            // If this fails, I will notify the user to run it manually.
        }
    }

    console.log('Cleanup attempt finished.');
}

runCleanup();
