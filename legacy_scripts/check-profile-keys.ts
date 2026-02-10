import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function checkCols() {
    const id = 'a250a8b1-58a0-439e-81a7-04bdd4027fa3';
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
    console.log('Profile Keys:', Object.keys(data || {}));
}
checkCols();
