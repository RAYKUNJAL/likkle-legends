// Database service for Likkle Legends
// Centralizes all Supabase queries

import { supabase } from './storage';

// ==========================================
// PROFILE OPERATIONS
// ==========================================

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// CHILDREN OPERATIONS
// ==========================================

export async function getChildren(parentId: string) {
    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getChild(childId: string) {
    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

    if (error) throw error;
    return data;
}

export async function createChild(parentId: string, childData: {
    first_name: string;
    age: number;
    age_track: 'mini' | 'big';
    primary_island: string;
    secondary_island?: string;
}) {
    const { data, error } = await supabase
        .from('children')
        .insert({
            parent_id: parentId,
            ...childData,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateChild(childId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', childId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function addXP(childId: string, xpAmount: number, source: string) {
    // Get current XP
    const child = await getChild(childId);
    const newXP = (child.total_xp || 0) + xpAmount;

    // Update child XP
    await updateChild(childId, { total_xp: newXP });

    // Log the activity
    await supabase.from('activities').insert({
        child_id: childId,
        profile_id: child.parent_id,
        activity_type: 'xp_earn',
        xp_earned: xpAmount,
        metadata: { source },
    });

    return newXP;
}

export async function updateStreak(childId: string) {
    const child = await getChild(childId);
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = child.last_activity_date;

    let newStreak = child.current_streak || 0;

    if (!lastActivity) {
        newStreak = 1;
    } else {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            newStreak = 1;
        }
    }

    const longestStreak = Math.max(newStreak, child.longest_streak || 0);

    await updateChild(childId, {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
    });

    return { currentStreak: newStreak, longestStreak };
}

// ==========================================
// CONTENT OPERATIONS
// ==========================================

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

// ==========================================
// ACTIVITY LOGGING
// ==========================================

export async function logActivity(
    profileId: string,
    childId: string,
    activityType: string,
    contentId?: string,
    xpEarned = 0,
    durationSeconds?: number,
    metadata: Record<string, unknown> = {}
) {
    const { error } = await supabase.from('activities').insert({
        profile_id: profileId,
        child_id: childId,
        activity_type: activityType,
        content_id: contentId,
        xp_earned: xpEarned,
        duration_seconds: durationSeconds,
        metadata,
    });

    if (error) throw error;

    // Update streak
    await updateStreak(childId);

    // Add XP if earned
    if (xpEarned > 0) {
        await addXP(childId, xpEarned, activityType);
    }
}

export async function getRecentActivities(childId: string, limit = 20) {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

// ==========================================
// BADGE OPERATIONS
// ==========================================

export async function earnBadge(childId: string, badgeId: string) {
    // Check if already earned
    const { data: existing } = await supabase
        .from('badge_earnings')
        .select('id')
        .eq('child_id', childId)
        .eq('badge_id', badgeId)
        .single();

    if (existing) return false;

    // Award badge
    const { error } = await supabase.from('badge_earnings').insert({
        child_id: childId,
        badge_id: badgeId,
    });

    if (error) throw error;

    // Update child's earned badges array
    const child = await getChild(childId);
    const earnedBadges = [...(child.earned_badges || []), badgeId];
    await updateChild(childId, { earned_badges: earnedBadges });

    return true;
}

export async function getEarnedBadges(childId: string) {
    const { data, error } = await supabase
        .from('badge_earnings')
        .select('*')
        .eq('child_id', childId)
        .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// ==========================================
// ORDER OPERATIONS
// ==========================================

export async function createOrder(orderData: {
    profile_id: string;
    tier: string;
    amount_cents: number;
    currency: string;
    shipping_name: string;
    shipping_address_line1: string;
    shipping_address_line2?: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    fulfillment_hub: string;
    child_name: string;
    child_age: number;
    selected_island: string;
}) {
    const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getOrders(profileId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    const updates: Record<string, unknown> = { fulfillment_status: status };

    if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
        if (trackingNumber) updates.tracking_number = trackingNumber;
    } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// ADMIN OPERATIONS
// ==========================================

export async function getAllProfiles(limit = 100, offset = 0) {
    const { data, error, count } = await supabase
        .from('profiles')
        .select('*, children(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { profiles: data || [], total: count || 0 };
}

export async function getAllOrders(status?: string, limit = 100, offset = 0) {
    let query = supabase
        .from('orders')
        .select('*, profiles(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq('fulfillment_status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { orders: data || [], total: count || 0 };
}

export async function getAnalyticsSummary() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Total subscribers
    const { count: totalSubscribers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_tier', 'free');

    // Active subscribers
    const { count: activeSubscribers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

    // New signups last 30 days
    const { count: newSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

    // Active children (activity in last 7 days)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { count: activeChildren } = await supabase
        .from('children')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity_date', sevenDaysAgo);

    // Pending orders
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('fulfillment_status', 'pending');

    return {
        totalSubscribers: totalSubscribers || 0,
        activeSubscribers: activeSubscribers || 0,
        newSignups: newSignups || 0,
        activeChildren: activeChildren || 0,
        pendingOrders: pendingOrders || 0,
    };
}

// ==========================================
// CONTENT MANAGEMENT (ADMIN)
// ==========================================

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
