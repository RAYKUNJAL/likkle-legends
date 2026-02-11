
import { supabase } from '@/lib/storage';
import { createAdminClient } from '@/lib/admin';
import { siteContent } from '@/lib/content';

/**
 * Fetches site content for a specific section.
 * Falls back to static content if DB entry is missing.
 */
export async function getSiteContent<T = any>(key: string): Promise<T> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('content')
            .eq('key', key)
            .single();

        if (error || !data) {
            // Fallback to static file
            return (siteContent as any)[key] as T;
        }

        return data.content as T;
    } catch (e) {
        console.warn(`CMS Fetch Error for ${key}:`, e);
        return (siteContent as any)[key] as T;
    }
}

/**
 * Updates site content for a specific section.
 * Requires Admin Privileges (handled by valid Admin Client usage).
 */
export async function updateSiteContent(key: string, content: any, userId?: string) {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
        .from('site_settings')
        .upsert({
            key,
            content,
            updated_by: userId,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}


let contentCache: any = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Gets the fully merged site content object.
 * Incorporates DB overrides with proper caching.
 */
export async function getMergedSiteContent(forceRefresh = false) {
    const now = Date.now();

    if (contentCache && !forceRefresh && (now - lastFetch < CACHE_TTL)) {
        return contentCache;
    }

    try {
        const { data: dbSettings, error } = await supabase
            .from('site_settings')
            .select('key, content');

        const mergedContent = JSON.parse(JSON.stringify(siteContent));

        if (error) {
            // If table doesn't exist (e.g. fresh install), just warn and use static content
            if (error.code === '42P01') { // undefined_table
                console.warn("CMS Table (site_settings) not found. Using static content.");
            } else {
                console.warn("CMS Fetch Warning:", error.message);
            }
            return mergedContent;
        }

        if (dbSettings) {
            const keys = Object.keys(siteContent);
            dbSettings.forEach((setting) => {
                if (keys.includes(setting.key)) {
                    (mergedContent as any)[setting.key] = setting.content;
                }
            });
        }

        contentCache = mergedContent;
        lastFetch = now;
        return mergedContent;
    } catch (e) {
        console.warn("CMS Merge Exception:", e);
        return siteContent;
    }
}
