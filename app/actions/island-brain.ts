
"use server";

import { revalidatePath } from 'next/cache';
import { GeneratedContent, ContentType, ContentRequest } from '@/lib/types';
import { saveGeneratedContent } from '@/lib/content-store';
import { IslandBrainOrchestrator } from '@/lib/agent-orchestrator';
import { createClient } from '@supabase/supabase-js';

// Helper to get a client that can verify the token
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Helper to verify user and return ID
async function verifyUser(token: string) {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error("Unauthorized");
    return user;
}

// ------------------------------------------------------------------
// CLIENT-FACING ACTIONS (Requires Token)
// ------------------------------------------------------------------

export async function fetchGeneratedContent(token: string) {
    const user = await verifyUser(token);
    const supabase = getSupabase(); // Use anon key, RLS will handle it if we pass token? 
    // Actually with anon key on server, we don't have the session context automatically.
    // We should use Service Role but Query with user ID.

    // Better: Use Service Role for data fetching to ensure we bypass RLS issues 
    // if the RLS policies rely on auth.uid() which isn't present in a raw REST call 
    // unless we set the auth header.
    // Simplest: Query with Service Verification.

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminClient
        .from('generated_content')
        .select('*')
        .eq('family_id', user.id)
        .eq('admin_status', 'approved') // Only show Approved content to parents
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching content:", error);
        return [];
    }

    return data.map((item: any) => ({
        ...item,
        content_id: item.id
    })) as GeneratedContent[];
}

export async function approveContentAction(token: string, contentId: string) {
    const user = await verifyUser(token);
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await adminClient
        .from('generated_content')
        .update({
            is_approved_for_kid: true,
            approved_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .eq('family_id', user.id);

    if (error) throw new Error(error.message);

    revalidatePath('/parent');
    return { success: true };
}

export async function rejectContentAction(token: string, contentId: string) {
    const user = await verifyUser(token);
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await adminClient
        .from('generated_content')
        .delete()
        .eq('id', contentId)
        .eq('family_id', user.id);

    if (error) throw new Error(error.message);

    revalidatePath('/parent');
    return { success: true };
}

export async function runAgentGeneration(
    token: string,
    contentType: ContentType,
    prompt: string,
    islandId: string = "TT",
    constraints: any = {}
) {
    const user = await verifyUser(token);

    try {
        const orchestrator = new IslandBrainOrchestrator(
            process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || ""
        );

        const request: ContentRequest = {
            family_id: user.id,
            island_id: islandId,
            mode: 'parent_mode',
            content_type: contentType,
            topic: prompt,
            constraints: constraints
        };

        const content = await orchestrator.generateContent(request);
        return { success: true, content };
    } catch (error: any) {
        console.error("Agent Generation Failed:", error);
        return { success: false, error: error.message };
    }
}
