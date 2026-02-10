import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function fix() {
    const id = 'a250a8b1-58a0-439e-81a7-04bdd4027fa3';
    console.log('Testing insert only ID for:', id);

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([
            { id: id }
        ])
        .select();

    console.log('Result:', data, 'Error:', error);
}
fix();
