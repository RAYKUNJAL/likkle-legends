-- LIKKLE LEGENDS 2.0 DATABASE SCHEMA
-- Complete Supabase PostgreSQL schema for commercial platform

-- =============================================
-- CORE USER TABLES
-- =============================================

-- 1. Parent Profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    
    -- Subscription Info
    subscription_tier TEXT DEFAULT 'free', -- 'starter_mailer', 'legends_plus', 'family_legacy'
    subscription_status TEXT DEFAULT 'inactive', -- 'active', 'trialing', 'past_due', 'canceled'
    trial_ends_at TIMESTAMPTZ,
    subscription_started_at TIMESTAMPTZ,
    next_billing_date DATE,
    
    -- Payment Info
    paypal_subscription_id TEXT,
    paypal_customer_id TEXT,
    
    -- Localization
    country_code TEXT DEFAULT 'US',
    currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Upsells
    has_grandparent_dashboard BOOLEAN DEFAULT false,
    has_heritage_dna_story BOOLEAN DEFAULT false,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Children Profiles (up to 3 for Family Legacy)
CREATE TABLE IF NOT EXISTS children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Basic Info
    first_name TEXT NOT NULL,
    age INTEGER,
    birth_month INTEGER,
    age_track TEXT DEFAULT 'mini', -- 'mini' (4-5), 'big' (6-8)
    avatar_id TEXT DEFAULT 'default',
    avatar_url TEXT,
    
    -- Heritage Selection
    primary_island TEXT,
    secondary_island TEXT,
    heritage_blend JSONB DEFAULT '[]',
    
    -- Progress & Gamification
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Learning Progress
    stories_completed INTEGER DEFAULT 0,
    songs_listened INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    patois_words_learned JSONB DEFAULT '[]',
    cultural_milestones JSONB DEFAULT '[]',
    earned_badges JSONB DEFAULT '[]',
    
    -- Preferences
    favorite_character TEXT,
    reading_level TEXT DEFAULT 'beginner',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Grandparent Access (upsell)
CREATE TABLE IF NOT EXISTS grandparent_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    grandparent_email TEXT NOT NULL,
    grandparent_name TEXT,
    access_code TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTENT TABLES
-- =============================================

-- 4. Characters (admin uploadable)
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    tagline TEXT,
    description TEXT,
    personality_traits JSONB DEFAULT '[]',
    image_url TEXT,
    model_3d_url TEXT, -- For AR
    voice_id TEXT, -- ElevenLabs voice ID
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Songs (admin uploadable - MP3/MP4)
CREATE TABLE IF NOT EXISTS songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Likkle Legends',
    description TEXT,
    audio_url TEXT NOT NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    lyrics TEXT,
    age_track TEXT DEFAULT 'all', -- 'mini', 'big', 'all'
    tier_required TEXT DEFAULT 'starter_mailer',
    category TEXT DEFAULT 'nursery', -- 'nursery', 'cultural', 'educational'
    island_origin TEXT,
    play_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Storybooks
CREATE TABLE IF NOT EXISTS storybooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content_json JSONB, -- Interactive story structure
    cover_image_url TEXT,
    audio_narration_url TEXT,
    character_id UUID REFERENCES characters(id),
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'legends_plus',
    island_theme TEXT,
    reading_time_minutes INTEGER,
    word_count INTEGER,
    difficulty_level INTEGER DEFAULT 1, -- 1-5
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Videos (admin uploadable)
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'legends_plus',
    category TEXT DEFAULT 'lesson', -- 'lesson', 'song', 'story', 'activity'
    island_theme TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Printables (coloring pages, flashcards)
CREATE TABLE IF NOT EXISTS printables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    preview_url TEXT,
    category TEXT DEFAULT 'coloring', -- 'coloring', 'flashcard', 'activity', 'guide'
    tier_required TEXT DEFAULT 'starter_mailer',
    ar_marker_id TEXT, -- For AR detection
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Missions (weekly challenges)
CREATE TABLE IF NOT EXISTS missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructions JSONB,
    xp_reward INTEGER DEFAULT 100,
    badge_reward TEXT,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'starter_mailer',
    mission_type TEXT DEFAULT 'activity', -- 'activity', 'reading', 'music', 'culture'
    estimated_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. VR Portal Locations
