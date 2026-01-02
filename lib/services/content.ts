
import { supabase } from '@/lib/storage';

export async function getCharacters() {
    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getSongs(tierRequired?: string) {
    let query = supabase
        .from('songs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (tierRequired) {
        query = query.eq('tier_required', tierRequired);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getStorybooks(tierRequired?: string) {
    let query = supabase
        .from('storybooks')
        .select('*, characters(*)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (tierRequired) {
        query = query.eq('tier_required', tierRequired);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getVideos(tierRequired?: string) {
    let query = supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (tierRequired) {
        query = query.eq('tier_required', tierRequired);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getPrintables(category?: string) {
    let query = supabase
        .from('printables')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getMissions(ageTrack?: string) {
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false });

    if (ageTrack) {
        query = query.or(`age_track.eq.${ageTrack},age_track.eq.all`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function getVRLocations() {
    const { data, error } = await supabase
        .from('vr_locations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

// Admin Content Operations
export async function createCharacter(characterData: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('characters')
        .insert(characterData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCharacter(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createSong(songData: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('songs')
        .insert(songData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateSong(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('songs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createVideo(videoData: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateVideo(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createStorybook(storybookData: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('storybooks')
        .insert(storybookData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createPrintable(printableData: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('printables')
        .insert(printableData)
        .select()
        .single();

    if (error) throw error;
    return data;
}
