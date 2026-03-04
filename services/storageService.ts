
import { Track, StudioContent, AdminCharacter } from "../lib/types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// Local Storage Keys
const PLAYLIST_KEY = 'tanty_radio_playlist';
const STUDIO_LIBRARY_KEY = 'tanty_studio_library';
const CHARACTERS_KEY = 'tanty_characters';

export const PATHS = {
    CHARACTERS: 'characters', // Bucket Name
    RADIO: 'public-radio',    // Bucket Name
    CONFIG: 'config',         // Bucket Name
    STUDIO_LIBRARY: 'studio/library.json',
    USER_UPLOADS: (userId: string) => `users/${userId}/uploads`
};

/**
 * Uploader (Supabase Storage with Real Progress)
 */
export const uploadFile = async (
    file: File | Blob,
    path: string,
    onProgress?: (percent: number) => void
): Promise<string> => {
    try {
        const { uploadFile: unifiedUpload } = await import("../lib/storage");

        // Extract bucket and folder from path
        let bucket: any = 'public-radio';
        let folder: string | undefined = undefined;

        if (path.includes('/')) {
            const parts = path.split('/');
            bucket = parts[0] as any;
            folder = parts.slice(1).join('/');
        } else {
            bucket = path as any;
        }

        const result = await unifiedUpload(bucket, file, folder, {
            onProgress
        });

        if (result) return result.url;
        throw new Error("Upload failed");
    } catch (error) {
        console.warn("[UPLOAD FAILED] Using local fallback", error);
        return URL.createObjectURL(file);
    }
};

// --- HELPERS ---
const getLocal = <T>(key: string): T | null => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};
const setLocal = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

/**
 * PLAYLIST
 */
export const getGlobalPlaylist = async (): Promise<Track[] | null> => {
    if (isSupabaseConfigured()) {
        try {
            // Priority: Fetch from 'songs' table (Admin Uploads)
            const { data: songs } = await supabase
                .from('songs')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (songs && songs.length > 0) {
                return songs.map((s: any) => {
                    // Map legacy DB categories to the DJ segment model.
                    // Segment IDs: tanty_spice, roti, dilly_doubles, steelpan_sam
                    let channel = s.category || 'tanty_spice';

                    if (channel === 'story' || channel === 'lullaby' || channel === 'calm' || channel === 'culture' || channel === 'tanty') channel = 'tanty_spice';
                    if (channel === 'educational' || channel === 'lesson' || channel === 'learning') channel = 'roti';
                    if (channel === 'dilly' || channel === 'food') channel = 'dilly_doubles';
                    if (channel === 'music' || channel === 'soca' || channel === 'steelpan' || channel === 'vip') channel = 'steelpan_sam';

                    return {
                        id: s.id,
                        title: s.title,
                        artist: s.artist || 'Likkle Legends',
                        url: s.audio_url,
                        channel: channel,
                        duration: s.duration_seconds
                    };
                });
            }

            // Fallback to global_config (legacy)
            const { data } = await supabase.from('global_config').select('value').eq('key', 'playlist').single();
            if (data) return data.value;
        } catch (e) {
            console.warn("Playlist fetch error", e);
        }
    }
    return getLocal<Track[]>(PLAYLIST_KEY);
};

export const saveGlobalPlaylist = async (playlist: Track[]): Promise<void> => {
    setLocal(PLAYLIST_KEY, playlist);
    if (isSupabaseConfigured()) {
        try {
            await supabase.from('global_config').upsert({ key: 'playlist', value: playlist });
        } catch (e) { }
    }
};

/**
 * STUDIO LIBRARY
 */
export const getStudioLibrary = async (): Promise<StudioContent[] | null> => {
    if (isSupabaseConfigured()) {
        try {
            const { data } = await supabase.from('global_config').select('value').eq('key', 'studio_library').single();
            if (data) return data.value;
        } catch (e) { }
    }
    return getLocal<StudioContent[]>(STUDIO_LIBRARY_KEY);
};

export const saveStudioLibrary = async (library: StudioContent[]): Promise<void> => {
    setLocal(STUDIO_LIBRARY_KEY, library);
    if (isSupabaseConfigured()) {
        try {
            await supabase.from('global_config').upsert({ key: 'studio_library', value: library });
        } catch (e) { }
    }
};

/**
 * CHARACTERS
 */
export const getCharacters = async (): Promise<AdminCharacter[] | null> => {
    if (isSupabaseConfigured()) {
        try {
            const { data } = await supabase.from('global_config').select('value').eq('key', 'characters').single();
            if (data) return data.value;
        } catch (e) { }
    }
    return getLocal<AdminCharacter[]>(CHARACTERS_KEY);
};

export const saveCharacters = async (characters: AdminCharacter[]): Promise<void> => {
    setLocal(CHARACTERS_KEY, characters);
    if (isSupabaseConfigured()) {
        try {
            await supabase.from('global_config').upsert({ key: 'characters', value: characters });
        } catch (e) { }
    }
};
