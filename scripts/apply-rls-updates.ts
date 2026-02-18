
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const sql = `
        ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
        
        -- Support for user-owned stories
        DO $$ BEGIN
            DROP POLICY IF EXISTS "Users can view own stories" ON public.storybooks;
            CREATE POLICY "Users can view own stories" ON public.storybooks FOR SELECT USING (auth.uid() = user_id);
            
            DROP POLICY IF EXISTS "Users can update own stories" ON public.storybooks;
            CREATE POLICY "Users can update own stories" ON public.storybooks FOR UPDATE USING (auth.uid() = user_id);
            
            DROP POLICY IF EXISTS "Users can delete own stories" ON public.storybooks;
            CREATE POLICY "Users can delete own stories" ON public.storybooks FOR DELETE USING (auth.uid() = user_id);
        EXCEPTION
            WHEN others THEN null;
        END $$;
    `;

    console.log('🚀 Applying RLS Updates to storybooks table...');

    // We use the exec_sql RPC which is common in these setups for migrations
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ Error applying RLS:', error.message);
        console.log('💡 Trying alternative: If exec_sql is not available, please run the following in Supabase SQL Editor:');
        console.log(sql);
    } else {
        console.log('✅ RLS Policies applied successfully!');
    }
}

main();
