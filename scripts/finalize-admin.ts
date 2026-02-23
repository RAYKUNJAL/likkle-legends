import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function checkAdmin() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const email = 'raykunjal@gmail.com';
    console.log(`🔍 Finalizing admin setup for ${email}...`);

    // 1. Check if user exists in public.users
    const { data: user, error: userError } = await admin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (user) {
        console.log(`✅ Found user ID: ${user.id}`);
        const { error: insError } = await admin
            .from('admin_users')
            .upsert({ id: user.id, email: email, role: 'super_admin' });

        if (insError) console.error('❌ Upsert error:', insError.message);
        else console.log('🚀 Admin access granted!');
    } else {
        console.log(`⚠️ User ${email} still not found in new project. Please sign up first!`);
    }
}

checkAdmin().catch(console.error);
