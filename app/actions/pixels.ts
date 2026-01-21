"use server";

import { createAdminClient } from "@/lib/admin";
import { supabase } from "@/lib/storage";
import { revalidatePath } from "next/cache";

async function verifyAdmin(token: string) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error("Unauthorized");

    const adminClient = createAdminClient();

    // Check if user is admin in profiles
    const { data: profile } = await adminClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    // Or check admin_users table
    const { data: adminUser } = await adminClient
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

    const isDevAdmin = user.email === 'admin@likklelegends.com' || user.email?.includes('raykunjal');

    if (!profile?.is_admin && !adminUser && !isDevAdmin) {
        throw new Error("Forbidden");
    }

    return adminClient;
}

export async function getPixelSettings(token: string) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('site_settings')
        .select('*')
        .eq('key', 'analytics')
        .single();

    if (error && error.code === 'PGRST116') {
        return { facebook_pixel_id: "", google_analytics_id: "", tiktok_pixel_id: "", snapchat_pixel_id: "" };
    }
    if (error) throw error;
    return data.value;
}

export async function savePixelSettings(token: string, settings: any) {
    const admin = await verifyAdmin(token);

    const { error } = await admin
        .from('site_settings')
        .upsert({
            key: 'analytics',
            value: settings,
            updated_at: new Date().toISOString()
        });

    if (error) throw error;

    revalidatePath('/', 'layout');
    return { success: true };
}
