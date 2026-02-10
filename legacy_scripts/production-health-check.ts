
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCheck() {
    console.log('🚀 Starting Production-Grade Health Check...\n');

    // 1. Environment Variables Audit
    const requiredEnv = [
        'GEMINI_API_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
        'PAYPAL_CLIENT_SECRET',
        'RESEND_API_KEY',
        'OPENAI_API_KEY'
    ];

    console.log('📋 Checking Environment Variables:');
    requiredEnv.forEach(env => {
        if (process.env[env]) {
            console.log(`  ✅ ${env} is set`);
        } else {
            console.log(`  ❌ ${env} is MISSING`);
        }
    });

    // 2. Database Table Integrity
    const criticalTables = ['profiles', 'children', 'storybooks', 'songs', 'printables', 'admin_users'];
    console.log('\n🗄️ Checking Database Tables:');

    for (const table of criticalTables) {
        const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`  ❌ ${table}: Error - ${error.message}`);
        } else {
            console.log(`  ✅ ${table}: Online (${count} records)`);
        }
    }

    // 3. Storage Bucket Accessibility
    const criticalBuckets = ['content-images', 'characters', 'songs', 'printables'];
    console.log('\n📦 Checking Storage Buckets:');

    for (const bucket of criticalBuckets) {
        const { data, error } = await supabase.storage.getBucket(bucket);
        if (error) {
            console.log(`  ❌ ${bucket}: Error - ${error.message}`);
        } else {
            console.log(`  ✅ ${bucket}: Found (Public: ${data.public})`);
        }
    }

    // 4. Admin Access Check
    console.log('\n👮 Checking Super Admin Access:');
    const { data: adminUsers } = await supabase.from('admin_users').select('email');
    if (adminUsers && adminUsers.length > 0) {
        console.log(`  ✅ Found ${adminUsers.length} registered admins`);
    } else {
        console.log('  ⚠️ No users in admin_users table (Dev overrides may apply)');
    }

    console.log('\n✨ Health Check Complete.');
}

runCheck().catch(console.error);
