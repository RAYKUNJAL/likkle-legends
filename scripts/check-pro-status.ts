import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkProStatus() {
    console.log('🔍 Checking Pro 3.1.0 Status...');

    const tables = [
        'parental_consents',
        'family_groups',
        'admin_actions_audit',
        'vendor_compliance',
        'ai_usage'
    ];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error) {
            console.log(`❌ Table "${table}" is MISSING.`);
        } else {
            console.log(`✅ Table "${table}" is present.`);
        }
    }
}

checkProStatus();
