/**
 * seed-printables.ts
 * Seeds 15 Caribbean-themed printable worksheets into the `printables` table.
 * Run: npx tsx scripts/seed-printables.ts
 */

import 'dotenv/config';
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
    // Literacy — Mini Track (ages 3–5)
    {
        title: 'Caribbean Alphabet — A is for Ackee',
        description: 'Trace and colour each letter with a Caribbean object. A=Ackee, B=Breadfruit, C=Coconut... all the way to Z=Zandoli (lizard)!',
        category: 'literacy',
        age_track: 'mini',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-alphabet.pdf',
        thumbnail_url: '/images/printables/alphabet-thumbnail.png',
        curriculum_standard: 'OECS ECC Strand 1: Letter recognition, phonemic awareness',
        island_theme: 'caribbean',
        page_count: 4,
        is_active: true,
        metadata: {
            skills: ['letter recognition', 'fine motor', 'vocabulary'],
            character_guide: 'roti',
            estimated_time_minutes: 15,
            materials_needed: ['crayons', 'pencil'],
        },
    },
    {
        title: 'Alphabet Tracing — Big Letters',
        description: 'Practice writing uppercase letters A–Z with fun island-themed illustrations. Each page has dotted lines to trace and a Caribbean picture to colour.',
        category: 'literacy',
        age_track: 'mini',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-tracing.pdf',
        thumbnail_url: '/images/printables/tracing-thumbnail.png',
        curriculum_standard: 'OECS ECC Strand 1: Pre-writing skills, letter formation',
        island_theme: 'caribbean',
        page_count: 13,
        is_active: true,
        metadata: {
            skills: ['handwriting', 'letter formation', 'fine motor'],
            character_guide: 'roti',
            estimated_time_minutes: 20,
            materials_needed: ['pencil'],
        },
    },

    // Math — Mini Track
    {
        title: 'Count the Coconuts (1–10)',
        description: 'Count the coconuts on each tree and write the number. Includes ten-frames and number matching with Caribbean fruits.',
        category: 'math',
        age_track: 'mini',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-counting.pdf',
        thumbnail_url: '/images/printables/counting-thumbnail.png',
        curriculum_standard: 'OECS ECC Strand 2: Counting 1–10, one-to-one correspondence',
        island_theme: 'caribbean',
        page_count: 4,
        is_active: true,
        metadata: {
            skills: ['counting', 'number recognition', 'one-to-one correspondence'],
            character_guide: 'roti',
            estimated_time_minutes: 10,
            materials_needed: ['pencil', 'crayons'],
        },
    },
    {
        title: 'Mango Math — Shapes & Sorting',
        description: 'Sort tropical fruits by colour, size, and shape. Practice identifying circles (coconut), ovals (mango), triangles (star apple).',
        category: 'math',
        age_track: 'mini',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-shapes.pdf',
        thumbnail_url: '/images/printables/shapes-thumbnail.png',
        curriculum_standard: 'OECS ECC Strand 2: Shapes, sorting, classification',
        island_theme: 'caribbean',
        page_count: 3,
        is_active: true,
        metadata: {
            skills: ['shape recognition', 'sorting', 'colours'],
            character_guide: 'roti',
            estimated_time_minutes: 12,
            materials_needed: ['crayons', 'scissors (optional)'],
        },
    },

    // Math — Big Track (ages 6–9)
    {
        title: 'Island Market Math Problems',
        description: 'Word problems set in a Caribbean market. Add up the mangoes, subtract the fish, and figure out how many breadfruits Grandma needs.',
        category: 'math',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-wordproblems.pdf',
        thumbnail_url: '/images/printables/wordproblems-thumbnail.png',
        curriculum_standard: 'OECS Grade 2–3: Addition/subtraction word problems to 100',
        island_theme: 'caribbean',
        page_count: 3,
        is_active: true,
        metadata: {
            skills: ['addition', 'subtraction', 'reading comprehension', 'word problems'],
            character_guide: 'roti',
            estimated_time_minutes: 20,
            materials_needed: ['pencil'],
        },
    },

    // Science
    {
        title: 'Caribbean Sea Creatures — Word Search',
        description: 'Find 12 Caribbean sea creatures hidden in the puzzle: turtle, manatee, stingray, flying fish, parrotfish, and more!',
        category: 'science',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-wordsearch.pdf',
        thumbnail_url: '/images/printables/wordsearch-thumbnail.png',
        curriculum_standard: 'OECS Grade 2: Marine ecosystems, ocean life of the Caribbean',
        island_theme: 'caribbean',
        page_count: 2,
        is_active: true,
        metadata: {
            skills: ['vocabulary', 'reading', 'science literacy', 'focus'],
            character_guide: 'benny',
            estimated_time_minutes: 15,
            materials_needed: ['pencil', 'highlighter'],
        },
    },
    {
        title: 'Nature Observation Log — My Backyard',
        description: 'A scientist\'s journal for little explorers. Draw and describe 5 things you observe in nature today — leaves, insects, clouds, birds.',
        category: 'science',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-journal.pdf',
        thumbnail_url: '/images/printables/journal-thumbnail.png',
        curriculum_standard: 'OECS Grade 2–3: Scientific observation, living things',
        island_theme: 'caribbean',
        page_count: 2,
        is_active: true,
        metadata: {
            skills: ['observation', 'drawing', 'scientific method', 'writing'],
            character_guide: 'benny',
            estimated_time_minutes: 20,
            materials_needed: ['pencil', 'crayons', 'ruler'],
        },
    },

    // Culture
    {
        title: 'My Heritage Island — Colouring Map',
        description: 'Colour your Caribbean island and label the capital city, mountains, and sea. Includes blank maps of Jamaica, Trinidad, Barbados, and Guyana.',
        category: 'culture',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-map.pdf',
        thumbnail_url: '/images/printables/map-thumbnail.png',
        curriculum_standard: 'CPEA Social Studies: Caribbean geography, national identity',
        island_theme: 'caribbean',
        page_count: 4,
        is_active: true,
        metadata: {
            skills: ['geography', 'cultural identity', 'fine motor', 'labelling'],
            character_guide: 'tanty_spice',
            estimated_time_minutes: 25,
            materials_needed: ['crayons', 'coloured pencils'],
        },
    },
    {
        title: 'Patois Word Matching Game',
        description: 'Match Jamaican Patois words to their English meanings. "Likkle" = Little, "Nuff" = A lot, "Irie" = Good vibes! Includes a bonus mini-quiz.',
        category: 'culture',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-patois.pdf',
        thumbnail_url: '/images/printables/patois-thumbnail.png',
        curriculum_standard: 'CPEA Language Arts: Creole/dialect literacy, cultural heritage',
        island_theme: 'jamaica',
        page_count: 2,
        is_active: true,
        metadata: {
            skills: ['vocabulary', 'cultural literacy', 'matching', 'reading'],
            character_guide: 'tanty_spice',
            estimated_time_minutes: 15,
            materials_needed: ['pencil'],
        },
    },
    {
        title: 'Caribbean Festival Traditions — Matching Activity',
        description: 'Match each Caribbean festival to its island: Carnival, Crop Over, Junkanoo, Phagwah, and Hosay. Colour the flags and costumes!',
        category: 'culture',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-festivals.pdf',
        thumbnail_url: '/images/printables/festivals-thumbnail.png',
        curriculum_standard: 'CPEA Social Studies: Cultural celebrations, regional heritage',
        island_theme: 'caribbean',
        page_count: 3,
        is_active: true,
        metadata: {
            skills: ['cultural awareness', 'matching', 'reading', 'geography'],
            character_guide: 'tanty_spice',
            estimated_time_minutes: 20,
            materials_needed: ['crayons', 'pencil'],
        },
    },

    // Music
    {
        title: 'Steelpan Music Worksheet — Rhythm Basics',
        description: 'Learn about the steelpan: where it was invented (Trinidad!), how it works, and practice clapping rhythms to Soca beats.',
        category: 'music',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-steelpan.pdf',
        thumbnail_url: '/images/printables/steelpan-thumbnail.png',
        curriculum_standard: 'OECS Grade 3: Music appreciation, Caribbean instruments',
        island_theme: 'trinidad',
        page_count: 2,
        is_active: true,
        metadata: {
            skills: ['music literacy', 'rhythm', 'cultural history', 'listening'],
            character_guide: 'dilly_doubles',
            estimated_time_minutes: 15,
            materials_needed: ['pencil'],
        },
    },

    // Social-Emotional Learning
    {
        title: 'My Feelings Board — Emotion Check-in',
        description: 'Circle how you feel today and draw your feeling face. Includes emotion vocabulary: happy, sad, excited, frustrated, calm, silly, scared.',
        category: 'social',
        age_track: 'mini',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-emotions.pdf',
        thumbnail_url: '/images/printables/emotions-thumbnail.png',
        curriculum_standard: 'OECS ECC Strand 5: Social-emotional development, self-awareness',
        island_theme: 'caribbean',
        page_count: 2,
        is_active: true,
        metadata: {
            skills: ['emotional literacy', 'self-awareness', 'drawing', 'vocabulary'],
            character_guide: 'tanty_spice',
            estimated_time_minutes: 10,
            materials_needed: ['crayons'],
        },
    },
    {
        title: 'My Caribbean Family Tree',
        description: 'Draw and label your family tree! Spaces for parents, grandparents, aunts, uncles, and cousins. Celebrate your Caribbean heritage.',
        category: 'social',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-familytree.pdf',
        thumbnail_url: '/images/printables/familytree-thumbnail.png',
        curriculum_standard: 'CPEA Social Studies: Family structures, community, heritage',
        island_theme: 'caribbean',
        page_count: 2,
        is_active: true,
        metadata: {
            skills: ['family literacy', 'drawing', 'writing', 'cultural identity'],
            character_guide: 'tanty_spice',
            estimated_time_minutes: 20,
            materials_needed: ['pencil', 'crayons', 'family photos (optional)'],
        },
    },

    // Literacy — Big Track
    {
        title: 'Caribbean Handwriting Practice — Island Words',
        description: 'Practice cursive and print handwriting with Caribbean vocabulary: lagoon, breadfruit, hummingbird, calabash, carnival, moonrise.',
        category: 'literacy',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-handwriting.pdf',
        thumbnail_url: '/images/printables/handwriting-thumbnail.png',
        curriculum_standard: 'OECS Grade 3: Handwriting fluency, vocabulary development',
        island_theme: 'caribbean',
        page_count: 3,
        is_active: true,
        metadata: {
            skills: ['handwriting', 'vocabulary', 'spelling', 'fine motor'],
            character_guide: 'roti',
            estimated_time_minutes: 15,
            materials_needed: ['pencil', 'lined paper'],
        },
    },
    {
        title: 'My Healthy Caribbean Plate — Food Activity',
        description: 'Design a balanced Caribbean meal! Cut and paste (or draw) foods from each group onto your plate: proteins, carbs, fruits & veggies.',
        category: 'science',
        age_track: 'big',
        tier_required: 'free',
        pdf_url: '/printables/placeholder-foodplate.pdf',
        thumbnail_url: '/images/printables/foodplate-thumbnail.png',
        curriculum_standard: 'OECS Grade 2: Health and nutrition, Caribbean foods',
        island_theme: 'caribbean',
        page_count: 2,
        is_active: true,
        metadata: {
            skills: ['health literacy', 'sorting', 'creative', 'vocabulary'],
            character_guide: 'benny',
            estimated_time_minutes: 20,
            materials_needed: ['scissors', 'glue', 'crayons'],
        },
    },
];

async function seedPrintables() {
    console.log('🖨️  Seeding Caribbean printables...\n');

    // Upsert with conflict on title to be idempotent
    const { data, error } = await supabase
        .from('printables')
        .upsert(PRINTABLES, { onConflict: 'title', ignoreDuplicates: true })
        .select('id, title');

    if (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }

    console.log(`✅ Seeded ${data?.length || 0} printables:`);
    data?.forEach((p: { title: string }) => console.log(`   - ${p.title}`));
    console.log('\n🌴 Printables seeded successfully!');
}

seedPrintables().catch(console.error);
