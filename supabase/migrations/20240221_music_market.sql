-- Music Marketplace Engine
-- Migration: Consolidates songs, track purchases, and custom AI song orders

-- 1. Songs Table (Base for Radio & Market)
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    artist TEXT DEFAULT 'Likkle Legends',
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    category TEXT DEFAULT 'story', -- story, lullaby, culture, calm, learning, vip
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Music Purchases Table (Digital Goods)
CREATE TABLE IF NOT EXISTS public.music_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    price_paid NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    purchased_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, song_id)
);

-- 3. Custom Song Orders Table (Suno Integration Intake)
CREATE TABLE IF NOT EXISTS public.custom_song_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, creating, ready, cancelled
    event_type TEXT NOT NULL, -- birthday, event, lullaby, etc.
    child_name TEXT,
    special_instructions TEXT,
    suno_url TEXT, -- Link to Suno project/output
    final_audio_url TEXT, -- Link to final hosted MP3 in Supabase
    price_paid NUMERIC(10, 2) DEFAULT 9.99,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_song_orders ENABLE ROW LEVEL SECURITY;

-- Public can view active songs (Marketplace browsing)
DO $$ BEGIN
    CREATE POLICY "Public can view active songs" ON public.songs
    FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can view their own purchases
DO $$ BEGIN
    CREATE POLICY "Users can view their own purchases" ON public.music_purchases
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can view their own custom orders
DO $$ BEGIN
    CREATE POLICY "Users can view their own custom orders" ON public.custom_song_orders
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admins full access
DO $$ BEGIN
    CREATE POLICY "Admins have full access to songs" ON public.songs 
    FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to music_purchases" ON public.music_purchases 
    FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to custom_song_orders" ON public.custom_song_orders 
    FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Grant permissions
GRANT SELECT ON public.songs TO anon, authenticated;
GRANT SELECT ON public.music_purchases TO authenticated;
GRANT SELECT ON public.custom_song_orders TO authenticated;
GRANT ALL ON public.songs TO service_role;
GRANT ALL ON public.music_purchases TO service_role;
GRANT ALL ON public.custom_song_orders TO service_role;
