
"use server";

import { getSiteContent } from "@/lib/services/cms";

export async function getSiteContentAction(key: string) {
    return await getSiteContent(key);
}
