import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function inspectAdminTable() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    console.log('🔍 Inspecting admin_users table structure...');
    const { data, error } = await admin.from('admin_users').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Sample Row:', data);
        console.log('Columns:', data.length > 0 ? Object.keys(data[0]) : 'Table empty');
    }
}

inspectAdminTable().catch(console.error);
