import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function checkChildren() {
    // Insert a dummy child to get keys (can rollback or just delete)
    const { data } = await supabaseAdmin.from('children').select('*').limit(1);
    console.log('Children Keys:', Object.keys(data?.[0] || {}));
}
checkChildren();
