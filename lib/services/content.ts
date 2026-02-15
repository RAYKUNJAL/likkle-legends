
import { supabase } from '@/lib/storage';

/**
 * Likkle Legends v3.1.0 Content Service
 * Professional Schema: Using separate tables for optimized assets
 */

// --- Storybooks ---
export async function getStorybooks(island?: string) {
    let query = supabase
        .from('storybooks')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (island && island !== 'All Islands') {
        query = query.eq('island_theme', island);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getStorybookById(id: string) {
    const { data, error } = await supabase
        .from('storybooks')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

// --- Songs ---
export async function getSongs(island?: string) {
    let query = supabase
        .from('songs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (island) {
        query = query.eq('island_origin', island);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// --- Videos ---
export async function getVideos(island?: string) {
    let query = supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (island) {
        query = query.eq('island_theme', island);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// --- Characters ---
export async function getCharacters() {
    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

// --- Printables ---
export async function getPrintables(category?: string) {
    let query = supabase
        .from('printables')
        .select('*')
        .eq('is_active', true);

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// --- Games ---
export async function getGames() {
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getGameById(id: string) {
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

// --- Legacy Aliases for minimal code breakage ---
export const deleteContent = (id: string) => supabase.from('storybooks').delete().eq('id', id); // Simplified for now

export const createSong = (data: any) => supabase.from('songs').insert(data).select().single();
export const updateSong = (id: string, data: any) => supabase.from('songs').update(data).eq('id', id).select().single();
export const deleteSong = (id: string) => supabase.from('songs').delete().eq('id', id);

export const createVideo = (data: any) => supabase.from('videos').insert(data).select().single();
export const updateVideo = (id: string, data: any) => supabase.from('videos').update(data).eq('id', id).select().single();
export const deleteVideo = (id: string) => supabase.from('videos').delete().eq('id', id);

export const createStorybook = (data: any) => supabase.from('storybooks').insert(data).select().single();
export const updateStorybook = (id: string, data: any) => supabase.from('storybooks').update(data).eq('id', id).select().single();
export const deleteStorybook = (id: string) => supabase.from('storybooks').delete().eq('id', id);

export const createPrintable = (data: any) => supabase.from('printables').insert(data).select().single();
export const updatePrintable = (id: string, data: any) => supabase.from('printables').update(data).eq('id', id).select().single();
export const deletePrintable = (id: string) => supabase.from('printables').delete().eq('id', id);

// --- Missions ---
export async function getMissions() {
    // Missions are currently stored in a separate table or filtered from storybooks
    // For now, let's look for content marked as mission or use a placeholder
    const { data, error } = await supabase
        .from('storybooks')
        .select('*')
        .eq('is_active', true)
        .eq('age_track', 'mission'); // Example filter

    if (error) return [];
    return data || [];
}

export const getContentItems = (type?: string) => {
    switch (type) {
        case 'story': return getStorybooks();
        case 'song': return getSongs();
        case 'video': return getVideos();
        case 'character': return getCharacters();
        case 'resource_pdf': return getPrintables();
        case 'game': return getGames();
        default: return getStorybooks();
    }
}
export const getContentById = (id: string) => getStorybookById(id);
