/**
 * 📚 Stories Database Functions
 * Query stories from Supabase with intelligent filtering
 */

import { supabase } from '@/lib/storage';
import { StoryBook } from '@/types/story';
import { transformToStoryBook } from '@/lib/story-transformer';

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
        console.log('[StoriesDB] 📖 getStoryBySlug called with slug:', slug);
        const { data, error } = await supabase
            .from('stories_library')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('[StoriesDB] ❌ Supabase query error:', error.message, error.code);
            throw error;
        }

        if (!data) {
            console.warn('[StoriesDB] ⚠️ No data returned for slug:', slug);
            return null;
        }

        console.log('[StoriesDB] ✅ Data fetched for slug:', slug, '- title:', data.title);

        // Transform simple story to full StoryBook format
        console.log('[StoriesDB] 🔄 Transforming to StoryBook format...');
        const transformed = transformToStoryBook(data);
        console.log('[StoriesDB] ✨ Transform complete - pages:', transformed.structure?.pages?.length);

        return transformed;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('[StoriesDB] ❌ Error fetching story by slug:', errorMsg);
        if (error instanceof Error && error.stack) console.error('[StoriesDB] Stack:', error.stack);
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
        console.log('[StoriesDB] 🎯 getStoriesByTradition called - tradition:', tradition, 'filters:', filters);

        let query = supabase
            .from('stories_library')
            .select('id, title, slug, cover_image_url, summary, tradition, xp_reward')
            .eq('tradition', tradition)
            .eq('is_active', true);

        if (filters?.reading_level) {
            console.log('[StoriesDB] Adding filter - reading_level:', filters.reading_level);
            query = query.eq('reading_level', filters.reading_level);
        }
        if (filters?.island_code) {
            console.log('[StoriesDB] Adding filter - island_code:', filters.island_code);
            query = query.eq('island_code', filters.island_code);
        }
        if (filters?.age_track) {
            console.log('[StoriesDB] Adding filter - age_track:', filters.age_track);
            query = query.eq('age_track', filters.age_track);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(filters?.limit || 10);

        if (error) {
            console.error('[StoriesDB] ❌ Supabase query error:', error.message, error.code);
            throw error;
        }

        console.log('[StoriesDB] ✅ Query successful - returned', data?.length || 0, 'stories');
        if (data && data.length > 0) {
            console.log('[StoriesDB] Story IDs:', data.map((s: any) => s.slug).join(', '));
        }

        return data || [];
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('[StoriesDB] ❌ Error fetching tradition stories:', errorMsg);
        if (error instanceof Error && error.stack) console.error('[StoriesDB] Stack:', error.stack);
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
