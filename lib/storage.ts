// Supabase Storage Service for Media Assets
// Handles character images, songs, videos, and other content

import { supabase, supabaseAdmin } from './supabase-client';

export { supabase, supabaseAdmin };

function getSupabase() {
    return supabase;
}

function getSupabaseAdmin() {
    return supabaseAdmin;
}

// Storage bucket names
export const BUCKETS = {
    CHARACTERS: 'characters',
    SONGS: 'songs',
    VIDEOS: 'videos',
    STORYBOOKS: 'storybooks',
    PRINTABLES: 'printables',
    AVATARS: 'avatars',
    VR_ASSETS: 'vr-assets',
    AR_MODELS: 'ar-models',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

// Initialize storage buckets (run once during setup)
export async function initializeStorageBuckets() {
    const client = getSupabaseAdmin();
    const buckets = Object.values(BUCKETS);

    for (const bucket of buckets) {
        console.log(`Creating bucket: ${bucket}...`);
        const { error } = await client.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 52428800, // 50MB
        });

        if (error && !error.message.includes('already exists')) {
            console.error(`Failed to create bucket ${bucket}:`, error);
        }
    }
}

// Upload file to storage
export async function uploadFile(
    bucket: BucketName,
    file: File,
    path?: string
): Promise<{ url: string; path: string } | null> {
    const client = getSupabase();
    const fileName = path || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { data, error } = await client.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        path: data.path,
    };
}

// Delete file from storage
export async function deleteFile(bucket: BucketName, path: string): Promise<boolean> {
    const client = getSupabase();
    const { error } = await client.storage
        .from(bucket)
        .remove([path]);

    return !error;
}

// List files in bucket
export async function listFiles(bucket: BucketName, folder?: string) {
    const client = getSupabase();
    const { data, error } = await client.storage
        .from(bucket)
        .list(folder || '', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) {
        console.error('List error:', error);
        return [];
    }

    return data.map(file => ({
        ...file,
        url: client.storage.from(bucket).getPublicUrl(
            folder ? `${folder}/${file.name}` : file.name
        ).data.publicUrl,
    }));
}

// Get signed URL for private files (if needed)
export async function getSignedUrl(bucket: BucketName, path: string, expiresIn = 3600) {
    const client = getSupabase();
    const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error) return null;
    return data.signedUrl;
}
