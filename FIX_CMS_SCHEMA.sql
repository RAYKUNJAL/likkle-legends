-- FIX COLUMN MISMATCH IN site_settings
ALTER TABLE public.site_settings
    RENAME COLUMN value TO content;
-- Add updated_by if missing
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
-- Ensure RLS is correct for CMS management
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage site_settings" ON public.site_settings;
CREATE POLICY "Admins manage site_settings" ON public.site_settings FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
    OR EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR
SELECT USING (true);