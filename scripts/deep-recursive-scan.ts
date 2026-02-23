import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function deepRecursiveScan() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets) return;

    for (const bucket of buckets) {
        console.log(`\nScanning Bucket: ${bucket.name}`);
        await scanFolder(admin, bucket.name, '');
    }
}

async function scanFolder(admin: any, bucket: string, path: string) {
    const { data: items, error } = await admin.storage.from(bucket).list(path, { limit: 100 });
    if (error) return;

    for (const item of items) {
        const fullPath = path ? `${path}/${item.name}` : item.name;
        if (item.id) {
            if (item.name.toLowerCase().includes('tanty')) {
                console.log(`  [FILE] ${fullPath}`);
            }
        } else {
            console.log(`  [DIR ] ${fullPath}`);
            if (item.name.toLowerCase().includes('tanty')) {
                console.log(`  ✨ MATCH!`);
            }
            // Recurse
            await scanFolder(admin, bucket, fullPath);
        }
    }
}

deepRecursiveScan().catch(console.error);
