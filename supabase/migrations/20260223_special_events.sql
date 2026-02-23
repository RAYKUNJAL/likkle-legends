-- ============================================================
-- Phase 4: Special Events & Viral Growth
-- ============================================================

-- 1. Site Settings table
-- Global settings for the platform (multiplier, features, etc)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed Double XP Multiplier
INSERT INTO public.site_settings (key, value)
VALUES ('xp_multiplier', '1')
ON CONFLICT (key) DO NOTHING;

-- 2. Social Gifting (Mangoes)
-- Tracks gifts sent between children
CREATE TABLE IF NOT EXISTS public.mango_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    xp_value INTEGER DEFAULT 5,
    message TEXT,
    created_at DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Index for today's gifts to enforce 3-gift limit
CREATE INDEX IF NOT EXISTS mango_gifts_sender_date ON public.mango_gifts(sender_id, created_at);

-- 3. RLS POLICIES
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mango_gifts   ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);

-- Only admins can modify settings (assuming admin check logic exists, otherwise service_role)
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mango_gifts policies
CREATE POLICY "Children can see gifts they sent/received" ON public.mango_gifts FOR SELECT 
    USING (
        sender_id IN (SELECT id FROM children WHERE parent_id = auth.uid()) OR
        receiver_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
    );

CREATE POLICY "Children can send gifts" ON public.mango_gifts FOR INSERT
    WITH CHECK (
        sender_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
    );

-- Refresh Schema
NOTIFY pgrst, 'reload schema';
