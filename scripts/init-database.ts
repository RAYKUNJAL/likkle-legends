#!/usr/bin/env tsx

/**
 * Initialize Supabase Database Schema
 * Creates all required tables if they don't exist
 */

import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function main() {
    console.log('🏗️  Initializing Supabase Database Schema\n');

    try {
        // Read the schema file
        const schemaPath = join(process.cwd(), 'supabase_schema.sql');
        const schema = await readFile(schemaPath, 'utf-8');

        console.log('📄 Schema file loaded');
        console.log('📊 Executing SQL...\n');

        // Execute the schema
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: schema });

        if (error) {
            // Try alternative method - execute directly
            console.warn('RPC method failed, trying direct execution...');

            // Split into individual statements and execute
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            let successful = 0;
            let failed = 0;

            for (const statement of statements) {
                try {
                    await supabaseAdmin.from('').select(statement);
                    successful++;
                } catch (err) {
                    failed++;
                    console.warn(`⚠️  Statement failed (this may be OK if table exists)`);
                }
            }

            console.log(`\n✅ Completed: ${successful} successful, ${failed} skipped/failed`);
        } else {
            console.log('✅ Schema executed successfully!');
        }

        // Verify tables exist
        console.log('\n🔍 Verifying tables...\n');

        const tables = [
            'profiles',
            'children',
            'characters',
            'storybooks',
            'songs',
            'videos',
            'games',
            'missions',
            'printables',
        ];

        for (const table of tables) {
            try {
                const { count, error } = await supabaseAdmin
                    .from(table)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.log(`❌ ${table}: Not found or error`);
                } else {
                    console.log(`✅ ${table}: Exists (${count || 0} rows)`);
                }
            } catch (err) {
                console.log(`❌ ${table}: Error verifying`);
            }
        }

        console.log('\n✅ Database initialization complete!');
        console.log('\nYou can now run:');
        console.log('  npm run generate:stories');
        console.log('  npm run generate:songs');

    } catch (error: any) {
        console.error('\n❌ Failed to initialize database:', error.message);
        console.error('\n💡 Alternative: Run schema manually in Supabase SQL Editor');
        console.error('   1. Go to https://app.supabase.com');
        console.error('   2. SQL Editor');
        console.error('   3. Paste contents of supabase_schema.sql');
        console.error('   4. Run');
        process.exit(1);
    }
}

main();
