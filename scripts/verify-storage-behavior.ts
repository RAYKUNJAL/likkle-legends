import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function verifyBehavior() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const fake = 'this-bucket-does-not-exist-at-all-123';
    console.log(`🔍 Testing non-existent bucket: "${fake}"`);
    const { data, error } = await admin.storage.from(fake).list();
    if (error) {
        console.log(`❌ Error correctly received: ${error.message}`);
    } else {
        console.log(`⚠️ NO ERROR received for non-existent bucket. Data:`, data);
    }
}

verifyBehavior().catch(console.error);
