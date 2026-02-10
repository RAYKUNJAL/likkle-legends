import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function fixUser(email: string) {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users.find(u => u.email === email);
    if (!authUser) return;

    console.log('Inserting profile for:', authUser.id);
    const { data: pData, error: pError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: 'Ray Legend'
        });

    if (pError) console.error('P error:', pError);
    else console.log('P success:', pData);

    const { data: cData, error: cError } = await supabaseAdmin
        .from('children')
        .insert({
            parent_id: authUser.id,
            first_name: 'Likkle Ray',
            age: 5,
            age_track: 'mini',
            avatar_id: 'roti'
        });

    if (cError) console.error('C error:', cError);
    else console.log('C success:', cData);
}
fixUser('raykunjal@gmail.com');
