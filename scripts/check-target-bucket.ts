import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function checkSpecificBucket() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const name = 'tantyspice radio'; // EXACT name user mentioned
    console.log(`🔍 Checking bucket by name: "${name}"`);

    const { data: bucket, error: bError } = await admin.storage.getBucket(name);
    if (bError) {
        console.log(`❌ Bucket GET error: ${bError.message}`);
    } else {
        console.log(`✅ Bucket details:`, bucket);
    }

    const { data: files, error } = await admin.storage.from(name).list();
    if (error) {
        console.log(`❌ List error: ${error.message}`);
    } else {
        console.log(`✅ Found ${files.length} items in "${name}":`, files.map(f => f.name));
    }

    // Try slugified versions
    const slug = 'tantyspice-radio';
    console.log(`\n🔍 Checking slugified: "${slug}"`);
    const { data: sFiles, error: sError } = await admin.storage.from(slug).list();
    if (sError) {
        console.log(`❌ Slugified error: ${sError.message}`);
    } else {
        console.log(`✅ Found ${sFiles?.length} items in "${slug}":`, sFiles?.map(f => f.name));
    }
}

checkSpecificBucket().catch(console.error);
