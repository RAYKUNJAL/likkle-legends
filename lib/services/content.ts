
import { supabase } from '@/lib/storage';

/**
 * Likkle Legends v2.0.0 Content Service
 * Unified access to 'content_items' table.
 */

export async function getContentItems(type?: string, island?: string) {
    let query = supabase
        .from('content_items')
        .select(`
            *,
            content_localizations(*)
        `)
        .order('created_at', { ascending: false });

    if (type) {
        query = query.eq('content_type', type);
    }

    if (island) {
        query = query.eq('island_code', island);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getContentById(id: string) {
    const { data, error } = await supabase
        .from('content_items')
        .select(`
            *,
            content_localizations(*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

// Legacy Aliases for compatibility during transition
export const getCharacters = () => getContentItems('character');
export const getSongs = () => getContentItems('song');
export const getStorybooks = () => getContentItems('story');
export const getVideos = () => getContentItems('video');
export const getPrintables = () => getContentItems('resource_pdf');

// Admin Operations
export async function upsertContent(contentData: any) {
    const { data, error } = await supabase
        .from('content_items')
        .upsert(contentData, { onConflict: 'slug' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteContent(id: string) {
    const { error } = await supabase.from('content_items').delete().eq('id', id);
    if (error) throw error;
    return true;
}

// Support for other tables that might still exist or be added
export async function getGames() {
    const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('content_type', 'game');
    return data || [];
}
