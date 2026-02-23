import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New Project Info
const NEW_URL = 'https://qelvtlcxevuiwlckzdgu.supabase.co';
const NEW_KEY = 'sb_secret_uOn_2sM6bHqgTXfKaAPmRg_vAVX7829';

async function testConnection() {
    console.log('🔗 Testing connection to NEW Supabase project...');
    const supabase = createClient(NEW_URL, NEW_KEY);

    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('❌ Connection failed:', error.message);
            return;
        }

        console.log('✅ Connected successfully!');
        console.log('📁 Buckets found:', buckets.map(b => b.name));

        // Scan for "Tanty spice radio"
        for (const bucket of buckets) {
            console.log(`\n📄 Scanning bucket: ${bucket.name}`);
            const { data: files } = await supabase.storage.from(bucket.name).list();
            console.log(`Contents:`, files?.map(f => f.name));
        }
    } catch (err: any) {
        console.error('💥 Fatal error during test:', err.message);
    }
}

testConnection();
