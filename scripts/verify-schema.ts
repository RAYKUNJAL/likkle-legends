import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function verifySchema() {
    console.log('🔍 Verifying Growth Engine Schema...\n');

    const tables = [
        'promoters',
        'contests',
        'contest_entries',
        'referral_clicks',
        'leads',
        'support_messages'
    ];

    for (const table of tables) {
        try {
            const { error } = await supabaseAdmin
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: Exists`);
            }
        } catch (e: any) {
            console.log(`❌ ${table}: ${e.message}`);
        }
    }
}

verifySchema();
