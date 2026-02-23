
'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface FamilySetupData {
    home_islands: string[];
    language_flavour: 'neutral' | 'caribbean_light' | 'creole_sprinkles';
    max_story_length_pages: number;
    allow_scary_folklore: boolean;
    allow_trickster_folklore: boolean;
}

export interface ChildSetupData {
    child_name: string;
    child_age: number;
    reading_level: 'pre-reader' | 'emerging' | 'early-fluent';
    attention_span: 'short' | 'medium' | 'long';
    favourite_topics: string[];
    favourite_characters: string[]; // e.g. ['scorcha_pepper', 'dilly_doubles']
}

export async function setupFamilyProfile(familyData: FamilySetupData, childData: ChildSetupData) {
    const supabase = createClient();

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    console.log('👪 Setting up Family Profile for User:', user.id);

    try {
        // 2. Store family preferences in user metadata (via Supabase auth)
        const { error: metadataError } = await supabase.auth.updateUser({
            data: {
                home_islands: familyData.home_islands,
                language_flavour: familyData.language_flavour,
                max_story_length_pages: familyData.max_story_length_pages,
                allow_scary_folklore: familyData.allow_scary_folklore,
                allow_trickster_folklore: familyData.allow_trickster_folklore,
                profile_setup_complete: true,
            }
        });

        if (metadataError) {
            console.error('Family Metadata Error:', metadataError);
            return { success: false, error: metadataError.message };
        }

        // 3. Determine age track from child age
        const ageTrack = childData.child_age <= 5 ? 'mini' : 'big';

        // 4. Insert child into the `children` table (real schema)
        const { data: child, error: childError } = await supabase
            .from('children')
            .insert({
                parent_id: user.id,
                first_name: childData.child_name,
                age: childData.child_age,
                age_track: ageTrack,
                primary_island: familyData.home_islands[0] || 'Trinidad & Tobago',
                secondary_island: familyData.home_islands[1] || null,
                favorite_character: childData.favourite_characters[0] || null,
                // Gamification defaults are set by DB (total_xp: 0, current_level: 1, etc.)
            })
            .select()
            .single();

        if (childError) {
            console.error('Child Profile Error:', childError);
            return { success: false, error: childError.message };
        }

        console.log('✅ Family Setup Complete! Child ID:', child.id);
        revalidatePath('/portal');
        revalidatePath('/dashboard');
        return { success: true, childId: child.id };

    } catch (err: any) {
        console.error('Setup Exception:', err);
        return { success: false, error: err.message };
    }
}
