import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function checkBuckets() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    console.log('🔍 Listing all storage buckets...');
    const { data: buckets, error } = await admin.storage.listBuckets();

    if (error) {
        console.error('❌ Error listing buckets:', error.message);
        return;
    }

    console.log('📁 Buckets found:', buckets.map(b => b.name));

    // Also try to list files in buckets that look like "tantyspice radio"
    for (const bucket of buckets) {
        if (bucket.name.toLowerCase().includes('tanty') || bucket.name.toLowerCase().includes('radio')) {
            console.log(`\n📄 Listing files in bucket: ${bucket.name}`);
            const { data: files, error: fileError } = await admin.storage.from(bucket.name).list();
            if (fileError) {
                console.error(`❌ Error listing files in ${bucket.name}:`, fileError.message);
            } else {
                console.log(`✅ Found ${files.length} files:`, files.map(f => f.name));
            }
        }
    }
}

checkBuckets().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
