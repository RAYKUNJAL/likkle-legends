import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function inspectSchema() {
    // 1. List storage buckets
    const { data: buckets, error: bucketsErr } = await supabaseAdmin.storage.listBuckets();
    console.log('=== STORAGE BUCKETS ===');
    console.log(bucketsErr ? `Error: ${bucketsErr.message}` : `Buckets: ${buckets?.map(b => b.name).join(', ') || 'NONE'}`);

    // 2. Check content_items columns
    console.log('\n=== CONTENT_ITEMS TABLE ===');
    const { data: sample, error: tableErr } = await supabaseAdmin
        .from('content_items')
        .select('*')
        .limit(1);

    if (tableErr) {
        console.log(`Error: ${tableErr.message}`);
    } else if (sample && sample.length > 0) {
        console.log('Columns:', Object.keys(sample[0]).join(', '));
    } else {
        console.log('Table exists but empty. Trying insert to discover schema...');
        // Try a dummy query to see what columns exist
        const { error: insertErr } = await supabaseAdmin
            .from('content_items')
            .insert({ content_type: '__schema_test__' })
            .select();
        if (insertErr) {
            console.log('Insert error (shows missing columns):', insertErr.message);
        }
        // Cleanup
        await supabaseAdmin.from('content_items').delete().eq('content_type', '__schema_test__');
    }

    // 3. Check content_localizations
    console.log('\n=== CONTENT_LOCALIZATIONS TABLE ===');
    const { data: locSample, error: locErr } = await supabaseAdmin
        .from('content_localizations')
        .select('*')
        .limit(1);

    if (locErr) {
        console.log(`Error: ${locErr.message}`);
    } else if (locSample && locSample.length > 0) {
        console.log('Columns:', Object.keys(locSample[0]).join(', '));
    } else {
        console.log('Table exists but empty');
    }

    console.log('\n=== DONE ===');
}

inspectSchema();
