-- LIKKLE LEGENDS: RLS RECURSION FIX & SITE SETTINGS (2026-02-23)

-- 1. Ensure site_settings table exists (required for CMS)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Ensure waitlist table exists
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Fix infinite recursion in admin_users policy
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;

-- Re-enable and create safer policy
-- Users can view their own record, or if they have an admin email.
CREATE POLICY "Admins can view admin list" ON public.admin_users FOR SELECT USING (
    id = auth.uid() OR 
    auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
    auth.jwt() ->> 'email' LIKE '%admin@%'
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Secure site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;

CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (
    auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
    auth.jwt() ->> 'email' LIKE '%admin@%' OR
    (SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0
);

-- 5. Secure waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public inserts to waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can view waitlist" ON public.waitlist;

CREATE POLICY "Allow public inserts to waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view waitlist" ON public.waitlist FOR SELECT USING (
    auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
    auth.jwt() ->> 'email' LIKE '%admin@%' OR
    (SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0
);

-- 6. Final Sync
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
NOTIFY pgrst, 'reload schema';
