import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function exhaustiveMusicSearch() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets) return;

    console.log('🔍 EXHAUSTIVE MUSIC SEARCH');
    console.log('Searching for "Tanty spice radio" in all buckets...\n');

    for (const bucket of buckets) {
        console.log(`Checking bucket: ${bucket.name}`);
        const { data: files, error } = await admin.storage.from(bucket.name).list('', { limit: 100 });

        if (error) {
            console.log(`  ❌ ${error.message}`);
            continue;
        }

        for (const file of files) {
            if (file.name.toLowerCase().includes('tanty')) {
                console.log(`  ✨ MATCH FOUND: [Bucket: ${bucket.name}] ${file.id ? 'File' : 'Folder'}: "${file.name}"`);

                if (!file.id) {
                    // Folder match, list contents
                    const { data: folderFiles } = await admin.storage.from(bucket.name).list(file.name);
                    folderFiles?.forEach(f => console.log(`     └─ ${f.name}`));
                }
            }
        }
    }
    console.log('\nSearch complete.');
}

exhaustiveMusicSearch().catch(console.error);
