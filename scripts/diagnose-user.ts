import '../lib/load-env';
import { supabase, supabaseAdmin } from '../lib/supabase-client';

async function diagnoseUser(email: string) {
    console.log(`🔍 Diagnosing User: ${email}`);

    // 1. Check Auth User
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
        console.error('❌ Error listing users:', authError.message);
        return;
    }

    const authUser = users.find(u => u.email === email);
    if (!authUser) {
        console.log('❌ User not found in Supabase Auth.');
        return;
    }

    console.log('✅ User found in Auth:', {
        id: authUser.id,
        email: authUser.email,
        confirmed_at: authUser.email_confirmed_at,
        last_sign_in: authUser.last_sign_in_at
    });

    // 2. Check Public Profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (profileError) {
        console.log('❌ Profile error:', profileError.message);
    } else if (!profile) {
        console.log('❌ Profile record MISSING in public.profiles table.');
    } else {
        console.log('✅ Profile record found:', profile);
    }

    // 3. Check Children
    const { data: children, error: childrenError } = await supabaseAdmin
        .from('children')
        .select('*')
        .eq('parent_id', authUser.id);

    if (childrenError) {
        console.log('❌ Children query error:', childrenError.message);
    } else {
        console.log(`✅ Children found: ${children?.length || 0}`);
        children?.forEach(c => console.log(`   - ${c.first_name} (Age: ${c.age}, Track: ${c.age_track})`));
    }
}

const email = process.argv[2] || 'raykunjal@gmail.com';
diagnoseUser(email);
