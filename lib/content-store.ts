import { supabaseAdmin } from './supabase-client';
import { GeneratedContent } from './types';

const supabase = supabaseAdmin;

export async function saveGeneratedContent(content: GeneratedContent) {
    if (!supabase) {
        console.log(`[ContentStore-MOCK] Would save content ${content.content_id}`);
        return;
    }
    console.log(`[ContentStore] Saving content ${content.content_id} for family ${content.family_id}`);

    // Validate that we have a valid UUID for family_id. 
    // If the orchestrator uses a mock ID (like in tests), this insert will fail if there's no matching profile.
    // We'll wrap in try/catch to be safe.
    try {
        const { error } = await supabase
            .from('generated_content')
            .insert({
                id: content.content_id, // Ensure orchestrator generates a real UUID if possible
                family_id: content.family_id,
                island_id: content.island_id,
                content_type: content.content_type,
                title: content.title,
                payload: content.payload,
                parent_note: content.parent_note,
                metadata: content.metadata,
                admin_status: content.admin_status || 'pending'
            });

        if (error) {
            console.error("[ContentStore] Error saving to Supabase:", error);
            // Don't throw for MVP, just log, so the user still gets the content returned
        } else {
            console.log("[ContentStore] Successfully saved.");
        }
    } catch (e) {
        console.error("[ContentStore] Unexpected error:", e);
    }
}

export async function getFamilyContent(familyId: string) {
    const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function approveContentForKid(contentId: string, familyId: string) {
    const { error } = await supabase
        .from('generated_content')
        .update({ is_approved_for_kid: true, approved_at: new Date().toISOString() })
        .eq('id', contentId)
        .eq('family_id', familyId);

    if (error) throw error;
}
