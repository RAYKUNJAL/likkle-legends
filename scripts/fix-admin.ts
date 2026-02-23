import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function findUserId() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const email = 'raykunjal@gmail.com';
    console.log(`🔍 Looking for User ID for ${email} in public.users...`);

    const { data: user, error } = await admin
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    if (user) {
        console.log(`✅ Found User ID: ${user.id}`);

        console.log('Adding to admin_users...');
        const { error: insError } = await admin
            .from('admin_users')
            .upsert({ id: user.id, email: email, role: 'super_admin' });

        if (insError) {
            console.error('❌ Failed to add admin:', insError.message);
        } else {
            console.log('✅ Successfully added as super_admin.');
        }
    } else {
        console.log(`⚠️ User ${email} not found in public.users. Have you signed up on this new project yet?`);
    }
}

findUserId().catch(console.error);
