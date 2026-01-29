"use server";

import { verifyAdmin } from "@/app/actions/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function runDiagnostics(token: string) {
    const results: any = {
        auth: { status: "pending", message: "" },
        env: { status: "pending", key_present: false },
        db: { status: "pending", message: "" },
        ai: { status: "pending", message: "" }
    };

    // 1. Test Auth
    try {
        console.log("Run Diagnostics: Verifying Admin...");
        await verifyAdmin(token);
        results.auth = { status: "success", message: "Admin verified successfully." };
    } catch (error: any) {
        console.error("Run Diagnostics: Auth Error", error);
        results.auth = { status: "error", message: `Auth Failed: ${error.message}` };
        // We CONTINUE to check Env even if Auth fails, for debugging purposes
    }

    // 2. Test Env Key
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    results.env.key_present = !!key;
    if (!key) {
        results.env.status = "error";
        results.env.message = "GEMINI_API_KEY is missing in server environment.";
        return results;
    } else {
        results.env.status = "success";
        results.env.message = "API Key found (starts with " + key.substring(0, 4) + "...)";
    }

    // 3. Test AI Connection (Raw Fetch to avoid SDK hangs)
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
            results.ai = { status: "error", message: `API Error ${response.status}: ${errorText.substring(0, 50)}...` };
        } else {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            results.ai = { status: "success", message: `Raw Response: "${text}"` };
        }
    } catch (error: any) {
        console.error("Run Diagnostics: Raw AI Error", error);
        results.ai = { status: "error", message: `Raw Call Failed: ${error.name === 'AbortError' ? 'TIMEOUT (10s)' : error.message}` };
    }

    return results;
}
