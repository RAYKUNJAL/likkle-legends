import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function seedAdmin() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const email = 'raykunjal@gmail.com';
    const password = 'Island4Life12$';

    console.log(`🌱 Seeding final admin data for ${email}...`);

    // 1. Get the user ID from Auth
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
        console.error('❌ Failed to list users:', listError.message);
        return;
    }

    const authUser = users.find(u => u.email === email);
    if (!authUser) {
        console.error('❌ User not found in Auth. Please make sure you signed up.');
        return;
    }

    console.log(`✅ Found Auth User ID: ${authUser.id}`);

    // 2. Clear then Insert into public.users
    console.log('🔄 Syncing public.users...');
    const { error: uError } = await admin.from('users').upsert({
        id: authUser.id,
        email: email,
        first_name: 'Ray',
        role: 'admin'
    });

    if (uError) {
        console.error('❌ Error in public.users:', uError.message);
    } else {
        console.log('✅ public.users synced.');
    }

    // 3. Clear then Insert into admin_users
    console.log('🔄 Syncing admin_users...');
    const { error: aError } = await admin.from('admin_users').upsert({
        id: authUser.id,
        email: email,
        role: 'super_admin'
    });

    if (aError) {
        console.error('❌ Error in admin_users:', aError.message);
    } else {
        console.log('✅ admin_users synced.');
    }

    console.log('\n✨ ALL DONE! Your account is now fully synced as a Super Admin.');
}

seedAdmin().catch(console.error);
