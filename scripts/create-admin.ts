import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function createAdminUser() {
    const { createAdminClient } = await import('../lib/admin');
    const admin = createAdminClient();

    const email = 'raykunjal@gmail.com';
    const password = 'Island4Life12$';

    console.log(`🚀 Resetting account for ${email}...`);

    let userId: string = '';
    const { data: { users } } = await admin.auth.admin.listUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
        const { data, error } = await admin.auth.admin.createUser({
            email, password, email_confirm: true
        });
        if (error) { console.error('Auth Error:', error); return; }
        userId = data.user.id;
    } else {
        userId = user.id;
        await admin.auth.admin.updateUserById(userId, { password });
    }

    // Insert into admin_users with only ID (safest)
    console.log('Inserting into admin_users...');
    const { error: aError } = await admin.from('admin_users').upsert({ id: userId });

    // If that fails, try with email
    if (aError) {
        console.log('Upsert with ID failed, trying with Email...');
        await admin.from('admin_users').upsert({ id: userId, email: email });
    }

    console.log('✨ Auth account ready. Run the SQL migration to fix columns and enable dashboard access!');
}

createAdminUser().catch(console.error);
