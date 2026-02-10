import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function listCols() {
    const { data, error } = await supabaseAdmin.rpc('get_table_columns', { table_name: 'profiles' });
    if (error) {
        // Direct SQL check
        const { data: cols, error: err2 } = await supabaseAdmin.from('information_schema.columns').select('column_name').eq('table_name', 'profiles');
        console.log('Columns from info schema:', cols);
        if (err2) console.error('Schema error:', err2);
    } else {
        console.log('Cols:', data);
    }
}
listCols();
