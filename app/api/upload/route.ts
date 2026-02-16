import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Commercial-Grade Media Upload API
 * Features:
 * - Service role authentication for reliable uploads
 * - Automatic metadata extraction
 * - Tagging support with database integration
 * - File validation and sanitization
 * - Folder organization by content type
 */

function getSupabaseConfig() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
    return { url, key };
}

// Allowed MIME types for security
const ALLOWED_TYPES: Record<string, string[]> = {
    songs: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/webm', 'audio/x-m4a'],
    videos: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/mpeg', 'video/ogg'],
    printables: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/svg+xml'],
    storybooks: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a'],
    characters: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
    avatars: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    games: ['image/png', 'image/jpeg', 'image/webp', 'application/zip', 'application/x-zip-compressed'],
    'ar-models': ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream', 'application/x-tika-msoffice', 'application/x-zip-compressed'],
};

// Max file sizes in bytes (per bucket)
const MAX_SIZES: Record<string, number> = {
    songs: 100 * 1024 * 1024,      // 100MB
    videos: 500 * 1024 * 1024,     // 500MB
    printables: 50 * 1024 * 1024,  // 50MB
    storybooks: 50 * 1024 * 1024,  // 50MB
    characters: 25 * 1024 * 1024,  // 25MB
    avatars: 5 * 1024 * 1024,      // 5MB
    games: 25 * 1024 * 1024,       // 25MB
    'ar-models': 100 * 1024 * 1024,// 100MB
};

// Table mapping for database persistence
const BUCKET_TO_TABLE: Record<string, string> = {
    songs: 'songs',
    videos: 'videos',
    printables: 'printables',
    storybooks: 'storybooks',
    characters: 'characters',
    games: 'games',
};

// URL field mapping per table
const URL_FIELDS: Record<string, string> = {
    songs: 'audio_url',
    videos: 'video_url',
    printables: 'pdf_url',
    storybooks: 'cover_image_url', // Default to cover, but can be audio_narration_url
    characters: 'image_url',
    games: 'thumbnail_url',
};

interface UploadMetadata {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
    tier_required?: string;
    island_origin?: string;
    age_track?: string;
    is_active?: boolean;
}

