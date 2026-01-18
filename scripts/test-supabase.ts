#!/usr/bin/env tsx

/**
 * Supabase Connection Test & Diagnostics
 * Run this to verify your Supabase setup
 */

import '../lib/load-env';
import { supabaseManager, testSupabaseConnection, getSupabaseHealth } from '../lib/supabase-client';

async function main() {
    console.log('🔍 Supabase Connection Diagnostics\n');
    console.log('='.repeat(50));

    // 1. Environment Variables Check
    console.log('\n📋 Environment Variables:');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log(`  URL: ${url ? '✅ Set' : '❌ Missing'} ${url || ''}`);
    console.log(`  Anon Key: ${anonKey ? '✅ Set (' + anonKey.substring(0, 20) + '...)' : '❌ Missing'}`);
    console.log(`  Service Key: ${serviceKey ? '✅ Set (' + serviceKey.substring(0, 20) + '...)' : '❌ Missing'}`);

    if (!url || !anonKey) {
        console.error('\n❌ Missing required Supabase credentials!');
        console.error('   Please add to your .env.local:');
        console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
        console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
        console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-key');
        process.exit(1);
    }

    // 2. DNS Resolution Test
    console.log('\n🌐 DNS Resolution:');
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        console.log(`  Testing: ${hostname}`);

        // Note: Node doesn't have built-in DNS from URL, so we just log
        console.log(`  ⚠️  If connection fails, check that ${hostname} is accessible`);
    } catch (error) {
        console.error(`  ❌ Invalid URL format: ${url}`);
    }

    // 3. Connection Test
    console.log('\n🔌 Connection Test:');
    const connectionResult = await testSupabaseConnection();
    if (connectionResult.success) {
        console.log('  ✅ Successfully connected to Supabase');
    } else {
        console.error('  ❌ Connection failed:', connectionResult.error);
        console.error('\n💡 Troubleshooting steps:');
        console.error('  1. Verify your Supabase project is active');
        console.error('  2. Check that your API keys are correct');
        console.error('  3. Ensure network connectivity');
        console.error('  4. Check Supabase status: https://status.supabase.com');
    }

    // 4. Health Check
    console.log('\n🏥 Health Check:');
    const health = await getSupabaseHealth();
    console.log(`  Overall Status: ${health.status === 'healthy' ? '✅ Healthy' :
        health.status === 'degraded' ? '⚠️  Degraded' :
            '❌ Down'
        }`);
    console.log(`  Connection: ${health.details.connection ? '✅' : '❌'}`);
    console.log(`  Database: ${health.details.database ? '✅' : '❌'}`);
    console.log(`  Storage: ${health.details.storage ? '✅' : '❌'}`);

    // 5. Database Tables Check
    if (health.details.database) {
        console.log('\n📊 Database Tables:');
        try {
            const { supabase } = await import('../lib/supabase-client');

            const tables = [
                'profiles',
                'storybooks',
                'songs',
                'videos',
                'games',
                'missions',
                'characters',
            ];

            for (const table of tables) {
                try {
                    const { count, error } = await supabase
                        .from(table)
                        .select('*', { count: 'exact', head: true });

                    if (error) {
                        console.log(`  ❌ ${table}: Error - ${error.message}`);
                    } else {
                        console.log(`  ✅ ${table}: ${count || 0} rows`);
                    }
                } catch (err: any) {
                    console.log(`  ❌ ${table}: ${err.message}`);
                }
            }
        } catch (error: any) {
            console.error('  ❌ Failed to query tables:', error.message);
        }
    }

    // 6. Summary
    console.log('\n' + '='.repeat(50));
    if (health.status === 'healthy') {
        console.log('✅ All systems operational!');
        console.log('\nYou can now run:');
        console.log('  npm run generate:stories');
        console.log('  npm run generate:songs');
        console.log('  npm run generate:batch');
    } else {
        console.log('⚠️  System check completed with issues');
        console.log('Please fix the errors above before generating content');
    }

    console.log('');
}

main().catch(error => {
    console.error('\n❌ Diagnostic failed:', error);
    process.exit(1);
});
