import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function debugBuckets() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    console.log('--- DEBUG STORAGE BUCKETS ---');
    const { data: buckets, error } = await admin.storage.listBuckets();

    if (error) {
        console.error('ListBuckets Error:', error);
        return;
    }

    if (!buckets || buckets.length === 0) {
        console.log('No buckets found.');
    } else {
        console.table(buckets.map(b => ({
            name: b.name,
            id: b.id,
            public: b.public,
            created: b.created_at
        })));
    }
}

debugBuckets().catch(console.error);
