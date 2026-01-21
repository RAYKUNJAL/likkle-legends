"use server";

import { createAdminClient } from "@/lib/admin";
import { supabase } from "@/lib/storage";

// Helper to verify admin access
export async function verifyAdmin(token: string) {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    // Optional: Check if user has admin role in metadata or admin_users table
    // For now, we'll assume if they have a valid token and are calling this, 
    // we might check email or metadata. 
    // But since the Schema has an `admin_users` table, we should check it.

    const adminClient = createAdminClient();
    const { data: adminUser } = await adminClient
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

    // fallback for development: check specific email
    const isDevAdmin = user.email === 'admin@likklelegends.com' || user.email?.includes('raykunjal'); // Customize as needed

    if (!adminUser && !isDevAdmin) {
        throw new Error("Forbidden: Not an admin");
    }

    return adminClient;
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

    return {
        totalSubscribers: totalSubscribers || 0,
        activeSubscribers: activeSubscribers || 0,
        pendingOrders: pendingOrders || 0,
        activeChildren: activeChildren || 0,
        newSignups: newSignups || 0,
        monthlyRevenue: (activeSubscribers || 0) * 15 // Estimate
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

    const { data, error } = await admin
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getAdminContent(token: string, category: 'songs' | 'videos' | 'printables' | 'storybooks') {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from(category)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
    return true;
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

    const [songs, storybooks, videos, printables, characters, games] = await Promise.all([
        admin.from('songs').select('*', { count: 'exact', head: true }),
        admin.from('storybooks').select('*', { count: 'exact', head: true }),
        admin.from('videos').select('*', { count: 'exact', head: true }),
        admin.from('printables').select('*', { count: 'exact', head: true }),
        admin.from('characters').select('*', { count: 'exact', head: true }),
        admin.from('games').select('*', { count: 'exact', head: true }),
    ]);

    return {
        songs: songs.count || 0,
        stories: storybooks.count || 0,
        videos: videos.count || 0,
        printables: printables.count || 0,
        characters: characters.count || 0,
        games: games.count || 0,
    };
}
