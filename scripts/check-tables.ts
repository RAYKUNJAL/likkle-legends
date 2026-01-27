
import '../lib/load-env';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
    console.log('Checking tables...');
    // Only way to check tables via client is implicit or rpc
    // We can try to select from 'games'
    const { data, error } = await supabase.from('games').select('*').limit(1);

    if (error) {
        console.error('❌ Error selecting from games:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Games table exists. Rows:', data.length);
    }
}

checkTables();
