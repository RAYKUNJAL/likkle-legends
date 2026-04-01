"use server";

import { createAdminClient } from "@/lib/admin";
import { supabase } from "@/lib/storage";
import { logAdminAction, logAdminActionError, AdminAction, ResourceType } from "@/lib/audit-logger";

type ModelPrice = {
    inputPer1M: number;
    outputPer1M: number;
    cachedInputPer1M?: number;
};

export type AICostControls = {
    monthlyBudgetUSD: number;
    warnThresholdPct: number;
    hardStopThresholdPct: number;
    taskRouting: Record<string, string>;
    modelPricesUSDPer1M: Record<string, ModelPrice>;
};

export type AICostSnapshot = {
    windowDays: number;
    usageEvents: number;
    aiUsageEvents: number;
    tokensIn: number;
    tokensOut: number;
    estimatedCostUSD: number;
    estimatedCostMonthlyUSD: number;
    budget: {
        monthlyBudgetUSD: number;
        warnThresholdPct: number;
        hardStopThresholdPct: number;
        pctUsed: number;
        status: 'ok' | 'warn' | 'over';
    };
    byModel: Array<{
        model: string;
        calls: number;
        tokensIn: number;
        tokensOut: number;
        estimatedCostUSD: number;
    }>;
    notes: string[];
    controls: AICostControls;
};

const DEFAULT_AI_COST_CONTROLS: AICostControls = {
    monthlyBudgetUSD: 300,
    warnThresholdPct: 80,
    hardStopThresholdPct: 100,
    taskRouting: {
        classification: 'gemini-3.1-flash-preview',
        extraction: 'gemini-3.1-flash-preview',
        moderation: 'gemini-3.1-flash-preview',
        chat: 'gemini-3.1-flash-preview',
        creative: 'gemini-3.1-pro-preview',
        long_form: 'gemini-3.1-pro-preview',
        coding: 'gpt-5-codex',
    },
    modelPricesUSDPer1M: {
        'gpt-5-codex': { inputPer1M: 1.25, outputPer1M: 10, cachedInputPer1M: 0.125 },
        'gemini-3.1-flash-preview': { inputPer1M: 0, outputPer1M: 0 },
        'gemini-3.1-pro-preview': { inputPer1M: 0, outputPer1M: 0 },
    },
};

function mergeCostControls(raw: unknown): AICostControls {
    if (!raw || typeof raw !== 'object') {
        return DEFAULT_AI_COST_CONTROLS;
    }
    const c = raw as Partial<AICostControls>;
    return {
        monthlyBudgetUSD: Number(c.monthlyBudgetUSD ?? DEFAULT_AI_COST_CONTROLS.monthlyBudgetUSD),
        warnThresholdPct: Number(c.warnThresholdPct ?? DEFAULT_AI_COST_CONTROLS.warnThresholdPct),
        hardStopThresholdPct: Number(c.hardStopThresholdPct ?? DEFAULT_AI_COST_CONTROLS.hardStopThresholdPct),
        taskRouting: { ...DEFAULT_AI_COST_CONTROLS.taskRouting, ...(c.taskRouting || {}) },
        modelPricesUSDPer1M: { ...DEFAULT_AI_COST_CONTROLS.modelPricesUSDPer1M, ...(c.modelPricesUSDPer1M || {}) },
    };
}

function estimateCostForModel(
    controls: AICostControls,
    model: string,
    inputTokens: number,
    outputTokens: number
): number {
    const pricing = controls.modelPricesUSDPer1M[model];
    if (!pricing) return 0;
    const inputCost = (Math.max(0, inputTokens) / 1_000_000) * pricing.inputPer1M;
    const outputCost = (Math.max(0, outputTokens) / 1_000_000) * pricing.outputPer1M;
    return inputCost + outputCost;
}

