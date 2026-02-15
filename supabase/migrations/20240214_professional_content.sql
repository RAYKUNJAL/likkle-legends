-- Professional Content Schema for Likkle Legends v3.1.0
-- This migration adds the core content tables used by the Admin Dashboard and AI Agents.

-- 1. Enums (if not already exists)
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('admin', 'super_admin', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Admin Management
DROP TABLE IF EXISTS public.admin_users CASCADE;
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role admin_role DEFAULT 'editor',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Core Content Tables (Professional)
DROP TABLE IF EXISTS public.storybooks CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.printables CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;

CREATE TABLE IF NOT EXISTS public.storybooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    content_json JSONB NOT NULL, -- Pages, text, image prompts
    cover_image_url TEXT,
    age_track TEXT DEFAULT 'all',  -- mini, big, all
    tier_required TEXT DEFAULT 'free', -- free, explorer, legend
    island_theme TEXT,
    reading_time_minutes INTEGER DEFAULT 5,
    word_count INTEGER,
    difficulty_level TEXT,
    is_active BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id), -- Creator
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Island Legend',
    description TEXT,
    lyrics TEXT,
    thumbnail_url TEXT,
    audio_url TEXT,
    duration_seconds INTEGER,
    category TEXT, -- nursery, educational, cultural
    island_origin TEXT,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'free',
    is_active BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    category TEXT,
    island_theme TEXT,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'free',
    is_active BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    game_type TEXT, -- puzzle, matching, trivia
    game_config JSONB DEFAULT '{}', -- Levels, assets, etc.
    estimated_time TEXT,
    is_active BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.printables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    pdf_url TEXT,
    preview_url TEXT,
    tier_required TEXT DEFAULT 'free',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    role_description TEXT,
    bio TEXT,
    personality_traits TEXT[],
    image_url TEXT,
    voice_preset_id TEXT, -- For ElevenLabs
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Dynamic/AI Generation Tracking
DROP TABLE IF EXISTS public.generated_content CASCADE;
CREATE TABLE IF NOT EXISTS public.generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- story, song, pack
    island_id TEXT,
    title TEXT,
    short_hook TEXT,
    generated_content JSONB NOT NULL, -- The full AI payload
    admin_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    is_approved_for_kid BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Business & CMS
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT,
    amount_cents INTEGER,
    currency TEXT DEFAULT 'USD',
    shipping_name TEXT,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    fulfillment_hub TEXT,
    fulfillment_status TEXT DEFAULT 'pending',
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    child_name TEXT,
    child_age INTEGER,
    selected_island TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TABLE IF EXISTS public.saved_stories CASCADE;
CREATE TABLE IF NOT EXISTS public.saved_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    child_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TABLE IF EXISTS public.purchased_content CASCADE;
CREATE TABLE IF NOT EXISTS public.purchased_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    content_id UUID, -- References storybooks, songs, etc.
    content_type TEXT,
    amount_paid NUMERIC(10,2) DEFAULT 0.00,
    purchased_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

DROP TABLE IF EXISTS public.site_settings CASCADE;
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TABLE IF EXISTS public.announcements CASCADE;
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info', -- info, warning, celebrate
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

DROP TABLE IF EXISTS public.custom_song_requests CASCADE;
CREATE TABLE IF NOT EXISTS public.custom_song_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    child_name TEXT,
    occasion TEXT,
    musical_style TEXT,
    status TEXT DEFAULT 'pending', -- pending, creating, delivered
    payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid
    amount_paid NUMERIC(10,2) DEFAULT 0.00,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Compatibility Layer (Profiles View)
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP VIEW IF EXISTS public.profiles CASCADE;
CREATE VIEW public.profiles AS 
SELECT 
    *,
    (role = 'admin') as is_admin,
    first_name as full_name -- Compatibility for full_name
FROM public.users;

-- 7. Indexes & RLS
CREATE INDEX IF NOT EXISTS idx_storybooks_active ON public.storybooks(is_active);
CREATE INDEX IF NOT EXISTS idx_songs_active ON public.songs(is_active);
CREATE INDEX IF NOT EXISTS idx_generated_family ON public.generated_content(family_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchased_content(user_id);

-- Enable RLS
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;

-- Policies for Storybooks/Songs/Videos/Games/Printables (Public View for Active)
DO $$ BEGIN
    CREATE POLICY "Public can view active stories" ON public.storybooks FOR SELECT USING (is_active = true);
    CREATE POLICY "Public can view active songs" ON public.songs FOR SELECT USING (is_active = true);
    CREATE POLICY "Public can view active videos" ON public.videos FOR SELECT USING (is_active = true);
    CREATE POLICY "Public can view active games" ON public.games FOR SELECT USING (is_active = true);
    CREATE POLICY "Public can view active printables" ON public.printables FOR SELECT USING (is_active = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policy for Generated Content (User can see their own)
DO $$ BEGIN
    CREATE POLICY "Users can view own generated content" ON public.generated_content FOR SELECT USING (auth.uid() = family_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policy for Orders (User can see their own)
DO $$ BEGIN
    CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = profile_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policy for Saved Stories (User can see/edit their own)
DO $$ BEGIN
    CREATE POLICY "Users can view own saved stories" ON public.saved_stories FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own saved stories" ON public.saved_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own saved stories" ON public.saved_stories FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own saved stories" ON public.saved_stories FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
