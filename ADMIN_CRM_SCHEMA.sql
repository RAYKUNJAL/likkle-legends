-- =============================================================
-- ADMIN CRM & ASSET SCHEMA
-- Supports: Leads, Messages, Announcements, Content Management
-- =============================================================
-- 1. LEADS & CRM 
-- For tracking Story Studio captures and pre-marketing
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    child_name TEXT,
    island_preference TEXT,
    source TEXT DEFAULT 'story_studio',
    status TEXT DEFAULT 'new',
    -- new, contacted, converted, lost
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Leads RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage leads" ON public.leads FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND is_admin = true
    )
    OR EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    )
);
-- Allow public insertion (for lead capture forms)
CREATE POLICY "Public insert leads" ON public.leads FOR
INSERT WITH CHECK (true);
-- 2. SUPPORT MESSAGES
-- For /admin/messages
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    -- Optional, if logged in
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    -- new, read, replied, archived
    metadata JSONB DEFAULT '{}',
    -- stores reply history
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Messages RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage messages" ON public.support_messages FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND is_admin = true
    )
    OR EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    )
);
CREATE POLICY "Users create messages" ON public.support_messages FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users view own messages" ON public.support_messages FOR
SELECT USING (
        auth.uid() = user_id
        OR parent_email = (
            SELECT email
            FROM auth.users
            WHERE id = auth.uid()
        )
    );
-- 3. ANNOUNCEMENTS
-- For /admin/announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    target_audience TEXT DEFAULT 'all',
    -- all, parents, grandparents, subscribers
    tier_required TEXT,
    -- null, starter_mailer, legends_plus
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
-- Announcements RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND is_admin = true
    )
    OR EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    )
);
CREATE POLICY "Everyone reads active announcements" ON public.announcements FOR
SELECT USING (
        is_active = true
        AND start_date <= NOW()
        AND (
            end_date IS NULL
            OR end_date >= NOW()
        )
    );
-- 4. ENSURE CHARACTERS TABLE EXISTS (If missing)
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    tagline TEXT,
    description TEXT,
    personality_traits TEXT [],
    -- Postgres Array of strings
    image_url TEXT,
    model_3d_url TEXT,
    voice_id TEXT,
    display_order INTEGER DEFAULT 99,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Characters RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage characters" ON public.characters FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND is_admin = true
    )
    OR EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    )
);
CREATE POLICY "Everyone reads characters" ON public.characters FOR
SELECT USING (true);
-- 5. CONTENT TABLES (Basics)
-- Ensure Storybooks/Songs exist for Admin Approval Queue
CREATE TABLE IF NOT EXISTS public.storybooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    cover_image_url TEXT,
    content_json JSONB,
    island_theme TEXT,
    age_track TEXT,
    is_active BOOLEAN DEFAULT false,
    -- Starts inactive until approved
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    lyrics TEXT,
    audio_url TEXT,
    cover_image_url TEXT,
    category TEXT,
    age_track TEXT,
    is_active BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
-- Grants for Service Role (AI Agents)
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.support_messages TO service_role;
GRANT ALL ON public.announcements TO service_role;
GRANT ALL ON public.characters TO service_role;
GRANT ALL ON public.storybooks TO service_role;
GRANT ALL ON public.songs TO service_role;