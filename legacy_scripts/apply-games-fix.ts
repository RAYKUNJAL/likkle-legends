import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function applyGamesFix() {
    console.log('🚀 Applying Games Table Schema Fix...');

    const sql = `
        DO $$ 
        BEGIN 
            -- Add game_type if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='game_type') THEN
                ALTER TABLE games ADD COLUMN game_type TEXT DEFAULT 'trivia';
            END IF;

            -- Add game_config if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='game_config') THEN
                ALTER TABLE games ADD COLUMN game_config JSONB DEFAULT '{}';
            END IF;
        END $$;
    `;

    try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('❌ Error applying fix via RPC:', error);
            console.log('Try running this SQL manually in Supabase SQL Editor:');
            console.log(sql);
        } else {
            console.log('✅ Games table updated successfully!');
        }
    } catch (err) {
        console.error('❌ Failed to execute migration:', err);
    }
}

applyGamesFix();
