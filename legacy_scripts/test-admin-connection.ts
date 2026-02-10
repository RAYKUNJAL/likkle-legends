
import '../lib/load-env';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing Admin Connection...');
console.log('URL:', url);
console.log('Key Length:', serviceKey.length);
console.log('Key Snippet:', serviceKey.substring(0, 10) + '...');

if (!url || !serviceKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const client = createClient(url, serviceKey.trim(), {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

const anonClient = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
    auth: {
        persistSession: false,
    }
});

async function test() {
    console.log('\n--- Testing Anon Key ---');
    try {
        const { data, error } = await anonClient.from('training_materials').select('count').limit(1);
        if (error) {
            console.error('❌ Anon Error:', error.message);
        } else {
            console.log('✅ Anon Success! Data:', data);
        }
    } catch (e) { console.error(e) }

    console.log('\n--- Testing Service Key ---');
    try {
        const { data, error } = await client.from('storybooks').select('count').limit(1);
        if (error) {
            console.error('❌ Error:', error.message);
            console.error('Full Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Success! Data:', data);
        }
    } catch (err) {
        console.error('❌ Exception:', err);
    }
}

test();
