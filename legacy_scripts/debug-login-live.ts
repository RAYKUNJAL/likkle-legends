
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    const email = 'raykunjal@gmail.com';
    const password = 'Island4Life12$';

    console.log(`Attempting login for: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('❌ Login Failed:', error.message);
        return;
    }

    if (data?.session) {
        console.log('✅ Login Successful!');
        console.log('User ID:', data.user.id);
        console.log('Access Token (truncated):', data.session.access_token.substring(0, 20) + '...');
        console.log('Role:', data.user.role);
    } else {
        console.log('⚠️ Login succeeded but no session returned (unexpected).');
    }
}

testLogin();
