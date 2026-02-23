import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function checkFinalStatus() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const email = 'raykunjal@gmail.com';

    console.log(`🔍 Checking status for ${email}...`);

    // Check admin_users
    const { data: adminData } = await admin.from('admin_users').select('*').eq('email', email).maybeSingle();
    console.log('Admin User Table:', adminData);

    // Check profiles (view)
    const { data: profileData } = await admin.from('profiles').select('*').eq('email', email).maybeSingle();
    console.log('Profile View:', profileData);
}

checkFinalStatus().catch(console.error);
