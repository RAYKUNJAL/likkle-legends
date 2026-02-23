import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const BUCKETS = [
    'characters',
    'songs',
    'videos',
    'storybooks',
    'printables',
    'avatars',
    'vr-assets',
    'ar-models'
];

async function initializeStorageBuckets() {
    console.log('🚀 Creating Supabase Storage Buckets...');

    for (const bucketName of BUCKETS) {
        console.log(`📦 Checking/Creating bucket: ${bucketName}...`);
        const { error } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 52428800, // 50MB
        });

        if (error) {
            if (error.message.includes('already exists')) {
                console.log(`✅ Bucket "${bucketName}" already exists.`);
            } else {
                console.error(`❌ Failed to create bucket "${bucketName}":`, error.message);
            }
        } else {
            console.log(`✨ Created bucket "${bucketName}".`);
        }
    }

    console.log('\n✅ Storage Buckets initialized!');
}

initializeStorageBuckets();
