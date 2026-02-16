import { supabase } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase-client';

export async function getAllProfiles(limit = 100, offset = 0) {
    if (!isSupabaseConfigured()) return { profiles: [], total: 0 };
    const { data, error, count } = await supabase
        .from('profiles')
        .select('*, children(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { profiles: data || [], total: count || 0 };
}

export async function getAnalyticsSummary() {
    if (!isSupabaseConfigured()) return { totalSubscribers: 0, activeSubscribers: 0, newSignups: 0, activeChildren: 0, pendingOrders: 0 };
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

export async function getChildActivities(childId: string, limit = 10) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}


