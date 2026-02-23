import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBuckets() {
    console.log('🔍 Checking storage buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('❌ Error listing buckets:', error.message);
        return;
    }

    console.log('Current Buckets:', buckets.map(b => b.name));

    const requiredBuckets = ['songs', 'videos', 'images', 'avatars', 'characters'];
    for (const b of requiredBuckets) {
        if (!buckets.find(bucket => bucket.name === b)) {
            console.log(`⚠️ Bucket "${b}" is missing!`);
        } else {
            console.log(`✅ Bucket "${b}" exists.`);
        }
    }
}

checkBuckets();
