
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkSchema() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, key);

    console.log("Checking 'songs' table schema...");
    const { data, error } = await supabase.from('songs').select('*').limit(1);

    if (error) {
        console.error("Error fetching songs:", error.message);
        if (error.message.includes("does not exist")) {
            console.log("Table 'songs' does not exist!");
        }
    } else {
        console.log("Columns found: ", Object.keys(data[0] || {}).join(', '));
    }
}

checkSchema();
