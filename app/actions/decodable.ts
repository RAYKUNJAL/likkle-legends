
"use server";

import { generateDecodableBook as generateBook } from "@/services/decodableFactory";
import { GenerationRequest, MasterDecodableManifest } from "@/lib/decodable/types";

/**
 * Server Action to trigger decodable reader generation
 */
export async function generateDecodableAction(request: GenerationRequest): Promise<{
    success: boolean;
    manifest?: MasterDecodableManifest;
    error?: string;
}> {
    try {
        const manifest = await generateBook(request);
        return { success: true, manifest };
    } catch (error: any) {
        console.error("[Decodable Action] Failed:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred during generation."
        };
    }
}
