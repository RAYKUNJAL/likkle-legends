
import './lib/load-env';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
    console.log('Verifying content in database...');
    const { data, error } = await supabase
        .from('storybooks')
        .select('title, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Latest Story:', JSON.stringify(data[0], null, 2));
    }
}

verify();
