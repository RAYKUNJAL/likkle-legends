
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
        .select('id, title, description, content_type, thumbnail_url, audio_url, video_url, tier_required, age_track, island_code, slug, metadata, reward_xp, game_config, is_active, created_at')
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
        .select('id, title, description, content_type, thumbnail_url, audio_url, video_url, tier_required, age_track, island_code, slug, metadata, reward_xp, game_config, is_active, created_at')
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
export async function getStorybooks() {
    const data = await getContentItems('story');
    // Map content_items columns → shape expected by the portal
    return data.map((item: any) => ({
        ...item,
        summary: item.description,
        cover_image_url: item.thumbnail_url,
        reading_time_minutes: item.metadata?.reading_time_minutes ?? 5,
    }));
}
export const getVideos = () => getContentItems('video');
export const getMissions = (ageTrack?: string) => getContentItems('mission', undefined, ageTrack);
export const getGameById = (id: string) => getContentById(id);

// Printables — dedicated table (has pdf_url, category, thumbnail_url, is_new)
export async function getPrintables() {
    if (!isSupabaseConfigured()) {
        return [];
    }
    const { data, error } = await supabase
        .from('printables')
        .select('id, title, description, category, tier_required, pdf_url, preview_url, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) {
        console.warn('Printables Fetch Warning:', error.message);
        return [];
    }
    // Map thumbnail_url → preview_url so the portal UI finds it
    return (data || []).map((p: any) => ({ ...p, preview_url: p.thumbnail_url }));
}

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
        .select('id, title, artist, audio_url, thumbnail_url, tier_required, is_premium, reward_xp, created_at')
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

export const createPrintable = (data: any) => supabase.from('printables').insert(data).select().single();
export const updatePrintable = (id: string, data: any) => supabase.from('printables').update(data).eq('id', id).select().single();
export const deletePrintable = (id: string) => supabase.from('printables').delete().eq('id', id);

// Support for other tables that might still exist or be added
export async function getGames() {
    if (!isSupabaseConfigured()) {
        return [];
    }
    const { data } = await supabase
        .from('content_items')
        .select('id, title, description, thumbnail_url, tier_required, age_track, metadata, game_config, reward_xp, slug')
        .eq('content_type', 'game');
    return data || [];
}

export const createCharacter = (data: any) => upsertContent({ ...data, content_type: 'character' });
export const updateCharacter = (id: string, data: any) => upsertContent({ ...data, id });
export const deleteCharacter = deleteContent;
