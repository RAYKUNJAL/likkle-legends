
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkMoreColumns() {
    const columns = [
        'id', 'email', 'full_name', 'role', 'is_admin',
        'subscription_tier', 'subscription_status',
        'paypal_subscription_id', 'currency',
        'has_grandparent_dashboard', 'subscription_started_at',
        'next_billing_date', 'parent_name', 'onboarding_completed'
    ];
    console.log(`🔍 Checking columns in profiles table...`);

    for (const col of columns) {
        const { error } = await supabase.from('profiles').select(col).limit(1);
        console.log(`Column ${col}: ${error ? 'Missing' : 'Exists'}`);
    }
}

checkMoreColumns();
