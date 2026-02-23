-- LIKKLE LEGENDS: CORE INFRASTRUCTURE MIGRATION (2026-02-22)
-- This script synchronizes the schema, security, and identity infrastructure for the new project.

-- 1. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('admin', 'super_admin', 'editor');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. ADMIN MANAGEMENT FIX
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
        -- Add email column if missing
        ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
        -- Add role if missing
        ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS role admin_role DEFAULT 'editor';
    ELSE
        CREATE TABLE public.admin_users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            role admin_role DEFAULT 'editor',
            created_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;
END $$;

-- 3. IDENTITY & COPPA SCHEMA FIXES
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'users') THEN
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_coppa_designated_parent BOOLEAN DEFAULT false;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_island_code TEXT;
    END IF;
END $$;

-- 4. OTP CODES (For WhatsApp Login)
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. UPDATABLE PROFILES VIEW (CLEANUP & REBUILD)
-- This section is ultra-robust to handle any existing object named 'profiles'
DO $$ 
BEGIN
    -- Drop the view if it exists
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'profiles') THEN
        DROP VIEW public.profiles CASCADE;
    END IF;
    
    -- Drop the table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP TABLE public.profiles CASCADE;
    END IF;

    -- Drop materialized view just in case
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'profiles') THEN
        DROP MATERIALIZED VIEW public.profiles CASCADE;
    END IF;
END $$;

-- Now create the fresh view
CREATE VIEW public.profiles AS 
SELECT 
    u.*,
    (u.role = 'admin' OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = u.id)) as is_admin,
    COALESCE(u.first_name, u.email) as full_name
FROM public.users u;

-- 6. RLS HARDENING
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
    CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (
        auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
        auth.jwt() ->> 'email' LIKE '%admin@%' OR
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    );
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 7. STORAGE SECURITY (RLS)
-- Note: This requires storage schema permissions
DO $$ BEGIN
    -- Ensure RLS is enabled on storage.objects
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Public Read for Music and Assets
    DROP POLICY IF EXISTS "Public Access - Songs" ON storage.objects;
    CREATE POLICY "Public Access - Songs" ON storage.objects FOR SELECT 
    USING (bucket_id IN ('songs', 'Tanty spice radio', 'videos', 'storybooks', 'content-images'));
    
    -- Admin Management (Full Control)
    DROP POLICY IF EXISTS "Admin Manage All Objects" ON storage.objects;
    CREATE POLICY "Admin Manage All Objects" ON storage.objects FOR ALL 
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
        auth.jwt() ->> 'email' LIKE '%admin@%' OR
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
        auth.jwt() ->> 'email' LIKE '%admin@%' OR
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    );
EXCEPTION WHEN others THEN NULL; END $$;

-- GRANTS
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
