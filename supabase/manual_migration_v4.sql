-- LIKKLE LEGENDS: SCHEMA HARDENING & COLUMN FIXES (2026-02-22)
-- This script ensures all required columns exist for the Admin and Profile systems.

-- 0. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('admin', 'super_admin', 'editor');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. FIX USERS TABLE
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    END IF;
END $$;

-- 2. FIX ADMIN_USERS TABLE
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
        ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email TEXT;
        ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS role admin_role DEFAULT 'editor';
    ELSE
        CREATE TABLE IF NOT EXISTS public.admin_users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            role admin_role DEFAULT 'editor',
            created_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;
END $$;

-- 3. REBUILD PROFILES VIEW (ULTRA ROBUST)
DROP VIEW IF EXISTS public.profiles CASCADE;
CREATE OR REPLACE VIEW public.profiles AS 
SELECT 
    u.id,
    u.email,
    u.created_at,
    COALESCE(u.first_name, '') as first_name,
    COALESCE(u.last_name, '') as last_name,
    u.whatsapp_number,
    u.avatar_url,
    (u.role = 'admin' OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = u.id)) as is_admin,
    COALESCE(u.first_name, u.email) as full_name
FROM public.users u;

-- 4. GRANTS
GRANT SELECT ON public.profiles TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 5. REFRESH SCHEMA CACHE
-- This is a hint for PostgREST
NOTIFY pgrst, 'reload schema';
