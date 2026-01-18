// Supabase Storage Helper
// Upload images to Supabase Storage bucket

import { supabase } from '@/lib/storage';

export class SupabaseImageUploader {
    private bucketName = 'content-images';

    /**
     * Upload image to Supabase Storage
     * @param imageData - Base64 string or Buffer
     * @param path - Storage path (e.g., 'stories/12345-cover.png')
     * @returns Public URL of uploaded image
     */
    async uploadImage(
        imageData: string | Buffer,
        path: string
    ): Promise<string> {
        try {
            // Convert base64 to buffer if needed
            let buffer: Buffer;
            if (typeof imageData === 'string') {
                // Remove data:image prefix if present
                const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                buffer = Buffer.from(base64Data, 'base64');
            } else {
                buffer = imageData;
            }

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(path, buffer, {
                    contentType: 'image/png',
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) {
                console.error('Supabase upload error:', error);
                throw error;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(path);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Failed to upload image:', error);
            throw new Error('Image upload failed');
        }
    }

    /**
     * Delete image from storage
     */
    async deleteImage(path: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([path]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to delete image:', error);
            return false;
        }
    }

    /**
     * Ensure storage bucket exists
     */
    async ensureBucketExists(): Promise<void> {
        try {
            // Check if bucket exists
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.some(b => b.name === this.bucketName);

            if (!bucketExists) {
                // Create bucket
                const { error } = await supabase.storage.createBucket(this.bucketName, {
                    public: true,
                    fileSizeLimit: 5242880, // 5MB
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
                });

                if (error) {
                    console.error('Failed to create bucket:', error);
                } else {
                    console.log(`✅ Created storage bucket: ${this.bucketName}`);
                }
            }
        } catch (error) {
            console.error('Bucket check failed:', error);
        }
    }
}

export const imageUploader = new SupabaseImageUploader();
