
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runRepair() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Missing Supabase environment variables');
        process.exit(1);
    }

    const supabase = createClient(url, key);
    const sqlPath = path.join(process.cwd(), 'REPAIR_ADMIN_CENTER.sql');

    if (!fs.existsSync(sqlPath)) {
        console.error(`SQL file not found at ${sqlPath}`);
        return;
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Starting Admin Center Repair...');

    // We use the common 'exec_sql' pattern if available
    // Note: This script assumes the exec_sql RPC function exists or that you can run it.
    // If it fails, please run the SQL manually in Supabase SQL Editor.

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ Repair failed via RPC:', error.message);
        console.log('\n--- MANUAL ACTION REQUIRED ---');
        console.log('Please copy the contents of REPAIR_ADMIN_CENTER.sql and run it manually in the Supabase SQL Editor.');
    } else {
        console.log('✅ Admin Center Repair completed successfully!');
    }
}

runRepair();
