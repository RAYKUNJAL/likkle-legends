
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

    if (error) {
        // Build-safe error handling: Log warning but return empty array to prevent build crash
        // This is critical for initial deployment when tables might not exist yet.
        console.warn(`Content Fetch Warning (${type || 'all'}):`, error.message);
        return [];
    }

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

    if (error) {
        // Build-safe: Return null instead of crashing
        console.warn(`Content Fetch Warning (id: ${id}):`, error.message);
        return null;
    }
    return data;
}

// Legacy Aliases for compatibility during transition
export const getCharacters = () => getContentItems('character');
export const getSongs = () => getContentItems('song');
export const getStorybooks = () => getContentItems('story');
export const getVideos = () => getContentItems('video');
export const getPrintables = () => getContentItems('resource_pdf');
export const getMissions = (ageTrack?: string) => getContentItems('mission');
export const getGameById = (id: string) => getContentById(id);

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

// Type-specific CRUD aliases for Admin Pages
export const createSong = (data: any) => upsertContent({ ...data, content_type: 'song' });
export const updateSong = (id: string, data: any) => upsertContent({ ...data, id });
export const deleteSong = deleteContent;

export const createStorybook = (data: any) => upsertContent({ ...data, content_type: 'story' });
export const updateStorybook = (id: string, data: any) => upsertContent({ ...data, id });
export const deleteStorybook = deleteContent;

export const createVideo = (data: any) => upsertContent({ ...data, content_type: 'video' });
export const updateVideo = (id: string, data: any) => upsertContent({ ...data, id });
export const deleteVideo = deleteContent;

export const createPrintable = (data: any) => upsertContent({ ...data, content_type: 'resource_pdf' });
export const updatePrintable = (id: string, data: any) => upsertContent({ ...data, id });
export const deletePrintable = deleteContent;

// Support for other tables that might still exist or be added
export async function getGames() {
    const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('content_type', 'game');
    return data || [];
}

export const createCharacter = (data: any) => upsertContent({ ...data, content_type: 'character' });
export const updateCharacter = (id: string, data: any) => upsertContent({ ...data, id });
export const deleteCharacter = deleteContent;
