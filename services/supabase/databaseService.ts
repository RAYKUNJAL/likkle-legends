
import { supabase } from "../../lib/supabase";
import { StoryParams, SavedStory, Track, AdminCharacter } from "../../lib/types";

// Note: VideoMetadata might be missing in lib/types, I'll define it here or check types again.
export interface VideoMetadata {
    id: string;
    cloudflareId: string;
    title: string;
    description: string;
    category: string;
    tier: string;
    thumbnailUrl: string;
    isHero: boolean;
    createdAt?: string;
}

// --- LOCAL STORAGE HELPERS (Fallback) ---
const getLocal = <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch { return null; }
};

const setLocal = (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.warn("Local storage full"); }
};

// --- USERS ---

export const getAdminStats = async () => {
    // 1. Total Citizens
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // 2. Paid Citizens (Non-free tiers)
    const { count: paidCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('subscription_tier', 'eq', 'plan_free_forever');

    // 3. Total Videos
    const { count: videoCount } = await supabase.from('videos').select('*', { count: 'exact', head: true });

    // 4. Monthly Revenue (from orders table for current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
        .from('orders')
        .select('amount_cents')
        .gte('created_at', startOfMonth.toISOString());

    const revenue = (orders?.reduce((acc, o) => acc + (o.amount_cents || 0), 0) || 0) / 100;

    return {
        totalUsers: userCount || 0,
        paidUsers: paidCount || 0,
        totalVideos: videoCount || 0,
        revenue: Math.round(revenue)
    };
};

export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, subscription_tier, created_at, full_name')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        plan: u.subscription_tier,
        joinedAt: u.created_at,
        details: { full_name: u.full_name }
    }));
};

export const updateUserPlan = async (userId: string, plan: string): Promise<boolean> => {
    const { error } = await supabase
        .from('profiles')
        .update({
            subscription_tier: plan
        })
        .eq('id', userId);

    return !error;
};

export const getRecentActivity = async () => {
    const { data } = await supabase
        .from('community_posts')
        .select('author, caption, created_at, avatar')
        .order('created_at', { ascending: false })
        .limit(5);
    return data || [];
};

export const updateGlobalSetting = async (key: string, value: any) => {
    const { error } = await supabase.from('global_config').upsert({ key, value });
    return !error;
};

export const fetchGlobalSettings = async () => {
    const { data } = await supabase.from('global_config').select('*');
    const settings: Record<string, any> = {};
    data?.forEach((row: any) => {
        settings[row.key] = row.value;
    });
    return settings;
};

// --- VIDEO ---
export const addVideoToLibrary = async (video: VideoMetadata): Promise<boolean> => {
    const { error } = await supabase
        .from('videos')
        .upsert({
            id: video.id,
            video_url: `https://customer-v626v26.cloudflarestream.com/${video.cloudflareId}/manifest/video.m3u8`, // HLS manifest format
            title: video.title,
            description: video.description,
            category: video.category,
            tier_required: video.tier,
            thumbnail_url: video.thumbnailUrl,
            display_order: video.isHero ? -1 : 0, // Using display_order instead of is_hero
            created_at: new Date().toISOString()
        });
    return !error;
};

export const getVideoLibrary = async (): Promise<VideoMetadata[]> => {
    const { data } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (!data) return [];

    return data.map((v: any) => ({
        id: v.id,
        cloudflareId: v.video_url.split('/').slice(-3)[0], // Extract ID from URL
        title: v.title,
        description: v.description,
        category: v.category,
        tier: v.tier_required,
        thumbnailUrl: v.thumbnail_url,
        isHero: v.display_order === -1,
        createdAt: v.created_at
    }));
};

export const deleteVideoMetadata = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    return !error;
};

export const setHeroVideo = async (id: string): Promise<boolean> => {
    // Reset others
    await supabase.from('videos').update({ display_order: 0 }).neq('id', id);
    // Set this one
    const { error } = await supabase.from('videos').update({ display_order: -1 }).eq('id', id);
    return !error;
};