function resolveModelFromUsageRow(row: any): string {
    const explicitModel =
        row?.model ||
        row?.metadata?.model ||
        row?.metadata?.model_name ||
        row?.metadata?.ai_model;
    if (typeof explicitModel === 'string' && explicitModel.trim()) return explicitModel.trim();

    const tier =
        row?.model_tier_used ||
        row?.metadata?.model_tier_used ||
        row?.metadata?.tier;

    if (tier === 'tier_2_strong') return 'gemini-3.1-pro-preview';
    if (tier === 'tier_1_mid' || tier === 'tier_0_low_cost') return 'gemini-3.1-flash-preview';
    return 'unknown';
}

// Helper to get admin user info from token (for audit logging)
async function getAdminUserInfo(token: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) throw new Error("Supabase config missing");

    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(url, serviceKey || anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) {
        throw new Error(`Failed to get user info: ${error?.message || 'Unknown error'}`);
    }

    return { id: user.id, email: user.email || '' };
}

// Helper to verify admin access
export async function verifyAdmin(token: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) throw new Error("Supabase config missing");

    // Create a fresh SERVER-SAFE client to avoid hangs
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(url, serviceKey || anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    try {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Auth Check Hanged (5s limit)")), 5000)
        );

        console.log("verifyAdmin: Checking token validity...");
        const { data: { user }, error } = await Promise.race([
            admin.auth.getUser(token),
            timeout
        ]);

        if (error || !user) {
            console.error("verifyAdmin: Token verification failed", error?.message);
            throw new Error(`Unauthorized: ${error?.message || 'Invalid session'}`);
        }

        // Check admin status in database (removed email-based privilege escalation)
        console.log(`verifyAdmin: Checking permissions for ${user.email}...`);

        // Parallel check for admin_users table and profiles table
        const [adminCheck, profileCheck] = await Promise.all([
            admin.from('admin_users').select('role').eq('id', user.id).single(),
            admin.from('profiles').select('is_admin, role').eq('id', user.id).single()
        ]);

        const hasAdminRole =
            adminCheck.data?.role === 'admin' ||
            adminCheck.data?.role === 'super_admin' ||
            profileCheck.data?.is_admin === true ||
            profileCheck.data?.role === 'admin';

        if (!hasAdminRole) {
            console.warn(`verifyAdmin: Access denied for ${user.email}`);
            throw new Error("Forbidden: Admin access required");
        }

        console.log(`verifyAdmin: Access granted for ${user.email}`);
        return admin;
    } catch (e: any) {
        console.error("verifyAdmin: CRITICAL ERROR", e.message);
        throw new Error(e.message || "Admin verification failed");
    }
}

export async function getAdminAnalytics(token: string) {
    const admin = await verifyAdmin(token);

    // Total subscribers
    const { count: totalSubscribers } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_tier', 'free');

    // Active subscribers
    const { count: activeSubscribers } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

    // Pending orders
    const { count: pendingOrders } = await admin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('fulfillment_status', 'pending');

    // Active children (activity in last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { count: activeChildren } = await admin
        .from('children')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity_date', sevenDaysAgo);

    // New signups last 30 days
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newSignups } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

    // Monthly Revenue (Current Month)
    const firstOfOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const { data: revenueData } = await admin
        .from('purchased_content')
        .select('amount_paid')
        .gte('purchased_at', firstOfOfMonth);

    const monthlyRevenue = revenueData?.reduce((acc, p) => acc + (Number(p.amount_paid) || 0), 0) || 0;

    return {
        totalSubscribers: totalSubscribers || 0,
        activeSubscribers: activeSubscribers || 0,
        pendingOrders: pendingOrders || 0,
        activeChildren: activeChildren || 0,
        newSignups: newSignups || 0,
        monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2))
    };
}

export async function getRecentOrdersAdmin(token: string) {
    const admin = await verifyAdmin(token);

    const { data: orders } = await admin
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(5);

    return orders || [];
}

export async function getRecentCustomersAdmin(token: string) {
    const admin = await verifyAdmin(token);

    const { data: profiles } = await admin
        .from('profiles')
        .select('*, children(*)')
        .order('created_at', { ascending: false })
        .limit(5);

    return profiles || [];
}

