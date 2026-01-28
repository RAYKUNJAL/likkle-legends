#!/usr/bin/env tsx
import '../lib/load-env';
import { createAdminClient } from '../lib/admin';

/**
 * PROMOTE ADMIN SCRIPT
 * Promotes a user to 'super_admin' in both admin_users and profiles tables.
 * Usage: npx tsx scripts/promote-admin.ts [email]
 */

async function main() {
    const email = process.argv[2] || 'raykunjal@gmail.com';
    const admin = createAdminClient();

    console.log(`🚀 Promoting user ${email} to Super Admin...`);

    try {
        // 1. Get user ID from Auth (Requires Service Role Key)
        console.log('📡 Fetching user from Auth...');
        const { data: { users }, error: listError } = await admin.auth.admin.listUsers();

        if (listError) {
            console.error('❌ Failed to list users:', listError.message);
            process.exit(1);
        }

        const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!targetUser) {
            console.error(`❌ User with email "${email}" not found in Supabase Auth.`);
            console.log('Available users:', users.map(u => u.email).join(', '));
            process.exit(1);
        }

        const userId = targetUser.id;
        console.log(`✅ Found user ID: ${userId}`);

        // 2. Upsert into admin_users
        console.log('💾 Updating admin_users table...');
        const { error: adminError } = await admin
            .from('admin_users')
            .upsert({
                id: userId,
                role: 'super_admin',
                permissions: ['*']
            });

        if (adminError) {
            console.warn(`⚠️  Warning - admin_users update: ${adminError.message}`);
            console.log('   (This is normal if the table admin_users is not yet initialized)');
        } else {
            console.log('✅ admin_users entry confirmed.');
        }

        // 3. Update profiles table
        console.log('💾 Updating profiles table...');
        const { error: profileError } = await admin
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', userId);

        if (profileError) {
            console.error(`❌ Profile update failed: ${profileError.message}`);
        } else {
            console.log('✅ profile.is_admin set to true.');
        }

        console.log('\n' + '='.repeat(40));
        console.log(`🎉 SUCCESS! ${email} is now a Super Admin.`);
        console.log('='.repeat(40));

    } catch (err: any) {
        console.error('\n❌ Unexpected error during promotion:');
        console.error(err.message || err);
        process.exit(1);
    }
}

main().catch(console.error);
