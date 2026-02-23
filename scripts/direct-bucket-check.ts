import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function directBucketCheck() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const name = 'Tanty spice radio';
    console.log(`Checking exact bucket name: "${name}"`);
    const { data, error } = await admin.storage.getBucket(name);

    if (error) {
        console.log(`❌ Error: ${error.message}`);
    } else {
        console.log(`✅ FOUND BUCKET:`, data);
        const { data: files } = await admin.storage.from(name).list();
        console.log(`Items in bucket:`, files?.map(f => f.name));
    }

    const name2 = 'tantyspice radio';
    console.log(`\nChecking name2: "${name2}"`);
    const { data: data2, error: error2 } = await admin.storage.getBucket(name2);
    if (!error2) console.log(`✅ FOUND BUCKET:`, data2);
}

directBucketCheck().catch(console.error);
