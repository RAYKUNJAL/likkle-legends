/**
 * Fix any printables still pointing to placeholder/broken PDF URLs.
 * Maps by title to known portal routes; blanks out unmatched ones.
 * Run: npx tsx scripts/fix-placeholder-printables.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Title → portal route (normalised lowercase for fuzzy match)
const TITLE_TO_SLUG: Array<{ keywords: string[]; slug: string }> = [
    { keywords: ['alphabet', 'a-m', 'a to m', 'a–m'], slug: 'caribbean-alphabet-a-m' },
    { keywords: ['alphabet', 'n-z', 'n to z', 'n–z'], slug: 'caribbean-alphabet-n-z' },
    { keywords: ['coconut', 'count'], slug: 'count-the-coconuts' },
    { keywords: ['animal', 'match'], slug: 'island-animals-matching' },
    { keywords: ['island map', 'heritage map', 'heritage island'], slug: 'my-heritage-island-map' },
    { keywords: ['patois', 'creole', 'word match'], slug: 'patois-word-matching' },
    { keywords: ['fruit', 'colour'], slug: 'caribbean-fruits-coloring' },
    { keywords: ['anansi', 'sequenc'], slug: 'anansi-story-sequencing' },
    { keywords: ['number bond', 'bonds'], slug: 'caribbean-number-bonds' },
    { keywords: ['family', 'heritage tree', 'family tree'], slug: 'my-family-heritage-tree' },
    { keywords: ['carnival', 'costume'], slug: 'carnival-costume-design' },
    { keywords: ['weather', 'journal'], slug: 'caribbean-weather-journal' },
];

function resolveSlug(title: string): string | null {
    const t = title.toLowerCase();
    for (const entry of TITLE_TO_SLUG) {
        if (entry.keywords.some(kw => t.includes(kw))) {
            return `/portal/printables/${entry.slug}`;
        }
    }
    return null;
}

async function main() {
    // Fetch ALL printables (including inactive)
    const { data, error } = await supabase
        .from('printables')
        .select('id, title, pdf_url, is_active');

    if (error) { console.error('Fetch failed:', error.message); process.exit(1); }

    console.log(`Found ${data?.length ?? 0} total printable records\n`);

    const broken = (data || []).filter(p =>
        !p.pdf_url ||
        p.pdf_url.includes('placeholder') ||
        p.pdf_url.endsWith('.pdf') && !p.pdf_url.startsWith('http') && !p.pdf_url.startsWith('/portal')
    );

    console.log(`${broken.length} record(s) with broken/placeholder PDF URLs:\n`);

    let fixed = 0;
    let blanked = 0;

    for (const p of broken) {
        const newUrl = resolveSlug(p.title);
        if (newUrl) {
            const { error: err } = await supabase
                .from('printables')
                .update({ pdf_url: newUrl })
                .eq('id', p.id);
            if (err) {
                console.error(`  ✗ "${p.title}" — ${err.message}`);
            } else {
                console.log(`  ✓ Fixed: "${p.title}"\n    → ${newUrl}`);
                fixed++;
            }
        } else {
            // No matching slug — blank out the broken URL so it doesn't 404
            const { error: err } = await supabase
                .from('printables')
                .update({ pdf_url: '' })
                .eq('id', p.id);
            if (err) {
                console.error(`  ✗ "${p.title}" — ${err.message}`);
            } else {
                console.log(`  ⚠ Blanked (no slug match): "${p.title}" (was: ${p.pdf_url})`);
                blanked++;
            }
        }
    }

    console.log(`\n📊 Done: ${fixed} fixed, ${blanked} blanked, ${broken.length - fixed - blanked} errors`);

    // Show final state
    console.log('\n--- Current pdf_url values ---');
    const { data: all } = await supabase.from('printables').select('title, pdf_url').order('title');
    (all || []).forEach(p => console.log(`  ${p.title.padEnd(45)} → ${p.pdf_url || '(empty)'}`));
}

main().catch(err => { console.error(err); process.exit(1); });
