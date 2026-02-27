/**
 * Update storybook cover images from generic logo.png to character-specific images.
 * Run: npx tsx scripts/update-cover-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORY_COVERS: Record<string, string> = {
    "Anansi and the Pot of Wisdom":          "/images/tanty_spice_avatar.jpg",
    "Mango Madness: The Alphabet Adventure":  "/images/mango_moko.png",
    "The Island Explorer's Map":              "/images/benny-of-shadows.jpg",
    "Nanny's Warriors: The True Story of the Maroons": "/images/roti-new.jpg",
    "The Steelpan's Song":                   "/images/steelpan_sam.png",
    "Benny and the Secret of the Silk-Cotton Tree":    "/images/benny-of-shadows.jpg",
    "River Mumma's Gift":                    "/images/mystery-character.png",
    "The Haitian Revolution: How a Nation Won Its Freedom": "/images/parent-child-smiling.png",
};

const PRINTABLE_PREVIEWS: Record<string, string> = {
    "Caribbean Alphabet A-M":           "/images/flashcard-coloring.png",
    "Caribbean Alphabet N-Z":           "/images/flashcard-coloring.png",
    "Count the Coconuts (1-10)":        "/images/mango_moko.png",
    "Island Animals Matching Game":     "/images/benny-of-shadows.jpg",
    "My Heritage Island Map":           "/images/island-pattern.png",
    "Patois Word Matching":             "/images/tanty_spice_avatar.jpg",
    "Caribbean Fruits Colouring Page":  "/images/mango_moko.png",
    "Anansi Story Sequencing":          "/images/mystery-character.png",
    "Caribbean Number Bonds (to 10)":   "/images/roti-new.jpg",
    "My Family Heritage Tree":          "/images/parent-child-smiling.png",
    "Carnival Costume Design Sheet":    "/images/dilly-doubles.jpg",
    "Caribbean Weather Journal":        "/images/benny-of-shadows.jpg",
};

async function updateCovers() {
    console.log('🖼️  Updating storybook cover images...');
    let storyUpdates = 0;

    for (const [title, cover_image_url] of Object.entries(STORY_COVERS)) {
        const { error } = await supabase
            .from('storybooks')
            .update({ cover_image_url })
            .eq('title', title)
            .eq('cover_image_url', '/images/logo.png'); // Only update placeholders

        if (error) {
            console.error(`  ✗ "${title}":`, error.message);
        } else {
            console.log(`  ✓ "${title}" → ${cover_image_url}`);
            storyUpdates++;
        }
    }

    console.log(`\n🖼️  Updating printable preview images...`);
    let printableUpdates = 0;

    for (const [title, preview_url] of Object.entries(PRINTABLE_PREVIEWS)) {
        const { error } = await supabase
            .from('printables')
            .update({ preview_url })
            .eq('title', title)
            .eq('preview_url', '/images/logo.png'); // Only update placeholders

        if (error) {
            console.error(`  ✗ "${title}":`, error.message);
        } else {
            console.log(`  ✓ "${title}" → ${preview_url}`);
            printableUpdates++;
        }
    }

    console.log(`\n✅ Done. Updated ${storyUpdates} story covers and ${printableUpdates} printable previews.`);
}

updateCovers().catch(console.error);
