
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkContent() {
    const { count: charCount } = await supabase.from('characters').select('*', { count: 'exact', head: true });
    const { count: storyCount } = await supabase.from('stories').select('*', { count: 'exact', head: true });

    console.log(`\n📊 Content Stats:`);
    console.log(`- Characters: ${charCount}`);
    console.log(`- Stories: ${storyCount}`);

    if (charCount === 0) console.log("⚠️  Characters need seeding!");
    if (storyCount === 0) console.log("⚠️  Stories need generation!");
}

checkContent();
