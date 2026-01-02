
"use server";

import { updateSiteContent } from "@/lib/services/cms";
import { revalidatePath } from "next/cache";

export async function saveContentAction(key: string, content: any) {
    try {
        await updateSiteContent(key, content);
        revalidatePath('/'); // Revalidate home page
        revalidatePath('/admin/cms'); // Revalidate CMS admin
        return { success: true };
    } catch (error) {
        console.error("CMS Save Error:", error);
        return { success: false, error: "Failed to save content" };
    }
}
