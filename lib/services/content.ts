
import { supabase, isSupabaseConfigured } from '@/lib/supabase-client';

/**
 * Likkle Legends v2.0.0 Content Service
 * Unified access to 'content_items' table.
 */

export async function getContentItems(type?: string, island?: string, ageTrack?: string) {
    if (!isSupabaseConfigured()) {
        console.warn(`⚠️ Supabase not configured. Skipping content fetch (${type || 'all'}).`);
        return [];
    }

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

    if (ageTrack) {
        query = query.eq('age_track', ageTrack);
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
    if (!isSupabaseConfigured()) {
        return null;
    }

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
export const getStorybooks = () => getContentItems('story');
export const getVideos = () => getContentItems('video');
export const getPrintables = () => getContentItems('resource_pdf');
export const getMissions = (ageTrack?: string) => getContentItems('mission', undefined, ageTrack);
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

// Songs (Dedicated Table)
export async function getSongs() {
    if (!isSupabaseConfigured()) {
        return [];
    }
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.warn('Songs Fetch Warning:', error.message);
        return [];
    }
    return data || [];
}

export const createSong = (data: any) => supabase.from('songs').insert(data).select().single();
export const updateSong = (id: string, data: any) => supabase.from('songs').update(data).eq('id', id).select().single();
export const deleteSong = (id: string) => supabase.from('songs').delete().eq('id', id);

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
    if (!isSupabaseConfigured()) {
        return [];
    }
    const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('content_type', 'game');
    return data || [];
}

export const createCharacter = (data: any) => upsertContent({ ...data, content_type: 'character' });
export const updateCharacter = (id: string, data: any) => upsertContent({ ...data, id });
export const deleteCharacter = deleteContent;
