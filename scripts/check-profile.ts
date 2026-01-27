import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function checkIds() {
    const id = 'a250a8b1-58a0-439e-81a7-04bdd4027fa3';
    console.log(`Checking profile for ID: ${id}`);

    // Check Profiles
    const { data: profiles, error: pError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id);

    console.log('Profiles for this ID:', profiles);
    if (pError) console.error('Profile Error:', pError);

    // Check Children
    const { data: children, error: cError } = await supabaseAdmin
        .from('children')
        .select('*')
        .eq('parent_id', id);

    console.log('Children for this ID:', children);
}

checkIds();
