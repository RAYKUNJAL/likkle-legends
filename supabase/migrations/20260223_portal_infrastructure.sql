-- LIKKLE LEGENDS: CORE PORTAL INFRASTRUCTURE (2026-02-23)
-- Run this in your Supabase SQL Editor to enable Profile Setup, Gamification, and the Content Library.

-- 1. CHILDREN TABLE
-- Holds child profiles, XP, and cultural milestones.
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    age INTEGER,
    age_track TEXT CHECK (age_track IN ('mini', 'big')),
    primary_island TEXT,
    secondary_island TEXT,
    favorite_character TEXT,
    avatar_id TEXT,
    
    -- Gamification
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    earned_badges TEXT[] DEFAULT '{}',
    cultural_milestones TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. CONTENT_ITEMS TABLE
-- Unified library for stories, characters, missions, and videos.
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('story', 'character', 'video', 'mission', 'resource_pdf', 'game')),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    media_url TEXT, -- Video URL, PDF URL, etc.
    tier_required TEXT DEFAULT 'free', -- 'free', 'legends_plus', 'family_legacy'
    age_track TEXT DEFAULT 'all', -- 'mini', 'big', 'all'
    island_code TEXT, -- e.g. 'JAM', 'TTO'
    reward_xp INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. SONGS TABLE
-- Dedicated table for the Island Radio.
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Likkle Legends',
    thumbnail_url TEXT,
    audio_url TEXT NOT NULL,
    tier_required TEXT DEFAULT 'free',
    reward_xp INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. ACTIVITIES TABLE
-- Tracks every action a child takes for XP and progress reporting.
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'story_read', 'song_listened', 'mission_completed', 'xp_earn'
    content_id UUID,
    xp_earned INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. BADGE_EARNINGS TABLE
CREATE TABLE IF NOT EXISTS public.badge_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. GENERATED_CONTENT TABLE (AI Story Studio)
CREATE TABLE IF NOT EXISTS public.generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
    island_id TEXT,
    content_type TEXT DEFAULT 'story',
    title TEXT,
    payload JSONB NOT NULL,
    parent_note TEXT,
    metadata JSONB DEFAULT '{}',
    admin_status TEXT DEFAULT 'pending',
    is_approved_for_kid BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    fulfillment_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered'
    tracking_number TEXT,
    shipping_name TEXT,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    fulfillment_hub TEXT,
    child_name TEXT,
    child_age INTEGER,
    selected_island TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. RLS POLICIES

-- Enable RLS
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Public/Authenticated Access to Content
CREATE POLICY "Anyone can view active content items" ON public.content_items FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active songs" ON public.songs FOR SELECT USING (is_active = true);

-- User-Specific Data Access
CREATE POLICY "Parents can view their own children" ON public.children 
    FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert their own children" ON public.children 
    FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update their own children" ON public.children 
    FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can view their family activities" ON public.activities 
    FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Parents can insert family activities" ON public.activities 
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Parents can view their family generated content" ON public.generated_content 
    FOR SELECT USING (auth.uid() = family_id);
CREATE POLICY "Parents can view their own orders" ON public.orders 
    FOR SELECT USING (auth.uid() = profile_id);

-- 9. GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.content_items TO authenticated, anon;
GRANT SELECT ON public.songs TO authenticated, anon;
GRANT ALL ON public.children TO authenticated;
GRANT ALL ON public.activities TO authenticated;
GRANT ALL ON public.generated_content TO authenticated;

-- Refresh Schema
NOTIFY pgrst, 'reload schema';
