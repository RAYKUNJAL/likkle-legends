import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function listBucketsDetailed() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const { data: buckets, error } = await admin.storage.listBuckets();
    if (error) {
        console.error(error);
        return;
    }

    console.log('--- ALL BUCKETS ---');
    buckets.forEach(b => console.log(`- ${b.name} (${b.public ? 'Public' : 'Private'})`));
    console.log('------------------');
}

listBucketsDetailed().catch(console.error);
