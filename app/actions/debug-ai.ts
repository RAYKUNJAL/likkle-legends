"use server";

import { verifyAdmin } from "@/app/actions/admin";

export async function runPing(token: string) {
    await verifyAdmin(token);
    return { status: "pong", timestamp: new Date().toISOString() };
}

export async function testEnv(token: string) {
    await verifyAdmin(token);
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
        return { status: "error", message: "GEMINI_API_KEY is missing." };
    }
    return { status: "success", message: "API Key found (" + key.substring(0, 4) + "...)" };
}

export async function testSupabase(token: string) {
    await verifyAdmin(token);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return { status: "error", message: "Supabase URL missing" };

    try {
        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url + "/auth/v1/health", { signal: controller.signal }).catch(e => ({ ok: false, statusText: e.message }));
        clearTimeout(timeout);

        const duration = Date.now() - start;
        return { status: "success", message: `Supabase Auth API healthy (${duration}ms)` };
    } catch (e: any) {
        return { status: "error", message: "Net Error: " + e.message };
    }
}

export async function testAuth(token: string) {
    try {
        console.log("Run Diagnostics: Verifying Admin (with 5s limit)...");
        const authTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Auth Check Hanged (>5s)")), 5000)
        );

        const result = await Promise.race([verifyAdmin(token), authTimeout]);
        return { status: "success", message: "Admin verified successfully." };
    } catch (error: any) {
        console.error("Run Diagnostics: Auth Error", error);
        return { status: "error", message: `Auth Failed: ${error.message}` };
    }
}

export async function testAI(token: string) {
    await verifyAdmin(token);
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) return { status: "error", message: "No key for AI test." };

    try {
        console.log("Run Diagnostics: Testing Gemini via Raw Fetch (10s limit)...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Say 'Raw System Operational'" }] }]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            return { status: "error", message: `API Error ${response.status}: ${errorText.substring(0, 50)}...` };
        } else {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return { status: "success", message: `Raw Response: "${text || 'Empty'}"` };
        }
    } catch (error: any) {
        return { status: "error", message: `Raw Call Failed: ${error.name === 'AbortError' ? 'TIMEOUT (10s)' : error.message}` };
    }
}
