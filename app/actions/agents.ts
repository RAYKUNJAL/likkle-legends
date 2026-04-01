// AI Agent Server Actions
"use server";

import { verifyAdmin } from "./admin";
import { storyGenerator } from "@/lib/ai-content-generator/generators/story-generator";
import { printableGenerator } from "@/lib/ai-content-generator/generators/printable-generator";
import { videoGenerator } from "@/lib/ai-content-generator/generators/video-generator";
import { moduleManagerAgent } from "@/lib/ai-content-generator/agents/ModuleManager";
import { logAdminAction, logAdminActionError } from "@/lib/audit-logger";

/**
 * Wrapper to prevent AI agents from hanging forever
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 25000): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs / 1000}s`)), timeoutMs)
    );
    return Promise.race([promise, timeout]);
}

/**
 * Helper to get admin user info from token (for audit logging)
 */
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

export async function runStoryAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        return await withTimeout(storyGenerator.generateStory(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runSongAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        const { songGenerator } = await import('@/lib/ai-content-generator/generators/song-generator');
        return await withTimeout(songGenerator.generateSong(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runPrintableAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        return await withTimeout(printableGenerator.generatePrintable(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runVideoAgent(token: string, params: any) {
    try {
        await verifyAdmin(token);
        return await withTimeout(videoGenerator.generateScript(params));
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function runModuleManagerAgent(token: string, objective: string, ageGroup: 'mini' | 'big') {
    try {
        console.log(`[Agent] Start Module Manager. Objective: ${objective}`);

        await verifyAdmin(token);

        // SECURITY: API Key should NEVER use NEXT_PUBLIC_ prefix
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

        const data = await withTimeout(moduleManagerAgent.buildCompleteModule(objective, ageGroup), 35000);

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
                    'generate_content',
                    'module',
                    undefined,
                    { objective, ageGroup, module_title: data.title }
                );
            }
        } catch (auditError) {
            console.error('Failed to log module generation:', auditError);
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Agent Execution Failed:", error);

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
                    'generate_content',
                    'module',
                    error.message || "Unknown error occurred during generation.",
                    undefined,
                    { objective, ageGroup }
                );
            }
        } catch (auditError) {
            console.error('Failed to log module generation error:', auditError);
        }

        return { success: false, error: error.message || "Unknown error occurred during generation." };
    }
}

export async function publishModuleToLive(token: string, module: any) {
    try {
        await verifyAdmin(token);
        const { databasePoster } = await import('@/lib/ai-content-generator/database-poster');

        console.log(`🚀 Publishing complete module: "${module.title}"...`);

        const results = {
            story: await databasePoster.postStory(module.content.story),
            printable: await databasePoster.postPrintable(module.content.printable),
            video: await databasePoster.postVideo(module.content.videoScript, {
                island: module.island,
                ageGroup: module.ageGroup
            })
        };

        const hasError = Object.values(results).some((r: any) => !r.success);

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
                const status = hasError ? 'error' : 'success';
                const action = hasError ? logAdminActionError : logAdminAction;
                if (hasError) {
                    logAdminActionError(
                        loggingClient,
                        adminUser.id,
                        adminUser.email,
                        'publish_module',
                        'module',
                        "Some assets failed to publish. Check results for details.",
                        undefined,
                        { module_title: module.title, results }
                    );
                } else {
                    logAdminAction(
                        loggingClient,
                        adminUser.id,
                        adminUser.email,
                        'publish_module',
                        'module',
                        undefined,
                        { module_title: module.title, published_assets: Object.keys(results) }
                    );
                }
            }
        } catch (auditError) {
            console.error('Failed to log publish action:', auditError);
        }

        return {
            success: !hasError,
            results,
            error: hasError ? "Some assets failed to publish. Check results for details." : null
        };
    } catch (error: any) {
        console.error("Publishing failed:", error);

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
                    'publish_module',
                    'module',
                    error.message || "Unknown error occurred during publishing.",
                    undefined,
                    { module_title: module.title }
                );
            }
        } catch (auditError) {
            console.error('Failed to log publish error:', auditError);
        }

        return { success: false, error: error.message };
    }
}