function sanitizeFilename(name: string): string {
    const baseName = name.replace(/\.[^/.]+$/, "");
    const extension = name.split('.').pop()?.toLowerCase() || '';
    const sanitized = baseName
        .replace(/[^a-z0-9\-_]/gi, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
        .substring(0, 100);
    return `${sanitized}-${Date.now()}.${extension}`;
}

function organizeByDateFolder(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
}

export async function POST(request: NextRequest) {
    try {
        // Validate service key
        const { url: supabaseUrl, key: serviceRoleKey } = getSupabaseConfig();
        if (!serviceRoleKey || !supabaseUrl) {
            console.error('[Upload API] Missing SUPABASE_SERVICE_ROLE_KEY or URL');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bucket = formData.get('bucket') as string;
        const saveToDb = formData.get('saveToDb') === 'true';

        // Parse metadata
        const metadataStr = formData.get('metadata') as string;
        let metadata: UploadMetadata = {};
        if (metadataStr) {
            try {
                metadata = JSON.parse(metadataStr);
            } catch (e) {
                console.warn('[Upload API] Invalid metadata JSON:', metadataStr);
            }
        }

        // Also accept individual form fields for convenience
        if (formData.get('title')) metadata.title = formData.get('title') as string;
        if (formData.get('description')) metadata.description = formData.get('description') as string;
        if (formData.get('category')) metadata.category = formData.get('category') as string;
        if (formData.get('tier_required')) metadata.tier_required = formData.get('tier_required') as string;
        if (formData.get('island_origin')) metadata.island_origin = formData.get('island_origin') as string;
        if (formData.get('age_track')) metadata.age_track = formData.get('age_track') as string;

        // Handle tags as comma-separated or JSON array
        const tagsField = formData.get('tags');
        if (tagsField) {
            if (typeof tagsField === 'string') {
                try {
                    metadata.tags = JSON.parse(tagsField);
                } catch {
                    metadata.tags = tagsField.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
        }

        // Validation
        if (!file || !bucket) {
            return NextResponse.json(
                { error: 'Missing required file or bucket parameter' },
                { status: 400 }
            );
        }

        // Validate bucket exists in allowed list
        if (!ALLOWED_TYPES[bucket]) {
            return NextResponse.json(
                { error: `Invalid bucket: ${bucket}` },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedMimes = ALLOWED_TYPES[bucket];
        if (!allowedMimes.includes(file.type) && file.type !== 'application/octet-stream') {
            return NextResponse.json(
                { error: `File type ${file.type} not allowed for bucket ${bucket}. Allowed: ${allowedMimes.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file size
        const maxSize = MAX_SIZES[bucket] || 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB` },
                { status: 400 }
            );
        }

        // Generate organized file path
        const dateFolder = organizeByDateFolder();
        const safeFileName = sanitizeFilename(file.name || 'upload');
        const filePath = `${dateFolder}/${safeFileName}`;

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(bucket)
            .upload(filePath, buffer, {
                cacheControl: '31536000', // 1 year cache
                upsert: true,
                contentType: file.type
            });

        if (uploadError) {
            console.error('[Upload API] Storage error:', uploadError);
            return NextResponse.json(
                { error: uploadError.message },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(uploadData.path);

        const publicUrl = urlData.publicUrl;

        // Optionally save to database with metadata
        let dbRecord = null;
        if (saveToDb && BUCKET_TO_TABLE[bucket] && metadata.title) {
            const table = BUCKET_TO_TABLE[bucket];
            const urlField = URL_FIELDS[bucket];

            const dbPayload: any = {
                title: metadata.title,
                description: metadata.description || '',
                [urlField]: publicUrl,
                is_active: metadata.is_active !== false,
            };

            // Add optional fields
            if (metadata.tags) dbPayload.tags = metadata.tags;
            if (metadata.category) dbPayload.category = metadata.category;
            if (metadata.tier_required) dbPayload.tier_required = metadata.tier_required;
            if (metadata.island_origin) dbPayload.island_origin = metadata.island_origin;
            if (metadata.age_track) dbPayload.age_track = metadata.age_track;

            // Table-specific fields
            if (bucket === 'songs') {
                dbPayload.artist = formData.get('artist') || 'Likkle Legends';
                if (formData.get('thumbnail_url')) dbPayload.thumbnail_url = formData.get('thumbnail_url');
            }
            if (bucket === 'videos') {
                if (formData.get('thumbnail_url')) dbPayload.thumbnail_url = formData.get('thumbnail_url');
            }
            if (bucket === 'printables') {
                if (formData.get('preview_url')) dbPayload.preview_url = formData.get('preview_url');
            }

            const { data: insertData, error: dbError } = await supabaseAdmin
                .from(table)
                .insert(dbPayload)
                .select()
                .single();

            if (dbError) {
                console.error('[Upload API] Database error:', dbError);
                // Don't fail the upload, just log the error
            } else {
                dbRecord = insertData;
            }
        }

        // Return comprehensive response
        return NextResponse.json({
            success: true,
            url: publicUrl,
            path: uploadData.path,
            bucket: bucket,
            fileName: safeFileName,
            fileSize: file.size,
            contentType: file.type,
            dbRecord: dbRecord,
            metadata: {
                title: metadata.title,
                description: metadata.description,
                tags: metadata.tags,
                category: metadata.category,
            }
        });

    } catch (error: any) {
        console.error('[Upload API] Critical error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}

// DELETE endpoint for removing files
export async function DELETE(request: NextRequest) {
    try {
        const { url: supabaseUrl, key: serviceRoleKey } = getSupabaseConfig();
        if (!serviceRoleKey || !supabaseUrl) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });

        const { bucket, path, deleteFromDb, table, recordId } = await request.json();

        if (!bucket || !path) {
            return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 });
        }

        // Delete from storage
        const { error: storageError } = await supabaseAdmin.storage
            .from(bucket)
            .remove([path]);

        if (storageError) {
            console.error('[Upload API] Delete storage error:', storageError);
            return NextResponse.json({ error: storageError.message }, { status: 500 });
        }

        // Optionally delete from database
        if (deleteFromDb && table && recordId) {
            const { error: dbError } = await supabaseAdmin
                .from(table)
                .delete()
                .eq('id', recordId);

            if (dbError) {
                console.error('[Upload API] Delete DB error:', dbError);
                // Don't fail, storage is already deleted
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Upload API] Delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
