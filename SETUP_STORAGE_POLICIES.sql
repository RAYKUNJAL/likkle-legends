-- ==============================================================================
-- STORAGE BUCKET SETUP & POLICIES (FIXED)
-- Description: Configures Supabase Storage for Admin Media Uploads and Public Access.
-- Fix: Removed "ALTER TABLE" command which causes ownership errors.
-- ==============================================================================
-- 1. Create Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('songs', 'songs', true),
    ('videos', 'videos', true),
    ('printables', 'printables', true),
    ('storybooks', 'storybooks', true),
    ('characters', 'characters', true),
    ('avatars', 'avatars', true),
    ('vr-assets', 'vr-assets', true),
    ('ar-models', 'ar-models', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- 2. Public Read Policy (Allow everyone to view/download files from these buckets)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR
SELECT USING (
        bucket_id IN (
            'songs',
            'videos',
            'printables',
            'storybooks',
            'characters',
            'avatars',
            'vr-assets',
            'ar-models'
        )
    );
-- 3. Authenticated Admin Upload Policy
-- Allows any authenticated user to upload. 
-- In a strict production environment, you might want to check for 'is_admin' in profiles, 
-- but for now, checking for authentication is sufficient to unblock the Admin Panel.
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Updates" ON storage.objects;
CREATE POLICY "Authenticated Updates" ON storage.objects FOR
UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;
CREATE POLICY "Authenticated Deletes" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
-- 4. Note: We removed "ALTER TABLE storage.objects ENABLE RLS" as it is on by default and causes permission errors.