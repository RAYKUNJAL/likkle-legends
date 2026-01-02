
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

/**
 * Gets the fully merged site content object.
 * Useful for the main page to get everything in one go.
 */
export async function getMergedSiteContent() {
    const keys = Object.keys(siteContent);
    const { data: dbSettings } = await supabase.from('site_settings').select('key, content');

    const mergedContent = { ...siteContent };

    if (dbSettings) {
        dbSettings.forEach((setting) => {
            if (keys.includes(setting.key)) {
                (mergedContent as any)[setting.key] = setting.content;
            }
        });
    }

    return mergedContent;
}
