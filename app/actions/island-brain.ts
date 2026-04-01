"use server";

import { revalidatePath } from 'next/cache';
import { GeneratedContent, ContentType, ContentRequest } from '@/lib/types';
import { IslandBrainOrchestrator } from '@/lib/agent-orchestrator';
import { generateContentAudio } from '@/lib/services/audio-service';

/**
 * Server-safe User Verification with Timeout
 * Uses its own stateless client to prevent Vercel hangs.
 */
async function verifyUser(token: string) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) throw new Error("Supabase internal config missing");

    const { createClient } = await import('@supabase/supabase-js');
    const authClient = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    try {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Supabase Auth Timeout (5s)")), 5000)
        );

        const { data: { user }, error } = await Promise.race([
            authClient.auth.getUser(token),
            timeout
        ]);

        if (error || !user) throw new Error("Unauthorized: " + (error?.message || "Invalid session"));
        return user;
    } catch (e: any) {
        console.error("verifyUser HANG or ERROR:", e.message);
        throw e;
    }
}

/**
 * Global Admin Client for restricted operations
 */
async function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, serviceKey, {
        auth: { persistSession: false }
    });
}

// ------------------------------------------------------------------
// CLIENT-FACING ACTIONS
// ------------------------------------------------------------------

export async function fetchGeneratedContent(token: string) {
    try {
        const user = await verifyUser(token);
        const admin = await getAdminClient();

        const { data, error } = await admin
            .from('generated_content')
            .select('*')
            .eq('family_id', user.id)
            .eq('admin_status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map((item: any) => ({ ...item, content_id: item.id })) as GeneratedContent[];
    } catch (e) {
        console.error("fetchGeneratedContent failed:", e);
        return [];
    }
}

export async function approveContentAction(token: string, contentId: string) {
    const user = await verifyUser(token);
    const admin = await getAdminClient();

    const { error } = await admin
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
    const admin = await getAdminClient();

    const { error } = await admin
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
    try {
        const user = await verifyUser(token);
        const userId = user.id;

        // SECURITY: API Key should NEVER use NEXT_PUBLIC_ prefix
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing in environment.");

        const orchestrator = new IslandBrainOrchestrator(apiKey);

        const request: ContentRequest = {
            family_id: userId,
            island_id: islandId,
            mode: 'parent_mode',
            content_type: contentType,
            topic: prompt,
            constraints: constraints
        };

        // Safety wrap for the orchestrator itself (30s limit)
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI Agent Operation Timeout (30s)")), 30000)
        );

        const content = await Promise.race([
            orchestrator.generateContent(request),
            timeout
        ]);

        return { success: true, content };
    } catch (error: any) {
        console.error("Agent Generation Failed:", error);
        return { success: false, error: error.message || "Unknown error occurred" };
    }
}

export async function generateContentAudioAction(token: string, contentId: string) {
    await verifyUser(token);
    try {
        const audioUrl = await generateContentAudio(contentId);
        revalidatePath('/admin/ai-review');
        return { success: true, audioUrl };
    } catch (error: any) {
        console.error("Audio Generation Failed:", error);
        return { success: false, error: error.message };
    }
}
