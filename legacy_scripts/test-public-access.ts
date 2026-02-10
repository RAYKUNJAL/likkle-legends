
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testPublicAccess() {
    console.log("🔍 Testing Public Access to Storybooks...");
    try {
        const { data, error } = await supabase
            .from('storybooks')
            .select('count')
            .limit(1);

        if (error) {
            console.error("❌ Public Access Failed:", error.message);
            console.error("   This confirms the recursion bug affects public users.");
        } else {
            console.log("✅ Public Access Working. Recursion might be specific to some context.");
        }
    } catch (e) {
        console.error("💥 Exception:", e);
    }
}

testPublicAccess();
