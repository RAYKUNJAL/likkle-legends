-- LIKKLE LEGENDS: SONGS & MEDIA SCHEMA UPDATES (2026-02-22)

-- 1. UPDATE SONGS TABLE
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'songs') THEN
        ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS island_origin TEXT;
        ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
        ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS tier_required TEXT DEFAULT 'plan_free_forever';
        ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
        ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS lyrics TEXT;
    END IF;
END $$;

-- 2. ENSURE OTHER CONTENT TABLES HAVE CONSISTENCY
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
        ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS tier_required TEXT DEFAULT 'plan_free_forever';
        ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS island_origin TEXT;
    END IF;
END $$;

-- 3. STORAGE POLICIES (RE-SYNC WITH NEW BUCKETS)
-- Ensure all buckets created in init-storage-final.ts are covered by public read
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
    CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT 
    USING (bucket_id IN (
        'songs', 'videos', 'storybooks', 'printables', 'characters', 'avatars', 'vr-assets', 'ar-models'
    ));
EXCEPTION WHEN others THEN NULL; END $$;

-- 4. RE-GRANT PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
