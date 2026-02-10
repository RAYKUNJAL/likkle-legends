
import './lib/load-env';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectSchema() {
    console.log('Checking storybooks columns...');
    const { data: storyData, error: storyError } = await supabase.from('storybooks').select('*').limit(1);
    if (storyData && storyData.length > 0) {
        console.log('Storybooks columns:', Object.keys(storyData[0]));
    } else {
        console.log('No data in storybooks or table empty.');
    }

    console.log('\nChecking songs columns...');
    const { data: songData, error: songError } = await supabase.from('songs').select('*').limit(1);
    if (songData && songData.length > 0) {
        console.log('Songs columns:', Object.keys(songData[0]));
    } else {
        console.log('No data in songs or table empty.');
    }
}

inspectSchema();
