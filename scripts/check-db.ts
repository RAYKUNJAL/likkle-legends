import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function checkAndFix() {
    // 1. Check content_items
    const { data: items } = await supabaseAdmin
        .from('content_items')
        .select('*')
        .eq('content_type', 'story');
    console.log('Stories:', JSON.stringify(items, null, 2));

    // 2. Check localizations
    const { data: locs } = await supabaseAdmin
        .from('content_localizations')
        .select('*');
    console.log('\nLocalizations:', JSON.stringify(locs, null, 2));
}

checkAndFix();
