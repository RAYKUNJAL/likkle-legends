
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    console.error('❌ Missing Supabase keys in .env.local');
    process.exit(1);
}

// Admin client to delete user if needed and check profiles
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Client for signup
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function testDBSignup() {
    console.log('--- DB SIGNUP TEST ---');

    // 1. Random email
    const email = `test.db.${Date.now()}@likklelegends.com`;
    const password = 'TestPassword123!';

    console.log(`Creating user: ${email}`);

    // 2. Sign up
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test DB User',
                plan: 'free'
            }
        }
    });

    if (authError) {
        console.error('❌ Auth SignUp Failed:', authError.message);
        return;
    }

    const userId = authData.user?.id;
    console.log(`✅ Auth User Created: ${userId}`);

    if (!userId) {
        console.error('❌ No User ID returned');
        return;
    }

    // 3. Check Profile (wait a bit for trigger)
    console.log('Waiting 2s for trigger...');
    await new Promise(r => setTimeout(r, 2000));

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('❌ Profile NOT found (Trigger failed?):', profileError.message);
    } else {
        console.log('✅ Profile Created Successfully:', profile);
    }

    // Cleanup
    console.log('Cleaning up...');
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delError) console.error('Cleanup failed:', delError.message);
    else console.log('Cleanup done.');
}

testDBSignup();
