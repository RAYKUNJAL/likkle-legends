"use server";

import { createAdminClient } from "@/lib/admin";
import { supabase } from "@/lib/storage";

// Helper to verify admin access
async function verifyAdmin(token: string) {
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

export async function getContentCounts(token: string) {
    const admin = await verifyAdmin(token);

    const [songs, stories, characters, videos, printables, games] = await Promise.all([
        admin.from('songs').select('*', { count: 'exact', head: true }),
        admin.from('storybooks').select('*', { count: 'exact', head: true }),
        admin.from('characters').select('*', { count: 'exact', head: true }),
        admin.from('videos').select('*', { count: 'exact', head: true }),
        admin.from('printables').select('*', { count: 'exact', head: true }),
        admin.from('games').select('*', { count: 'exact', head: true }),
    ]);

    return {
        songs: songs.count || 0,
        stories: stories.count || 0,
        characters: characters.count || 0,
        videos: videos.count || 0,
        printables: printables.count || 0,
        games: games.count || 0,
    };
}
