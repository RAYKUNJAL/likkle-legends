
/**
 * ☁️ CLOUDFLARE STREAM SERVICE
 * Handles video uploading and signed URL generation for the Island Video Vault.
 */

// Credentials provided for Likkle Legends
const ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '7f08481e0b194923a1c1e59afab9b5a6';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'nhDAs-yt8Y886y1qOScEqn0UKonz6b3EXdsdpsoB';
const CUSTOMER_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_SUBDOMAIN || 'customer-1swuf3pyohat22x3.cloudflarestream.com';

export interface StreamUploadResponse {
    result: {
        uid: string;
        thumbnail: string;
        playback: {
            hls: string;
            dash: string;
        };
        preview: string;
    };
    success: boolean;
    errors: any[];
}

/**
 * Upload a video file to Cloudflare Stream
 * Note: In a strict production environment, this should proxy through a backend to keep the API Token hidden.
 */
export const uploadVideoFile = async (file: File): Promise<StreamUploadResponse | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: formData
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Cloudflare API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        if (!data.success) {
            console.error("Cloudflare Upload Error:", data.errors);
            throw new Error("Video upload failed.");
        }
        return data;
    } catch (error) {
        console.error("Stream Service Error:", error);
        return null;
    }
};

/**
 * Get the embed URL for a specific video UID
 */
export const getStreamEmbedUrl = (videoUid: string): string => {
    return `https://${CUSTOMER_SUBDOMAIN}/${videoUid}/iframe?poster=true&controls=true`;
};

/**
 * Get the thumbnail URL
 */
export const getStreamThumbnailUrl = (videoUid: string): string => {
    return `https://${CUSTOMER_SUBDOMAIN}/${videoUid}/thumbnails/thumbnail.jpg?time=1s&height=600`;
};

/**
 * Get HLS Playlist URL (for custom players)
 */
export const getStreamHlsUrl = (videoUid: string): string => {
    return `https://${CUSTOMER_SUBDOMAIN}/${videoUid}/manifest/video.m3u8`;
};
