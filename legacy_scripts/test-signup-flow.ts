
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = serviceKey ? createClient(supabaseUrl, serviceKey) : null;

async function runTest() {
    const randomStr = Math.random().toString(36).substring(7);
    const email = `test.${randomStr}@likklelegends.com`;
    const password = 'TestPassword123!';

    console.log('--- SIGNUP FLOW TEST ---');
    console.log(`Step 1: Signing up ${email}...`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test Parent',
                child_name: 'Test Child',
                chosen_plan: 'legends_plus'
            }
        }
    });

    if (authError) {
        console.error('❌ Step 1 Failed:', authError.message);
        return;
    }
    console.log('✅ Step 1 Success: User created in Auth');

    const userId = authData.user?.id;
    if (!userId) return;

    console.log(`Step 2: Checking profile for ${userId} (Anon Client)...`);
    console.log('🕒 Waiting 3s for trigger...');
    await new Promise(r => setTimeout(r, 3000));

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('❌ Step 2 Failed:', profileError.message);
        if (profileError.message.includes('recursion')) {
            console.error('!!! RECURSION ERROR DETECTED !!!');
        }
    } else {
        console.log('✅ Step 2 Success: Profile found with Anon Client');
        console.log(profile);
    }

    if (adminClient) {
        console.log('Step 3: Checking profile with Admin Client (Bypass RLS)...');
        const { data: adminProfile, error: adminProfileError } = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (adminProfileError) {
            console.error('❌ Step 3 Failed:', adminProfileError.message);
        } else {
            console.log('✅ Step 3 Success: Profile exists in DB');
            console.log(adminProfile);
        }
    }

    console.log('------------------------');
}

runTest();
