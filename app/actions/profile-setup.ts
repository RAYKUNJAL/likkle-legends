
'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
        // 2. Perform Transaction (Upsert Family, Insert Child)
        // Since Supabase doesn't support strict transactions via client easily without RPC, we'll do sequential.

        // --- FAMILY PROFILE ---
        // Check if exists first to update, or insert.
        const { data: family, error: familyError } = await supabase
            .from('family_profile')
            .upsert({
                user_id: user.id,
                home_islands: familyData.home_islands,
                language_flavour: familyData.language_flavour,
                max_story_length_pages: familyData.max_story_length_pages,
                allow_scary_folklore: familyData.allow_scary_folklore,
                allow_trickster_folklore: familyData.allow_trickster_folklore,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (familyError) {
            console.error('Family Profile Error:', familyError);
            return { success: false, error: familyError.message };
        }

        // --- CHILD PROFILE ---
        const { data: child, error: childError } = await supabase
            .from('child_profile')
            .insert({
                family_id: family.id,
                child_name: childData.child_name,
                age_years: childData.child_age, // storing denormalized
                reading_level: childData.reading_level,
                attention_span: childData.attention_span,
                favourite_topics: childData.favourite_topics,
                favourite_characters: childData.favourite_characters
            })
            .select()
            .single();

        if (childError) {
            console.error('Child Profile Error:', childError);
            return { success: false, error: childError.message };
        }

        // --- CHILD LEARNING STATE (Optional but good to init) ---
        // Initialize basic subjects: Culture, HFLE
        const subjects = ['Culture', 'HFLE'];
        const learningStates = subjects.map(subject => ({
            child_id: child.id,
            subject: subject,
            level_band: 'A', // Default start
            total_books_generated: 0
        }));

        const { error: learningError } = await supabase
            .from('child_learning_state')
            .insert(learningStates);

        if (learningError) {
            console.warn('Learning State Init Warning (Non-critical):', learningError);
        }

        console.log('✅ Family Setup Complete!');
        revalidatePath('/dashboard');
        return { success: true };

    } catch (err: any) {
        console.error('Setup Exception:', err);
        return { success: false, error: err.message };
    }
}