export async function getAllProfilesAdmin(token: string, limit = 100, offset = 0) {
    const admin = await verifyAdmin(token);
    const { data, error, count } = await admin
        .from('profiles')
        .select('*, children(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { profiles: data || [], total: count || 0 };
}

/**
 * Compatibility alias for UserManagement component
 */
export async function getAllUsersAction() {
    // Get token from cookies server-side if not passed
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token')?.value || '';

    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getAllOrdersAdmin(token: string, status?: string, limit = 100, offset = 0) {
    const admin = await verifyAdmin(token);
    let query = admin
        .from('orders')
        .select('*, profiles(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
        query = query.eq('fulfillment_status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { orders: data || [], total: count || 0 };
}

export async function updateOrderStatusAdmin(token: string, orderId: string, status: string, trackingNumber?: string) {
    const admin = await verifyAdmin(token);
    const updates: Record<string, any> = { fulfillment_status: status };

    if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
        if (trackingNumber) updates.tracking_number = trackingNumber;
    } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
    }

    try {
        const { data, error } = await admin
            .from('orders')
            .update(updates)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        // Log the action (non-blocking)
        try {
            const adminUser = await getAdminUserInfo(token);
            const serviceAdmin = await verifyAdmin(token); // Get service role admin client for logging
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (url && serviceKey) {
                const { createClient } = await import('@supabase/supabase-js');
                const loggingClient = createClient(url, serviceKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
                logAdminAction(
                    loggingClient,
                    adminUser.id,
                    adminUser.email,
                    'update_order_status',
                    'order',
                    orderId,
                    { new_status: status, tracking_number: trackingNumber }
                );
            }
        } catch (auditError) {
            console.error('Failed to log order status update:', auditError);
        }

        return data;
    } catch (error) {
        // Log the error (non-blocking)
        try {
            const adminUser = await getAdminUserInfo(token);
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (url && serviceKey) {
                const { createClient } = await import('@supabase/supabase-js');
                const loggingClient = createClient(url, serviceKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
                logAdminActionError(
                    loggingClient,
                    adminUser.id,
                    adminUser.email,
                    'update_order_status',
                    'order',
                    error instanceof Error ? error.message : String(error),
                    orderId
                );
            }
        } catch (auditError) {
            console.error('Failed to log order status error:', auditError);
        }
        throw error;
    }
}

export async function getAdminContent(token: string, category: 'songs' | 'videos' | 'printables' | 'storybooks') {
    console.log(`📡 getAdminContent: Fetching ${category}...`);
    try {
        const admin = await verifyAdmin(token);
        const { data, error } = await admin
            .from(category)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`❌ getAdminContent error for ${category}:`, error.message);
            throw error;
        }
        console.log(`✅ getAdminContent: Found ${data?.length || 0} items for ${category}`);
        return data || [];
    } catch (e: any) {
        console.error(`💥 getAdminContent critical failure:`, e.message);
        throw e;
    }
}

export async function saveAdminContent(token: string, category: string, assetData: any) {
    const admin = await verifyAdmin(token);
    const { id, ...data } = assetData;

    if (id) {
        const { data: updated, error } = await admin
            .from(category)
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return updated;
    } else {
        const { data: created, error } = await admin
            .from(category)
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return created;
    }
}

export async function deleteAdminContent(token: string, category: string, id: string) {
    const admin = await verifyAdmin(token);
    const { error } = await admin
        .from(category)
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function getSiteSettings(token: string, key: string) {
    try {
        const admin = await verifyAdmin(token);
        const { data, error } = await admin
            .from('site_settings')
            .select('content')
            .eq('key', key)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows'
            throw error;
        }

        return data?.content || null;
    } catch (e: any) {
        console.error(`getSiteSettings failed:`, e.message);
        throw e;
    }
}

export async function saveSiteSettings(token: string, key: string, content: any) {
    try {
        const admin = await verifyAdmin(token);
        const { error } = await admin
            .from('site_settings')
            .upsert({
                key,
                content,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error(`saveSiteSettings failed:`, e.message);
        throw e;
    }
}

export async function getAdminCharacters(token: string) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('characters')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function saveAdminCharacter(token: string, characterData: any) {
    const admin = await verifyAdmin(token);
    const { id, ...data } = characterData;

    if (id) {
        const { data: updated, error } = await admin
            .from('characters')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return updated;
    } else {
        const { data: created, error } = await admin
            .from('characters')
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return created;
    }
}

export async function getContentCounts(token: string) {
    const admin = await verifyAdmin(token);

    const [songs, storybooks, videos, printables, characters, games, announcements, customSongs] = await Promise.all([
        admin.from('songs').select('*', { count: 'exact', head: true }),
        admin.from('storybooks').select('*', { count: 'exact', head: true }),
        admin.from('videos').select('*', { count: 'exact', head: true }),
        admin.from('printables').select('*', { count: 'exact', head: true }),
        admin.from('characters').select('*', { count: 'exact', head: true }),
        admin.from('games').select('*', { count: 'exact', head: true }),
        admin.from('announcements').select('*', { count: 'exact', head: true }),
        admin.from('custom_song_requests').select('*', { count: 'exact', head: true }),
    ]);

    return {
        songs: songs.count || 0,
        stories: storybooks.count || 0,
        videos: videos.count || 0,
        printables: printables.count || 0,
        characters: characters.count || 0,
        games: games.count || 0,
        announcements: announcements.count || 0,
        customRequests: customSongs.count || 0,
    };
}

export async function getReviewQueue(token: string, filter: 'pending' | 'approved' | 'rejected' = 'pending') {
    const admin = await verifyAdmin(token);

    console.log(`getReviewQueue: Fetching ${filter} content...`);
    const { data, error } = await admin
        .from('generated_content')
        .select('*')
        .eq('admin_status', filter)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function updateReviewStatus(token: string, id: string, status: 'approved' | 'rejected' | 'pending') {
    const admin = await verifyAdmin(token);

    console.log(`updateReviewStatus: Setting ${id} to ${status}...`);

    // Get the current content before updating for audit trail
    const { data: oldData } = await admin
        .from('generated_content')
        .select('admin_status')
        .eq('id', id)
        .single();

    try {
        const { data, error } = await admin
            .from('generated_content')
            .update({ admin_status: status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Log the action (non-blocking)
        try {
            const adminUser = await getAdminUserInfo(token);
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (url && serviceKey) {
                const { createClient } = await import('@supabase/supabase-js');
                const loggingClient = createClient(url, serviceKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
                logAdminAction(
                    loggingClient,
                    adminUser.id,
                    adminUser.email,
                    'update_review_status',
                    'generated_content',
                    id,
                    { before: { admin_status: oldData?.admin_status }, after: { admin_status: status } }
                );
            }
        } catch (auditError) {
            console.error('Failed to log review status update:', auditError);
        }

        return data;
    } catch (error) {
        // Log the error (non-blocking)
        try {
            const adminUser = await getAdminUserInfo(token);
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (url && serviceKey) {
                const { createClient } = await import('@supabase/supabase-js');
                const loggingClient = createClient(url, serviceKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });
                logAdminActionError(
                    loggingClient,
                    adminUser.id,
                    adminUser.email,
                    'update_review_status',
                    'generated_content',
                    error instanceof Error ? error.message : String(error),
                    id
                );
            }
        } catch (auditError) {
            console.error('Failed to log review status error:', auditError);
        }
        throw error;
    }
}

export async function deleteGeneratedContent(token: string, id: string) {
    const admin = await verifyAdmin(token);

    console.log(`deleteGeneratedContent: Deleting ${id}...`);
    const { error } = await admin
        .from('generated_content')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function getAdminGames(token: string) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function saveAdminGame(token: string, gameData: any) {
    const admin = await verifyAdmin(token);
    const { id, ...data } = gameData;

    if (id) {
        const { data: updated, error } = await admin
            .from('games')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return updated;
    } else {
        const { data: created, error } = await admin
            .from('games')
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return created;
    }
}

export async function deleteAdminGame(token: string, id: string) {
    const admin = await verifyAdmin(token);
    const { error } = await admin
        .from('games')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}


export async function initializeBucketsAction(token: string) {
    await verifyAdmin(token);
    const { initializeStorageBuckets } = await import('@/lib/storage');
    await initializeStorageBuckets();
    return { success: true };
}

export async function getAdminAnnouncements(token: string) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function saveAdminAnnouncement(token: string, data: any) {
    const admin = await verifyAdmin(token);
    const { id, ...payload } = data;

    if (id) {
        const { data: updated, error } = await admin
            .from('announcements')
            .update(payload)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return updated;
    } else {
        const { data: created, error } = await admin
            .from('announcements')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return created;
    }
}

export async function deleteAdminAnnouncement(token: string, id: string) {
    const admin = await verifyAdmin(token);
    const { error } = await admin
        .from('announcements')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

export async function getCustomSongRequests(token: string) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('custom_song_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function updateCustomSongRequest(token: string, id: string, payload: any) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('custom_song_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getStoreAnalytics(token: string) {
    console.log("📊 getStoreAnalytics: Fetching revenue data...");
    try {
        const admin = await verifyAdmin(token);

        // 1. Transactional Revenue (Purchased Content)
        const { data: purchases, error: pError } = await admin
            .from('purchased_content')
            .select('*')
            .order('purchased_at', { ascending: false });

        if (pError) {
            console.warn("⚠️ Error fetching purchased_content:", pError.message);
        }

        // 2. Custom Request Revenue (Paid Requests)
        const { data: requests, error: rError } = await admin
            .from('custom_song_requests')
            .select('*')
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false });

        if (rError) {
            console.warn("⚠️ Error fetching custom_song_requests:", rError.message);
        }

        const totalRevenue = (purchases?.reduce((acc, p) => acc + (Number(p.amount_paid) || 0), 0) || 0) +
            (requests?.reduce((acc, r) => acc + (Number(r.amount_paid) || 0), 0) || 0);

        const bundleSales = purchases?.filter(p => p.content_type?.includes('bundle')).length || 0;
        const trackSales = purchases?.filter(p => p.content_type === 'song').length || 0;
        const requestSales = requests?.length || 0;

        // Generate Chart Data (Last 7 Days)
        const chartData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Sum purchases for this day
            const dailyRevenue = purchases?.filter(p => p.purchased_at?.startsWith(dateStr))
                .reduce((acc, p) => acc + (Number(p.amount_paid) || 0), 0) || 0;

            chartData.push({ date: dateStr, revenue: dailyRevenue });
        }

        return {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            bundleSales,
            trackSales,
            requestSales,
            recentPurchases: (purchases || []).slice(0, 10),
            recentRequests: (requests || []).slice(0, 5),
            chartData
        };
    } catch (e: any) {
        console.error("💥 getStoreAnalytics failure:", e.message);
        throw e;
    }
}

export async function getAICostSnapshot(token: string, windowDays = 30): Promise<AICostSnapshot> {
    const admin = await verifyAdmin(token);
    const days = Math.max(1, Math.min(365, Number(windowDays) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [{ data: usageLogs, error: usageError }, { data: aiUsageRows, error: aiUsageError }, { data: controlsRow }] = await Promise.all([
        admin
            .from('usage_logs')
            .select('*')
            .gte('created_at', since)
            .order('created_at', { ascending: false }),
        admin
            .from('ai_usage')
            .select('*')
            .gte('used_at', since)
            .order('used_at', { ascending: false }),
        admin
            .from('site_settings')
            .select('content')
            .eq('key', 'ai_cost_controls')
            .maybeSingle(),
    ]);

    if (usageError) throw usageError;
    if (aiUsageError) throw aiUsageError;

    const controls = mergeCostControls(controlsRow?.content);

    const modelMap = new Map<string, { model: string; calls: number; tokensIn: number; tokensOut: number; estimatedCostUSD: number }>();
    let tokensIn = 0;
    let tokensOut = 0;
    let estimatedCostUSD = 0;

    for (const row of usageLogs || []) {
        const model = resolveModelFromUsageRow(row);
        const inTok = Number(row?.tokens_in_est || 0);
        const outTok = Number(row?.tokens_out_est || 0);
        const explicitCost = Number(row?.cost_estimate || 0);
        const rowCost = explicitCost > 0 ? explicitCost : estimateCostForModel(controls, model, inTok, outTok);

        tokensIn += inTok;
        tokensOut += outTok;
        estimatedCostUSD += rowCost;

        const existing = modelMap.get(model) || { model, calls: 0, tokensIn: 0, tokensOut: 0, estimatedCostUSD: 0 };
        existing.calls += 1;
        existing.tokensIn += inTok;
        existing.tokensOut += outTok;
        existing.estimatedCostUSD += rowCost;
        modelMap.set(model, existing);
    }

    const byModel = [...modelMap.values()].sort((a, b) => b.estimatedCostUSD - a.estimatedCostUSD);
    const estimatedCostMonthlyUSD = (estimatedCostUSD / days) * 30;
    const pctUsed = controls.monthlyBudgetUSD > 0 ? (estimatedCostMonthlyUSD / controls.monthlyBudgetUSD) * 100 : 0;
    const status: 'ok' | 'warn' | 'over' =
        pctUsed >= controls.hardStopThresholdPct ? 'over' :
            pctUsed >= controls.warnThresholdPct ? 'warn' : 'ok';

    const notes: string[] = [];
    if (byModel.some((m) => m.model === 'unknown')) {
        notes.push('Some calls are missing model metadata and are grouped as "unknown".');
    }
    const zeroPriced = Object.entries(controls.modelPricesUSDPer1M)
        .filter(([, p]) => Number(p.inputPer1M) === 0 && Number(p.outputPer1M) === 0)
        .map(([model]) => model);
    if (zeroPriced.length > 0) {
        notes.push(`These models are priced at 0 in controls: ${zeroPriced.join(', ')}.`);
    }
    notes.push('Codex work done in chat sessions outside this app is not automatically backfilled into these tables.');

    return {
        windowDays: days,
        usageEvents: usageLogs?.length || 0,
        aiUsageEvents: aiUsageRows?.length || 0,
        tokensIn,
        tokensOut,
        estimatedCostUSD: Number(estimatedCostUSD.toFixed(4)),
        estimatedCostMonthlyUSD: Number(estimatedCostMonthlyUSD.toFixed(4)),
        budget: {
            monthlyBudgetUSD: controls.monthlyBudgetUSD,
            warnThresholdPct: controls.warnThresholdPct,
            hardStopThresholdPct: controls.hardStopThresholdPct,
            pctUsed: Number(pctUsed.toFixed(2)),
            status,
        },
        byModel: byModel.map((m) => ({
            ...m,
            estimatedCostUSD: Number(m.estimatedCostUSD.toFixed(4)),
        })),
        notes,
        controls,
    };
}

export async function saveAICostControls(token: string, controls: Partial<AICostControls>) {
    const admin = await verifyAdmin(token);
    const merged = mergeCostControls(controls);
    const { error } = await admin.from('site_settings').upsert({
        key: 'ai_cost_controls',
        content: merged,
        updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return { success: true, controls: merged };
}

// Added for compatibility with older admin dashboard
export async function updateUserPlanAction(userId: string, newPlan: string) {
    try {
        // Since this doesn't take a token, we handle with default logic or require admin role
        const { supabaseAdmin } = await import("@/lib/supabase-client");
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: newPlan })
            .eq('id', userId);

        if (error) throw error;
        const { revalidatePath } = await import("next/cache");
        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        console.error("Update Plan Error:", e);
        return { success: false };
    }
}
