-- =============================================
-- FINAL ADMIN CENTER REPAIR: SCHEMA ALIGNMENT
-- =============================================
-- 1. MISSING TABLE: purchased_content
-- Required for Store Analytics dashboard
CREATE TABLE IF NOT EXISTS public.purchased_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id UUID,
    -- References songs/storybooks/etc
    content_type TEXT NOT NULL,
    -- 'song', 'bundle', 'premium_access'
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for purchased_content
ALTER TABLE public.purchased_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view all purchases" ON public.purchased_content FOR
SELECT USING (
        (
            SELECT role
            FROM public.profiles
            WHERE id = auth.uid()
        ) = 'admin'
        OR EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Users view own purchases" ON public.purchased_content FOR
SELECT USING (auth.uid() = profile_id);
-- 2. MISSING TABLE: custom_song_requests (if not exists)
-- Used for high-ticket personalized songs
CREATE TABLE IF NOT EXISTS public.custom_song_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    occasion TEXT,
    island_vibe TEXT,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    -- 'pending', 'paid', 'refunded'
    status TEXT DEFAULT 'new',
    -- 'new', 'composing', 'recording', 'delivered'
    delivery_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS for custom_song_requests
ALTER TABLE public.custom_song_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage custom requests" ON public.custom_song_requests FOR ALL USING (
    (
        SELECT role
        FROM public.profiles
        WHERE id = auth.uid()
    ) = 'admin'
    OR EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    )
);
-- 3. ALIGN AI PERSONALITY SCHEMA
-- UI expects 'system_prompt', 'knowledge_base', 'voice_settings'
-- Added 'similarity_boost' support to voice_settings JSON
ALTER TABLE public.ai_personality
ADD COLUMN IF NOT EXISTS catchphrases JSONB DEFAULT '[]';
-- 4. ENSURE ADMIN ANALYTICS VIEW OR HELPER
-- This helps the getAdminAnalytics service action
CREATE OR REPLACE VIEW public.admin_stats_summary AS
SELECT (
        SELECT COUNT(*)
        FROM public.profiles
    ) as total_users,
    (
        SELECT COUNT(*)
        FROM public.profiles
        WHERE subscription_status = 'active'
    ) as active_subs,
    (
        SELECT COUNT(*)
        FROM public.profiles
        WHERE created_at >= NOW() - INTERVAL '30 days'
    ) as new_signups,
    (
        SELECT COUNT(*)
        FROM public.children
    ) as total_children,
    (
        SELECT COUNT(*)
        FROM public.orders
        WHERE fulfillment_status = 'pending'
    ) as pending_orders,
    (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM public.purchased_content
        WHERE purchased_at >= date_trunc('month', now())
    ) as monthly_rev;
-- Grant access to stats summary
GRANT SELECT ON public.admin_stats_summary TO authenticated;
GRANT SELECT ON public.admin_stats_summary TO service_role;