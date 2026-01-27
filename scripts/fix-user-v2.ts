import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function fixUser(email: string) {
    console.log(`🛠️ Finalizing Profile for: ${email}`);

    // 1. Get Auth User
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const authUser = users.find(u => u.email === email);
    if (!authUser) {
        console.error('❌ User not found in Auth.');
        return;
    }

    console.log('✅ Found Auth User:', authUser.id);

    // 2. Upsert Profile with all commercial columns
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: 'Ray Legend',
            role: 'parent',
            subscription_tier: 'legends_plus',
            subscription_status: 'active',
            onboarding_completed: true,
            country_code: 'US',
            currency: 'USD'
        });

    if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
    } else {
        console.log('✅ Commercial Profile created/updated successfully.');
    }

    // 3. Create a Child (Portal requires at least one child)
    const { error: childError } = await supabaseAdmin
        .from('children')
        .upsert({
            parent_id: authUser.id,
            first_name: 'Likkle Ray',
            age: 5,
            age_track: 'mini',
            avatar_id: 'roti',
            total_xp: 1500,
            current_level: 2
        });

    if (childError) {
        console.error('❌ Error creating child:', childError.message);
    } else {
        console.log('✅ High-engagement child record created.');
    }

    console.log('🎉 System synced! You should now be able to log in and see the full dashboard.');
}

const email = process.argv[2] || 'raykunjal@gmail.com';
fixUser(email);
