-- Likkle Legends Complete Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/yvoyywnxaammsfwgjvkp/sql)

-- =============================================
-- 1. USER PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'parent', -- 'parent', 'child', 'admin'
    avatar_url TEXT,
    xp_total INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    stars INTEGER DEFAULT 100,
    subscription_tier TEXT DEFAULT 'free', -- 'free', 'starter', 'plus', 'legacy'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CHILD PROFILES (linked to parent)
-- =============================================
CREATE TABLE IF NOT EXISTS public.child_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    age_track TEXT DEFAULT 'big', -- 'mini' (4-5), 'big' (6-8)
    avatar_url TEXT,
    favorite_character TEXT DEFAULT 'roti',
    xp_total INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. STORYBOOKS (Generated Stories)
-- =============================================
CREATE TABLE IF NOT EXISTS public.storybooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT,
    hero_name TEXT,
    hero_type TEXT,
    style TEXT DEFAULT 'folklore',
    pages JSONB NOT NULL DEFAULT '[]'::jsonb,
    moral TEXT,
    parent_note JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. SAVED STORIES (User Library)
-- =============================================
CREATE TABLE IF NOT EXISTS public.saved_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    child_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. ACTIVITIES (Gamification)
-- =============================================
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'story_complete', 'song_listen', 'daily_login', 'badge_earned'
    xp_earned INTEGER DEFAULT 0,
    stars_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. BADGE DEFINITIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    xp_bonus INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. BADGE EARNINGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.badge_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    badge_id TEXT REFERENCES public.badge_definitions(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- =============================================
-- 8. CONTENT ITEMS (CMS)
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'story', 'song', 'printable', 'video'
    title TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    thumbnail_url TEXT,
    audio_url TEXT,
    tier_required TEXT DEFAULT 'free',
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. SITE SETTINGS (CMS Config)
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    notification_bar JSONB DEFAULT '{}'::jsonb,
    hero JSONB DEFAULT '{}'::jsonb,
    features JSONB DEFAULT '{}'::jsonb,
    pricing JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. MESSAGES (Parent-Child Communication)
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Child Profiles
CREATE POLICY "Parents can view own children" ON public.child_profiles FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert children" ON public.child_profiles FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own children" ON public.child_profiles FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete own children" ON public.child_profiles FOR DELETE USING (auth.uid() = parent_id);

-- Storybooks
CREATE POLICY "Users can view own storybooks" ON public.storybooks FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert storybooks" ON public.storybooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own storybooks" ON public.storybooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own storybooks" ON public.storybooks FOR DELETE USING (auth.uid() = user_id);

-- Saved Stories
CREATE POLICY "Users can view own saved stories" ON public.saved_stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved stories" ON public.saved_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved stories" ON public.saved_stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved stories" ON public.saved_stories FOR DELETE USING (auth.uid() = user_id);

-- Activities
CREATE POLICY "Users can view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badge Definitions (public read)
CREATE POLICY "Anyone can view badges" ON public.badge_definitions FOR SELECT USING (true);

-- Badge Earnings
CREATE POLICY "Users can view own badges" ON public.badge_earnings FOR SELECT USING (auth.uid() = user_id);

-- Content Items (public read for published)
CREATE POLICY "Anyone can view published content" ON public.content_items FOR SELECT USING (is_published = true);

-- Site Settings (public read)
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);

-- Messages
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON public.child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_storybooks_user ON public.storybooks(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_stories_user ON public.saved_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_earnings_user ON public.badge_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON public.content_items(type);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);

-- =============================================
-- SEED DATA
-- =============================================

-- Badge Definitions
INSERT INTO public.badge_definitions (id, name, description, icon, xp_bonus) VALUES
    ('first_story', 'Story Starter', 'Completed your first interactive story!', '📖', 50),
    ('music_lover', 'Music Lover', 'Listened to your first Caribbean song.', '🎵', 30),
    ('streak_3', 'On Fire!', 'Logged in for 3 days in a row.', '🔥', 100),
    ('bookworm', 'Bookworm', 'Read 5 stories.', '🐛', 150),
    ('explorer', 'Island Explorer', 'Visited all island locations.', '🗺️', 200),
    ('artist', 'Creative Spirit', 'Created your first custom story.', '🎨', 75)
ON CONFLICT (id) DO NOTHING;

-- Default Site Settings
INSERT INTO public.site_settings (id, notification_bar, hero) VALUES
    ('main', 
     '{"enabled": true, "text": "Limited Time: Get 15% OFF with code LEGEND15"}'::jsonb,
     '{"headline": "Raise Proud, Confident Caribbean Kids."}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_child_profiles_updated_at ON public.child_profiles;
CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON public.child_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_saved_stories_updated_at ON public.saved_stories;
CREATE TRIGGER update_saved_stories_updated_at BEFORE UPDATE ON public.saved_stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- DONE! All tables created successfully.
-- =============================================
