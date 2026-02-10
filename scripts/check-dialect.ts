import '../lib/load-env';
import { supabaseAdmin } from '../lib/supabase-client';

async function checkDialect() {
    // Check existing dialect values
    const { data, error } = await supabaseAdmin
        .from('content_localizations')
        .select('dialect_type')
        .limit(5);
    console.log('Existing dialect values:', JSON.stringify({ data, error }));

    // Try common enum values
    for (const val of ['standard', 'en', 'patois', 'light', 'medium', 'heavy', 'creole']) {
        const { error: testErr } = await supabaseAdmin
            .from('content_localizations')
            .insert({
                content_item_id: 'da1f34cf-debe-4711-9d83-b40d747baa93',
                dialect_type: val,
                language_code: 'en',
                display_title: 'test',
                body_text: 'test'
            });
        if (!testErr) {
            console.log(`✅ "${val}" is a valid dialect_type`);
            // Clean up
            await supabaseAdmin.from('content_localizations')
                .delete()
                .eq('content_item_id', 'da1f34cf-debe-4711-9d83-b40d747baa93')
                .eq('dialect_type', val);
        } else {
            console.log(`❌ "${val}" failed: ${testErr.message}`);
        }
    }
}
checkDialect();
