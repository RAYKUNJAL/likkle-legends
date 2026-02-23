import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function verifyAdmin() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const email = 'raykunjal@gmail.com';
    console.log(`🔐 Checking admin status for ${email} on the new project...`);

    const { data: adminUser, error } = await admin
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error('❌ Error checking admin users:', error.message);
        return;
    }

    if (adminUser) {
        console.log(`✅ ${email} is already an admin.`);
    } else {
        console.log(`⚠️ ${email} is NOT an admin. Adding them now...`);
        const { error: insertError } = await admin
            .from('admin_users')
            .insert({ email: email, role: 'super_admin' });

        if (insertError) {
            console.error('❌ Failed to add admin:', insertError.message);
        } else {
            console.log(`✅ ${email} successfully added as super_admin.`);
        }
    }
}

verifyAdmin().catch(console.error);