CREATE TABLE IF NOT EXISTS vr_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    island_name TEXT NOT NULL,
    location_name TEXT,
    description TEXT,
    panorama_url TEXT NOT NULL,
    hotspots JSONB DEFAULT '[]', -- Navigation points
    audio_ambient_url TEXT,
    tier_required TEXT DEFAULT 'starter_mailer',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACTIVITY & PROGRESS TABLES
-- =============================================

-- 11. Activity Log
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'story', 'song', 'mission', 'flashcard', 'vr', 'ar'
    content_id UUID,
    xp_earned INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Badge Earnings
CREATE TABLE IF NOT EXISTS badge_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Patois Dictionary Progress
CREATE TABLE IF NOT EXISTS patois_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    meaning TEXT,
    pronunciation_audio_url TEXT,
    times_practiced INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0, -- 0-5
    last_practiced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id, word)
);

-- =============================================
-- ORDER & FULFILLMENT TABLES
-- =============================================

-- 14. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Order Details
    order_number TEXT UNIQUE,
    tier TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Payment
    paypal_order_id TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    paid_at TIMESTAMPTZ,
    
    -- Shipping
    shipping_name TEXT,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    
    -- Fulfillment
    fulfillment_hub TEXT, -- 'maryland', 'stannp_uk', 'stannp_canada'
    fulfillment_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered'
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Child Personalization
    child_name TEXT,
    child_age INTEGER,
    selected_island TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. One-time Purchases (upsells)
CREATE TABLE IF NOT EXISTS one_time_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL, -- 'heritage_dna_story', 'extra_character', etc.
    amount_cents INTEGER NOT NULL,
    paypal_order_id TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADMIN & ANALYTICS TABLES
-- =============================================

-- 16. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'editor', -- 'super_admin', 'admin', 'editor', 'viewer'
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    profile_id UUID,
    child_id UUID,
    properties JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Email Queue
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    template_id TEXT NOT NULL,
    template_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE grandparent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patois_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_time_purchases ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Children: Parents can manage their children
DROP POLICY IF EXISTS "Parents can view their children" ON children;
CREATE POLICY "Parents can view their children" ON children FOR SELECT USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can insert children" ON children;
CREATE POLICY "Parents can insert children" ON children FOR INSERT WITH CHECK (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can update children" ON children;
CREATE POLICY "Parents can update children" ON children FOR UPDATE USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can delete children" ON children;
CREATE POLICY "Parents can delete children" ON children FOR DELETE USING (auth.uid() = parent_id);

-- Content tables are publicly readable
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE printables ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vr_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read characters" ON characters;
CREATE POLICY "Public read characters" ON characters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read songs" ON songs;
CREATE POLICY "Public read songs" ON songs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read storybooks" ON storybooks;
CREATE POLICY "Public read storybooks" ON storybooks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read videos" ON videos;
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read printables" ON printables;
CREATE POLICY "Public read printables" ON printables FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read missions" ON missions;
CREATE POLICY "Public read missions" ON missions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read vr_locations" ON vr_locations;
CREATE POLICY "Public read vr_locations" ON vr_locations FOR SELECT USING (true);

-- Activities: Users can view/insert their own
DROP POLICY IF EXISTS "Users view own activities" ON activities;
CREATE POLICY "Users view own activities" ON activities FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users insert own activities" ON activities;
CREATE POLICY "Users insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Orders: Users can view their own orders
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = profile_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS children_updated_at ON children;
CREATE TRIGGER children_updated_at BEFORE UPDATE ON children
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'LL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_generate_number ON orders;
CREATE TRIGGER orders_generate_number BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_activities_child_id ON activities(child_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_songs_tier_required ON songs(tier_required);
CREATE INDEX IF NOT EXISTS idx_storybooks_tier_required ON storybooks(tier_required);
