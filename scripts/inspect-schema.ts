import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function inspectSchema() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    // Query information_schema directly
    const { data: usersInfo, error: uError } = await admin
        .from('users')
        .select('*')
        .limit(1);

    if (uError) {
        console.log('Error selecting from users:', uError.message);
    } else {
        console.log('Users columns (keys):', Object.keys(usersInfo[0] || {}));
    }

    const { data: adminInfo, error: aError } = await admin
        .from('admin_users')
        .select('*')
        .limit(1);

    if (aError) {
        console.log('Error selecting from admin_users:', aError.message);
    } else {
        console.log('Admin Users columns (keys):', Object.keys(adminInfo[0] || {}));
    }
}

inspectSchema().catch(console.error);
