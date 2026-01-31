
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('❌ Environment variables missing.');
        process.exit(1);
    }

    const supabase = createClient(url, key);

    console.log('🧹 Starting character-safe cleanup...');

    const tables = [
        'product_bundles',
        'songs',
        'storybooks',
        'printables',
        'missions',
        'videos',
        'games',
        'vr_locations',
        'curriculum_nodes'
    ];

    for (const table of tables) {
        process.stdout.write(`  Deleting ${table}... `);
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

        if (error) {
            console.log('❌');
            console.error(`  Error in ${table}: ${error.message}`);
        } else {
            console.log('✅');
        }
    }

    console.log('\n✨ Cleanup complete! Characters preserved.');
}

main();
