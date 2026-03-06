/**
 * Map the 10 remaining printable DB records to their new portal routes.
 * Run: npx tsx scripts/update-printables-batch2.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UPDATES: Array<{ title: string; pdf_url: string }> = [
    { title: 'Caribbean Handwriting Practice — Island Words', pdf_url: '/portal/printables/caribbean-handwriting-practice' },
    { title: 'Caribbean Sea Creatures — Word Search',         pdf_url: '/portal/printables/caribbean-sea-creatures-word-search' },
    { title: 'Island Market Math Problems',                   pdf_url: '/portal/printables/island-market-math' },
    { title: 'Mango Math — Shapes & Sorting',                 pdf_url: '/portal/printables/mango-math-shapes' },
    { title: 'My Feelings Board — Emotion Check-in',          pdf_url: '/portal/printables/feelings-board' },
    { title: 'My Healthy Caribbean Plate — Food Activity',    pdf_url: '/portal/printables/healthy-caribbean-plate' },
    { title: 'Nature Observation Log — My Backyard',          pdf_url: '/portal/printables/nature-observation-log' },
    { title: 'Steelpan Music Worksheet — Rhythm Basics',      pdf_url: '/portal/printables/steelpan-music' },
    { title: 'Caribbean Festival Traditions — Matching Activity', pdf_url: '/portal/printables/caribbean-festival-traditions' },
    // Fix the wrong mapping from batch 1
    { title: 'Patois Word Matching Game',                     pdf_url: '/portal/printables/patois-word-matching' },
];

async function main() {
    console.log('🖨️  Updating batch-2 printable URLs...\n');
    let ok = 0, fail = 0;
    for (const u of UPDATES) {
        const { error } = await supabase.from('printables').update({ pdf_url: u.pdf_url }).eq('title', u.title);
        if (error) { console.error(`  ✗ "${u.title}" — ${error.message}`); fail++; }
        else        { console.log(`  ✓ "${u.title}"\n    → ${u.pdf_url}`); ok++; }
    }
    console.log(`\nDone: ${ok} updated, ${fail} failed`);
}

main().catch(e => { console.error(e); process.exit(1); });
