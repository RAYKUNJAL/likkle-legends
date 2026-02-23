import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function exhaustiveScan() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets) return;

    for (const bucket of buckets) {
        console.log(`\n📂 SCANNING BUCKET: ${bucket.name}`);
        const { data: files, error } = await admin.storage.from(bucket.name).list('', {
            limit: 100,
            offset: 0
        });

        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
            continue;
        }

        if (files.length === 0) {
            console.log('   (Empty)');
            continue;
        }

        for (const file of files) {
            if (file.id) {
                console.log(`   📄 ${file.name}`);
            } else {
                console.log(`   📁 ${file.name}/`);
                const { data: subFiles } = await admin.storage.from(bucket.name).list(file.name);
                subFiles?.forEach(f => console.log(`      └─ ${f.name}`));
            }
        }
    }
}

exhaustiveScan().catch(console.error);
