/* 
  Storage Security & Radio Optimization
  Target: Commercial Launch Readiness
*/

-- Ensure Storage RLS is active (it usually is, but let's be safe)
-- Note: We can't easily ALTER TABLE storage.objects if it's not our table, 
-- but we can define policies on it.

DO $$ 
BEGIN
    -- 1. ADVISORY LOCK to prevent concurrent bucket policy creation issues
    PERFORM pg_advisory_xact_lock(102);

    -- 2. PUBLIC READ ACCESS
    -- Allow anyone to read from public asset buckets
    DROP POLICY IF EXISTS "Public Access - Songs" ON storage.objects;
    CREATE POLICY "Public Access - Songs" ON storage.objects FOR SELECT USING (bucket_id = 'songs');

    DROP POLICY IF EXISTS "Public Access - Videos" ON storage.objects;
    CREATE POLICY "Public Access - Videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');

    DROP POLICY IF EXISTS "Public Access - Characters" ON storage.objects;
    CREATE POLICY "Public Access - Characters" ON storage.objects FOR SELECT USING (bucket_id = 'characters');

    DROP POLICY IF EXISTS "Public Access - Printables" ON storage.objects;
    CREATE POLICY "Public Access - Printables" ON storage.objects FOR SELECT USING (bucket_id = 'printables');

    DROP POLICY IF EXISTS "Public Access - Avatars" ON storage.objects;
    CREATE POLICY "Public Access - Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

    DROP POLICY IF EXISTS "Public Access - Radio" ON storage.objects;
    CREATE POLICY "Public Access - Radio" ON storage.objects FOR SELECT USING (bucket_id = 'public-radio');

    -- 3. ADMIN MANAGEMENT
    -- Allow admins to manage all objects
    -- We use the same checks as RLS hardening
    DROP POLICY IF EXISTS "Admin Manage All Objects" ON storage.objects;
    CREATE POLICY "Admin Manage All Objects" ON storage.objects FOR ALL USING (
        auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
        auth.jwt() ->> 'email' LIKE '%admin@%' OR
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    ) WITH CHECK (
        auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
        auth.jwt() ->> 'email' LIKE '%admin@%' OR
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    );

    -- 4. USER SPECIFIC UPLOADS
    -- Allow users to manage their own folders in certain buckets
    DROP POLICY IF EXISTS "Users Manage Own Avatars" ON storage.objects;
    CREATE POLICY "Users Manage Own Avatars" ON storage.objects FOR ALL USING (
        bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
    ) WITH CHECK (
        bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
    );

END $$;
