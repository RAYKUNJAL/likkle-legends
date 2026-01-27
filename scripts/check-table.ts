import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function checkTable() {
    const { data, error } = await supabaseAdmin.rpc('get_table_columns', { table_name: 'profiles' });
    if (error) {
        // Fallback: try to select count
        const { error: err2 } = await supabaseAdmin.from('profiles').select('count', { count: 'exact', head: true });
        console.log('Select test error:', err2);
    } else {
        console.log('Columns:', data);
    }
}
checkTable();
