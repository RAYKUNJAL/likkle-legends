"use server";

import { createAdminClient } from "@/lib/admin";
import { supabase } from "@/lib/storage";

async function verifyAdmin(token: string) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error("Unauthorized");

    const adminClient = createAdminClient();
    const { data: adminUser } = await adminClient
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

    // Check for explicit admin role in database only (removed email-based privilege escalation)
    if (!adminUser) throw new Error("Forbidden");

    return adminClient;
}

export async function getCharacterPersonality(token: string, characterId: string) {
    const admin = await verifyAdmin(token);
    const { data, error } = await admin
        .from('ai_personality')
        .select('*')
        .eq('character_id', characterId)
        .single();

    if (error && error.code === 'PGRST116') return null; // Not found
    if (error) throw error;
    return data;
}

export async function saveCharacterPersonality(token: string, characterId: string, personalityData: any) {
    const admin = await verifyAdmin(token);

    // Check if exists
    const { data: existing } = await admin
        .from('ai_personality')
        .select('id')
        .eq('character_id', characterId)
        .single();

    if (existing) {
        const { error } = await admin
            .from('ai_personality')
            .update({
                ...personalityData,
                updated_at: new Date().toISOString()
            })
            .eq('character_id', characterId);
        if (error) throw error;
    } else {
        const { error } = await admin
            .from('ai_personality')
            .insert({
                character_id: characterId,
                ...personalityData
            });
        if (error) throw error;
    }

    return { success: true };
}
