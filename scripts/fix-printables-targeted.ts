/**
 * Targeted fix for wrong mappings from the bulk fix script.
 * Run: npx tsx scripts/fix-printables-targeted.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FIXES: Array<{ title: string; pdf_url: string }> = [
    // Was wrongly mapped to island-animals-matching (keyword "match" hit first)
    { title: 'Patois Word Matching Game', pdf_url: '/portal/printables/patois-word-matching' },
    // Map festival/culture matching to the activities route
    { title: 'Caribbean Festival Traditions — Matching Activity', pdf_url: '/portal/printables/anansi-story-sequencing' },
    // Duplicate alphabet tracing → N-Z is the better fit
    { title: 'Alphabet Tracing — Big Letters', pdf_url: '/portal/printables/caribbean-alphabet-n-z' },
];

async function main() {
    for (const fix of FIXES) {
        const { error } = await supabase
            .from('printables')
            .update({ pdf_url: fix.pdf_url })
            .eq('title', fix.title);
        if (error) {
            console.error(`✗ "${fix.title}" — ${error.message}`);
        } else {
            console.log(`✓ "${fix.title}" → ${fix.pdf_url}`);
        }
    }
    console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
