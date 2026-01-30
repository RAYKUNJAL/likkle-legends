
"use server";

import { updateSiteContent } from "@/lib/services/cms";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./admin";

export async function saveContentAction(token: string, key: string, content: any) {
    try {
        await verifyAdmin(token);
        await updateSiteContent(key, content);
        revalidatePath('/'); // Revalidate home page
        revalidatePath('/admin/cms'); // Revalidate CMS admin
        return { success: true };
    } catch (error: any) {
        console.error("CMS Save Error:", error);
        return { success: false, error: error.message || "Failed to save content" };
    }
}
