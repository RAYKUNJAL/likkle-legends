-- Fix infinite recursion in admin_users policy
-- The previous policy used EXISTS(SELECT 1 FROM public.admin_users) which triggered itself.
-- We switch to checking the user's email directly from the JWT for common admins, 
-- and only check the table for the user's specific ID.

ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;

-- Re-enable and create safer policy
-- Users can view their own record, or if they have an admin email.
-- This avoids the self-referential EXISTS check.
CREATE POLICY "Admins can view admin list" ON public.admin_users FOR SELECT USING (
    id = auth.uid() OR 
    auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
    auth.jwt() ->> 'email' LIKE '%admin@%'
);

-- Apply similar fix to other tables that were using the recursive check
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (
    auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
    auth.jwt() ->> 'email' LIKE '%admin@%' OR
    (SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0
);

DROP POLICY IF EXISTS "Admins can view waitlist" ON public.waitlist;
CREATE POLICY "Admins can view waitlist" ON public.waitlist FOR SELECT USING (
    auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
    auth.jwt() ->> 'email' LIKE '%admin@%' OR
    (SELECT count(*) FROM public.admin_users WHERE id = auth.uid()) > 0
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
