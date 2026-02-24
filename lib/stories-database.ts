/**
 * 📚 Stories Database Functions
 * Query stories from Supabase with intelligent filtering
 */

import { supabase } from '@/lib/storage';
import { StoryBook } from '@/types/story';

export interface StoryFilters {
    tradition?: string;
    reading_level?: string;
    island_code?: string;
    age_track?: string;
    limit?: number;
}

/**
 * Get stories based on child profile (smart filtering)
 */
export async function getStoriesForChild(
    childAge: number,
    childIsland: string,
    childReadingLevel?: string
) {
    const age_track = childAge <= 5 ? 'mini' : 'big';
    const reading_level = childReadingLevel || (childAge <= 5 ? 'emergent' : 'early');

    try {
        const { data, error } = await supabase
            .from('stories_library')
            .select('id, title, slug, cover_image_url, summary, tradition, xp_reward, estimated_reading_time_minutes')
            .eq('age_track', age_track)
            .eq('reading_level', reading_level)
            .eq('island_code', childIsland)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[StoriesDB] Error fetching child stories:', error);
        return [];
    }
}

/**
 * Get a specific story by slug
 */
export async function getStoryBySlug(slug: string): Promise<StoryBook | null> {
    try {
        const { data, error } = await supabase
            .from('stories_library')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data?.content_json as StoryBook || null;
    } catch (error) {
        console.error('[StoriesDB] Error fetching story:', error);
        return null;
    }
}

/**
 * Get stories by tradition (Anansi, Papa Bois, River Mumma, Chickcharney)
 */
export async function getStoriesByTradition(
    tradition: string,
    filters?: Partial<StoryFilters>
) {
    try {
        let query = supabase
            .from('stories_library')
            .select('id, title, slug, cover_image_url, summary, tradition, xp_reward')
            .eq('tradition', tradition)
            .eq('is_active', true);

        if (filters?.reading_level) {
            query = query.eq('reading_level', filters.reading_level);
        }
        if (filters?.island_code) {
            query = query.eq('island_code', filters.island_code);
        }
        if (filters?.age_track) {
            query = query.eq('age_track', filters.age_track);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(filters?.limit || 10);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[StoriesDB] Error fetching tradition stories:', error);
        return [];
    }
}

/**
 * Get all stories for an island
 */
export async function getStoriesByIsland(island_code: string, limit = 20) {
    try {
        const { data, error } = await supabase
            .from('stories_library')
            .select('id, title, slug, cover_image_url, summary, tradition, reading_level')
            .eq('island_code', island_code)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[StoriesDB] Error fetching island stories:', error);
        return [];
    }
}

/**
 * Get all stories matching multiple filters
 */
export async function getStoriesWithFilters(filters: StoryFilters) {
    try {
        let query = supabase
            .from('stories_library')
            .select('*')
            .eq('is_active', true);

        if (filters.tradition) {
            query = query.eq('tradition', filters.tradition);
        }
        if (filters.reading_level) {
            query = query.eq('reading_level', filters.reading_level);
        }
        if (filters.island_code) {
            query = query.eq('island_code', filters.island_code);
        }
        if (filters.age_track) {
            query = query.eq('age_track', filters.age_track);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(filters.limit || 50);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[StoriesDB] Error fetching filtered stories:', error);
        return [];
    }
}

/**
 * Get random story (for "Surprise Me" feature)
 */
export async function getRandomStory(age_track: 'mini' | 'big', island_code: string) {
    try {
        const { data, error } = await supabase
            .from('stories_library')
            .select('*')
            .eq('age_track', age_track)
            .eq('island_code', island_code)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;
        return data?.[0]?.content_json as StoryBook || null;
    } catch (error) {
        console.error('[StoriesDB] Error fetching random story:', error);
        return null;
    }
}

/**
 * Get count of stories (for analytics)
 */
export async function getStoryCount(filters?: StoryFilters): Promise<number> {
    try {
        let query = supabase
            .from('stories_library')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);

        if (filters?.tradition) {
            query = query.eq('tradition', filters.tradition);
        }
        if (filters?.island_code) {
            query = query.eq('island_code', filters.island_code);
        }

        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('[StoriesDB] Error getting story count:', error);
        return 0;
    }
}
