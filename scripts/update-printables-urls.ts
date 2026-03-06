/**
 * Likkle Legends — Update Printables URLs & Fix Categories
 *
 * Updates pdf_url to point to the new printable worksheet pages,
 * and fixes category values (worksheet → educational, activity_pack → activity).
 *
 * Run: npx tsx scripts/update-printables-urls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UPDATES: Array<{ title: string; pdf_url: string; category: string }> = [
    {
        title: 'Caribbean Alphabet A-M',
        pdf_url: '/portal/printables/caribbean-alphabet-a-m',
        category: 'coloring',
    },
    {
        title: 'Caribbean Alphabet N-Z',
        pdf_url: '/portal/printables/caribbean-alphabet-n-z',
        category: 'coloring',
    },
    {
        title: 'Count the Coconuts (1-10)',
        pdf_url: '/portal/printables/count-the-coconuts',
        category: 'educational',
    },
    {
        title: 'Island Animals Matching Game',
        pdf_url: '/portal/printables/island-animals-matching',
        category: 'educational',
    },
    {
        title: 'My Heritage Island Map',
        pdf_url: '/portal/printables/my-heritage-island-map',
        category: 'activity',
    },
    {
        title: 'Patois Word Matching',
        pdf_url: '/portal/printables/patois-word-matching',
        category: 'educational',
    },
    {
        title: 'Caribbean Fruits Colouring Page',
        pdf_url: '/portal/printables/caribbean-fruits-coloring',
        category: 'coloring',
    },
    {
        title: 'Anansi Story Sequencing',
        pdf_url: '/portal/printables/anansi-story-sequencing',
        category: 'activity',
    },
    {
        title: 'Caribbean Number Bonds (to 10)',
        pdf_url: '/portal/printables/caribbean-number-bonds',
        category: 'educational',
    },
    {
        title: 'My Family Heritage Tree',
        pdf_url: '/portal/printables/my-family-heritage-tree',
        category: 'activity',
    },
    {
        title: 'Carnival Costume Design Sheet',
        pdf_url: '/portal/printables/carnival-costume-design',
        category: 'coloring',
    },
    {
        title: 'Caribbean Weather Journal',
        pdf_url: '/portal/printables/caribbean-weather-journal',
        category: 'activity',
    },
];

async function main() {
    console.log('🖨️  Updating printable URLs and categories...\n');

    let updated = 0;
    let failed = 0;

    for (const item of UPDATES) {
        const { error } = await supabase
            .from('printables')
            .update({ pdf_url: item.pdf_url, category: item.category })
            .eq('title', item.title);

        if (error) {
            console.error(`  ✗ Failed: "${item.title}" — ${error.message}`);
            failed++;
        } else {
            console.log(`  ✓ Updated: "${item.title}"`);
            console.log(`           → ${item.pdf_url} [${item.category}]`);
            updated++;
        }
    }

    console.log(`\n📊 Done: ${updated} updated, ${failed} failed`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
