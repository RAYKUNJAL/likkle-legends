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

    // 3. Test AI Connection
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent("Say 'System Operational'");
        const text = result.response.text();

        if (text) {
            results.ai = { status: "success", message: `Response received: "${text}"` };
        } else {
            results.ai = { status: "error", message: "Empty response from Gemini." };
        }
    } catch (error: any) {
        results.ai = { status: "error", message: `Gemini Call Failed: ${error.message}` };
    }

    return results;
}
