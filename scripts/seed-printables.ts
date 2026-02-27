/**
 * seed-printables.ts
 * Seeds 15 Caribbean-themed printable worksheets into the `printables` table.
 * Run: npx tsx scripts/seed-printables.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const PRINTABLES = [
    { title: 'Caribbean Alphabet — A is for Ackee', description: 'Trace and colour each letter with a Caribbean object. A=Ackee, B=Breadfruit, C=Coconut... all the way to Z=Zandoli (lizard)!', category: 'coloring', tier_required: 'free', pdf_url: '/printables/placeholder-alphabet.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Alphabet Tracing — Big Letters', description: 'Practice writing uppercase letters A–Z with fun island-themed illustrations. Each page has dotted lines to trace and a Caribbean picture to colour.', category: 'worksheet', tier_required: 'free', pdf_url: '/printables/placeholder-tracing.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Count the Coconuts (1–10)', description: 'Count the coconuts on each tree and write the number. Includes ten-frames and number matching with Caribbean fruits.', category: 'worksheet', tier_required: 'free', pdf_url: '/printables/placeholder-counting.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Mango Math — Shapes & Sorting', description: 'Sort tropical fruits by colour, size, and shape. Practice identifying circles (coconut), ovals (mango), triangles (star apple).', category: 'worksheet', tier_required: 'free', pdf_url: '/printables/placeholder-shapes.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Island Market Math Problems', description: 'Word problems set in a Caribbean market. Add up the mangoes, subtract the fish, and figure out how many breadfruits Grandma needs.', category: 'worksheet', tier_required: 'free', pdf_url: '/printables/placeholder-wordproblems.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Caribbean Sea Creatures — Word Search', description: 'Find 12 Caribbean sea creatures hidden in the puzzle: turtle, manatee, stingray, flying fish, parrotfish, and more!', category: 'activity_pack', tier_required: 'free', pdf_url: '/printables/placeholder-wordsearch.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Nature Observation Log — My Backyard', description: "A scientist's journal for little explorers. Draw and describe 5 things you observe in nature today — leaves, insects, clouds, birds.", category: 'activity_pack', tier_required: 'free', pdf_url: '/printables/placeholder-journal.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'My Heritage Island — Colouring Map', description: 'Colour your Caribbean island and label the capital city, mountains, and sea. Includes blank maps of Jamaica, Trinidad, Barbados, and Guyana.', category: 'coloring', tier_required: 'free', pdf_url: '/printables/placeholder-map.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Patois Word Matching Game', description: 'Match Jamaican Patois words to their English meanings. "Likkle" = Little, "Nuff" = A lot, "Irie" = Good vibes! Includes a bonus mini-quiz.', category: 'worksheet', tier_required: 'free', pdf_url: '/printables/placeholder-patois.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Caribbean Festival Traditions — Matching Activity', description: 'Match each Caribbean festival to its island: Carnival, Crop Over, Junkanoo, Phagwah, and Hosay. Colour the flags and costumes!', category: 'activity_pack', tier_required: 'free', pdf_url: '/printables/placeholder-festivals.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Steelpan Music Worksheet — Rhythm Basics', description: 'Learn about the steelpan: where it was invented (Trinidad!), how it works, and practice clapping rhythms to Soca beats.', category: 'worksheet', tier_required: 'free', pdf_url: '/printables/placeholder-steelpan.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'My Feelings Board — Emotion Check-in', description: 'Circle how you feel today and draw your feeling face. Includes emotion vocabulary: happy, sad, excited, frustrated, calm, silly, scared.', category: 'activity_pack', tier_required: 'free', pdf_url: '/printables/placeholder-emotions.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'My Caribbean Family Tree', description: 'Draw and label your family tree! Spaces for parents, grandparents, aunts, uncles, and cousins. Celebrate your Caribbean heritage.', category: 'activity_pack', tier_required: 'free', pdf_url: '/printables/placeholder-familytree.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'Caribbean Handwriting Practice — Island Words', description: 'Practice cursive and print handwriting with Caribbean vocabulary: lagoon, breadfruit, hummingbird, calabash, carnival, moonrise.', category: 'worksheet', tier_required: 'free', pdf_url: '/printables/placeholder-handwriting.pdf', preview_url: '/images/logo.png', is_active: true },
    { title: 'My Healthy Caribbean Plate — Food Activity', description: 'Design a balanced Caribbean meal! Cut and paste (or draw) foods from each group onto your plate: proteins, carbs, fruits & veggies.', category: 'activity_pack', tier_required: 'free', pdf_url: '/printables/placeholder-foodplate.pdf', preview_url: '/images/logo.png', is_active: true },
];

async function seedPrintables() {
    console.log('🖨️  Seeding Caribbean printables...\n');

    // Fetch existing titles to avoid duplicates
    const { data: existing } = await supabase
        .from('printables')
        .select('title');

    const existingTitles = new Set((existing || []).map((r: any) => r.title));
    const newRows = PRINTABLES.filter(p => !existingTitles.has(p.title));

    if (newRows.length === 0) {
        console.log(`✅ All ${PRINTABLES.length} printables already seeded — skipping`);
        return;
    }

    const { data, error } = await supabase
        .from('printables')
        .insert(newRows)
        .select('id, title');

    if (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }

    console.log(`✅ Inserted ${data?.length || 0} new printables (${existingTitles.size} already existed):`);
    data?.forEach((p: { title: string }) => console.log(`   - ${p.title}`));
    console.log('\n🌴 Printables seeded successfully!');
}

seedPrintables().catch(console.error);
