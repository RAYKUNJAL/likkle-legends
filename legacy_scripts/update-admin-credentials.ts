
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing URL or Service Key in .env.local');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    const email = 'raykunjal@gmail.com';
    const newPassword = 'Island4Life12$';

    console.log(`Testing admin update for: ${email}`);

    // 1. Find User by Email (to get ID)
    // Note: admin.updateUserById is preferred if we had ID, but we can't search by email directly in all versions easily without listing.
    // Actually, listUsers can filter, or we can just treat it as an update if we knew ID.
    // But wait, there is no generic "getUserByEmail" in admin api exposed simply, 
    // however, we can direct update by email? No, update user requires ID usually.
    // Let's list users to find the ID.

    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Failed to list users:', listError);
        return;
    }

    const user = listData.users.find(u => u.email === email);

    if (!user) {
        console.error(`❌ User ${email} not found.`);
        // Optional: Create the user if they don't exist?
        // console.log("Creating user...");
        // await supabaseAdmin.auth.admin.createUser({ email, password: newPassword, email_confirm: true });
        return;
    }

    console.log(`✅ Found user: ${user.id}`);

    // 2. Update Password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (updateError) {
        console.error('❌ Failed to update password:', updateError);
        return;
    }

    console.log('✅ Password updated successfully.');

    // 3. Ensure Admin Privileges (in profiles table)
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
            role: 'admin',
            is_admin: true
        })
        .eq('id', user.id);

    if (profileError) {
        console.error('❌ Failed to update profiles table:', profileError);
    } else {
        console.log('✅ Updated profiles table (role=admin).');
    }

    // 4. Ensure Admin Privileges (in admin_users table)
    const { error: adminTableError } = await supabaseAdmin
        .from('admin_users')
        .upsert({
            id: user.id,
            role: 'super_admin',
            permissions: ['all']
        });

    if (adminTableError) {
        console.error('❌ Failed to update admin_users table:', adminTableError);
    } else {
        console.log('✅ Updated admin_users table.');
    }

    console.log('\n🎉 Admin Access Fully Configured!');
    console.log(`User: ${email}`);
    console.log(`Pass: ${newPassword}`);
}

main();
