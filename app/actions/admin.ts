"use server";

import { supabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";

export async function getAdminStatsAction() {
    try {
        const { count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
        const { count: videoCount } = await supabaseAdmin.from('videos').select('*', { count: 'exact', head: true });

        // Revenue Estimate
        const { data: users } = await supabaseAdmin.from('profiles').select('subscription_tier').limit(1000);
        let revenue = 0;
        if (users) {
            const paid = users.filter((u: any) => u.subscription_tier !== 'free_explorer').length;
            const ratio = users.length > 0 ? paid / users.length : 0;
            const estimatedPaidTotal = (userCount || 0) * ratio;
            revenue = Math.round(estimatedPaidTotal * 12.99);
        }

        return {
            totalUsers: userCount || 0,
            totalVideos: videoCount || 0,
            revenue,
            totalPosts: 0 // Placeholder
        };
    } catch (e) {
        console.error("Admin Stats Error:", e);
        return { totalUsers: 0, totalVideos: 0, totalPosts: 0, revenue: 0 };
    }
}

export async function getAllUsersAction() {
    try {
        const { data, error } = await supabaseAdmin
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
    } catch (e) {
        console.error("Get Users Error:", e);
        return [];
    }
}

export async function updateUserPlanAction(userId: string, newPlan: string) {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: newPlan })
            .eq('id', userId);

        if (error) throw error;
        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        console.error("Update Plan Error:", e);
        return { success: false };
    }
}
