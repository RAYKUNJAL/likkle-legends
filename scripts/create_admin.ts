import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing configuration.');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const EMAIL = 'raykunjal@gmail.com';
const PASSWORD = 'Island4Life12$';

async function main() {
    console.log(`🚀 Setting up admin user: ${EMAIL}...`);

    try {
        let userId: string;
        let isNewUser = false;

        // 1. Check if user exists
        // We iterate through listUsers to find the email manually since search is limited
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });

        if (listError) throw listError;

        const existingUser = users.find(u => u.email?.toLowerCase() === EMAIL.toLowerCase());

        if (existingUser) {
            console.log('ℹ️  User account already exists.');
            userId = existingUser.id;

            // Update password to ensure they can login
            console.log('🔄 Updating password...');
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                {
                    password: PASSWORD,
                    email_confirm: true,
                    user_metadata: { full_name: 'Ray Admin' }
                }
            );

            if (updateError) throw updateError;
            console.log('✅ Password updated.');

        } else {
            console.log('✨ Creating new user account...');
            const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: EMAIL,
                password: PASSWORD,
                email_confirm: true,
                user_metadata: { full_name: 'Ray Admin' }
            });

            if (createError) throw createError;
            if (!data.user) throw new Error('User creation returned no data');

            userId = data.user.id;
            isNewUser = true;
            console.log('✅ User account created.');
        }

        // 2. Ensure Profile Exists
        console.log('👤 Updating user profile...');
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: EMAIL,
                full_name: 'Ray Admin',
                role: 'admin', // Explicitly set role in profiles too
                subscription_tier: 'family_legacy', // Give full access
                subscription_status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('⚠️  Profile upsert warning:', profileError.message);
        } else {
            console.log('✅ Profile updated.');
        }

        // 3. Grant Super Admin Privileges
        console.log('🛡️  Granting Super Admin privileges...');
        const { error: adminError } = await supabaseAdmin
            .from('admin_users')
            .upsert({
                id: userId,
                role: 'super_admin',
                permissions: ['all']
            });

        if (adminError) {
            throw new Error(`Failed to update admin_users table: ${adminError.message}`);
        }

        console.log('✅ Admin privileges granted.');

        console.log('\n🎉 SUCCESS! Admin user setup complete.');
        console.log(`👉 You can now log in at: https://likklelegends.com/login`);
        console.log(`📧 Email: ${EMAIL}`);
        console.log(`🔑 Password: ${PASSWORD}`);
        console.log(`⚡ Admin Dashboard: https://likklelegends.com/admin`);

    } catch (error: any) {
        console.error('\n❌ FAILED:', error.message);
        process.exit(1);
    }
}

main();
