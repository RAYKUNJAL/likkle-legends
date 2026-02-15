/* 
  Final Sync & Fix Migration v3.1.5
  Addresses identified gaps in Radio, CMS, Analytics, and Gamification
*/

-- 1. Global Config Table 
-- Used for cross-session settings like Radio Playlists and Character defaults
CREATE TABLE IF NOT EXISTS public.global_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.global_config ENABLE ROW LEVEL SECURITY;

-- Policies for global_config
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins have full access to global_config" ON public.global_config;
    DROP POLICY IF EXISTS "Public can view global_config" ON public.global_config;
EXCEPTION WHEN undefined_object THEN null; END $$;

CREATE POLICY "Admins have full access to global_config" ON public.global_config
FOR ALL USING (
    auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
    auth.jwt() ->> 'email' LIKE '%admin@%' OR
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "Public can view global_config" ON public.global_config
FOR SELECT USING (true);

-- 2. Enhance site_settings (Add updated_by tracking used in CMS service)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 3. Fix Gamification (Add child_id to track progress per child)
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.badge_earnings ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_activities_child ON public.activities(child_id);
CREATE INDEX IF NOT EXISTS idx_badge_earnings_child ON public.badge_earnings(child_id);

-- Update RLS for activities
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own child activities" ON public.activities;
    DROP POLICY IF EXISTS "Users can view own child activities" ON public.activities;
EXCEPTION WHEN undefined_object THEN null; END $$;

CREATE POLICY "Users can insert own child activities"
ON public.activities FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.children 
        WHERE id = child_id AND parent_id = auth.uid()
    )
);

CREATE POLICY "Users can view own child activities"
ON public.activities FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.children 
        WHERE id = child_id AND parent_id = auth.uid()
    )
);

-- 4. Overhaul Profiles View
DROP VIEW IF EXISTS public.profiles CASCADE;
CREATE VIEW public.profiles AS 
SELECT 
    u.id,
    u.created_at,
    u.role,
    u.first_name,
    u.first_name as full_name,
    u.email,
    u.whatsapp_number,
    u.origin_island,
    u.preferred_island_code,
    u.location_type,
    u.country_city,
    (u.role = 'admin' OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = u.id)) as is_admin,
    s.plan_id as subscription_tier,
    COALESCE(s.status::text, 'free') as subscription_status,
    s.current_period_end
FROM public.users u
LEFT JOIN (
    SELECT DISTINCT ON (user_id) 
        user_id, 
        plan_id, 
        status, 
        current_period_end
    FROM public.subscriptions
    ORDER BY user_id, created_at DESC
) s ON u.id = s.user_id;

-- 5. Seed Initial Global Config
INSERT INTO public.global_config (key, value)
VALUES ('playlist', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 6. Ensure Grants
GRANT ALL ON public.global_config TO authenticated;
GRANT SELECT ON public.global_config TO anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO service_role;

-- 7. purchased_content table check
CREATE TABLE IF NOT EXISTS public.purchased_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    content_id UUID,
    content_type TEXT,
    amount_paid NUMERIC(10,2) DEFAULT 0.00,
    purchased_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.purchased_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchased_content;
EXCEPTION WHEN undefined_object THEN null; END $$;

CREATE POLICY "Users can view own purchases" 
ON public.purchased_content FOR SELECT 
USING (auth.uid() = user_id);

GRANT ALL ON public.purchased_content TO authenticated;
GRANT ALL ON public.purchased_content TO service_role;
