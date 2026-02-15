"use server";

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-client';

const ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '7f08481e0b194923a1c1e59afab9b5a6';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CUSTOMER_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_SUBDOMAIN || 'customer-1swuf3pyohat22x3.cloudflarestream.com';

export async function uploadVideoAction(formData: FormData) {
    if (!API_TOKEN) {
        return { success: false, error: "Cloudflare API Token is missing on the server. Please add CLOUDFLARE_API_TOKEN to your .env file." };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: uploadFormData
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Cloudflare Upload Error:", errText);
            return { success: false, error: `Cloudflare API Error: ${response.status} ${errText}` };
        }

        const data = await response.json();

        if (!data.success) {
            console.error("Cloudflare Upload Failed:", data.errors);
            return { success: false, error: "Cloudflare upload failed. Check server logs." };
        }

        const result = data.result;

        return {
            success: true,
            video: {
                uid: result.uid,
                thumbnail: result.thumbnail || `https://${CUSTOMER_SUBDOMAIN}/${result.uid}/thumbnails/thumbnail.jpg?time=1s&height=600`,
                playback: result.playback,
                preview: result.preview
            }
        };

    } catch (error: any) {
        console.error("Video Upload Exception:", error);
        return { success: false, error: error.message || "Failed to upload video" };
    }
}

export async function deleteVideoAction(uid: string) {
    // Note: This would require Cloudflare API call to delete from Stream as well
    // For now, we assume we just delete metadata or implement full sync later
    return { success: true };
}
