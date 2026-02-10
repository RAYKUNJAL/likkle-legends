
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clearContent() {
    console.log('🧹 Clearing all content tables...');

    const tables = ['storybooks', 'songs', 'videos', 'missions', 'games'];

    for (const table of tables) {
        console.log(`Deleting from ${table}...`);
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error) console.error(`Failed to clear ${table}:`, error.message);
        else console.log(`✅ Cleared ${table}`);
    }
}

clearContent().catch(console.error);
