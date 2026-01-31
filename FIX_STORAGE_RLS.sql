-- =============================================
-- FIX STORAGE RLS & ADMIN ROLE (v1.1 Robust)
-- =============================================
-- 1. ENSURE PRIMARY USER IS ADMIN
-- Replace 'raykunjal@gmail.com' with the correct email if different
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'raykunjal@gmail.com';
-- Ensure entry in admin_users for maximum fallback compatibility
INSERT INTO public.admin_users (id, role)
SELECT id,
    'admin'
FROM public.profiles
WHERE email = 'raykunjal@gmail.com' ON CONFLICT (id) DO NOTHING;
-- 2. RESET STORAGE POLICIES FOR CONTENT BUCKETS
-- We drop existing policies first to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admin Management" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Full Control" ON storage.objects;
-- Policy for Public Read (Everyone)
CREATE POLICY "Public Read Access" ON storage.objects FOR
SELECT USING (
        bucket_id IN (
            'songs',
            'videos',
            'printables',
            'storybooks',
            'characters',
            'avatars'
        )
    );
-- Policy for Admin Full Control (Insert, Update, Delete, Select)
-- Allows authenticated admins to manage all content assets
CREATE POLICY "Admin Full Control" ON storage.objects FOR ALL USING (
    bucket_id IN (
        'songs',
        'videos',
        'printables',
        'storybooks',
        'characters',
        'avatars'
    )
    AND (
        (
            SELECT role
            FROM public.profiles
            WHERE profiles.id = auth.uid()
        ) = 'admin'
        OR EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    )
) WITH CHECK (
    bucket_id IN (
        'songs',
        'videos',
        'printables',
        'storybooks',
        'characters',
        'avatars'
    )
    AND (
        (
            SELECT role
            FROM public.profiles
            WHERE profiles.id = auth.uid()
        ) = 'admin'
        OR EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    )
);
-- 3. ENSURE BUCKETS ARE PUBLIC
-- This ensures the getPublicUrl() works as expected
UPDATE storage.buckets
SET public = true
WHERE id IN (
        'songs',
        'videos',
        'printables',
        'storybooks',
        'characters',
        'avatars'
    );