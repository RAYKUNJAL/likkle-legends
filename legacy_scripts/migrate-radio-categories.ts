import { createClient } from '@supabase/supabase-js';

type Segment = 'tanty_spice' | 'roti' | 'dilly_doubles' | 'steelpan_sam';

function mapCategory(input?: string): Segment {
    const channel = (input || '').toLowerCase();

    if (channel === 'story' || channel === 'lullaby' || channel === 'calm' || channel === 'culture' || channel === 'tanty') return 'tanty_spice';
    if (channel === 'educational' || channel === 'lesson' || channel === 'learning') return 'roti';
    if (channel === 'dilly' || channel === 'food') return 'dilly_doubles';
    if (channel === 'music' || channel === 'soca' || channel === 'steelpan' || channel === 'vip') return 'steelpan_sam';
    if (channel === 'roti' || channel === 'tanty_spice' || channel === 'dilly_doubles' || channel === 'steelpan_sam') return channel as Segment;

    return 'tanty_spice';
}

async function run() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const admin = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: songs, error } = await admin.from('songs').select('id,category');
    if (error) throw error;

    const rows = songs || [];
    let updated = 0;

    for (const row of rows) {
        const mapped = mapCategory(row.category);
        if ((row.category || '') === mapped) continue;

        const { error: updateError } = await admin
            .from('songs')
            .update({ category: mapped })
            .eq('id', row.id);

        if (updateError) {
            console.error(`Failed to update ${row.id}: ${updateError.message}`);
            continue;
        }

        updated += 1;
    }

    console.log(`Radio category migration complete. Updated ${updated} rows out of ${rows.length}.`);
}

run().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});

