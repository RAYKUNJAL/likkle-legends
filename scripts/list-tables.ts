import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function listTables() {
    // This is a hacky way to list tables if RPC is not available
    const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(0);
    console.log('Profiles check:', { data, error });

    // Try to get a list of all tables in public schema
    const { data: tables, error: tError } = await supabaseAdmin
        .rpc('get_tables'); // If you have this RPC

    console.log('Tables:', tables, 'T error:', tError);
}
listTables();
