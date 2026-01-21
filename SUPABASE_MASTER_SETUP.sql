-- ============================================================================================
-- LIKKLE LEGENDS: MASTER DATABASE SCHEMA (COMMERCIAL GRADE)
-- Version: 2.2.0 (Full Mission Profile)
-- Description: Consolidated schema including Identity, Content, Education, CRM, and Operations.
-- ============================================================================================

-- 0. INITIAL SETUP & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- SECTION 1: CORE USER & IDENTITY
-- =============================================================

-- 1.1 Parent Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Subscription Info
    subscription_tier TEXT DEFAULT 'free', -- 'starter_mailer', 'legends_plus', 'family_legacy'
    subscription_status TEXT DEFAULT 'inactive', -- 'active', 'trialing', 'past_due', 'canceled'
    trial_ends_at TIMESTAMPTZ,
    subscription_started_at TIMESTAMPTZ,
    next_billing_date DATE,
    
    -- Payment IDs
    paypal_subscription_id TEXT,
    paypal_customer_id TEXT,
    
    -- Localization
    country_code TEXT DEFAULT 'US',
    currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Business Logic
    onboarding_completed BOOLEAN DEFAULT false,
    has_grandparent_dashboard BOOLEAN DEFAULT false,
    has_heritage_dna_story BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Administrative Users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'editor', -- 'super_admin', 'admin', 'editor', 'viewer'
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Children Profiles
CREATE TABLE IF NOT EXISTS children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
    
    -- Gamification Stats
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Learning Details
    stories_completed INTEGER DEFAULT 0,
    songs_listened INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    favorite_character TEXT,
    reading_level TEXT DEFAULT 'beginner',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Grandparent Access
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

-- =============================================================
-- SECTION 2: CONTENT & EDUCATION
-- =============================================================

-- 2.1 Characters
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    tagline TEXT,
    description TEXT,
    personality_traits JSONB DEFAULT '[]',
    image_url TEXT,
    model_3d_url TEXT,
    voice_id TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Character AI Brain
CREATE TABLE IF NOT EXISTS ai_personality (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
    system_prompt TEXT,
    knowledge_base TEXT,
    voice_settings JSONB DEFAULT '{"stability": 0.5, "similarity_boost": 0.75}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Songs
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
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'starter_mailer',
    category TEXT DEFAULT 'nursery',
    island_origin TEXT,
    play_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Storybooks
CREATE TABLE IF NOT EXISTS storybooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content_json JSONB,
    cover_image_url TEXT,
    audio_narration_url TEXT,
    character_id UUID REFERENCES characters(id),
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'legends_plus',
    island_theme TEXT,
    reading_time_minutes INTEGER,
    word_count INTEGER,
    difficulty_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Videos
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'legends_plus',
    category TEXT DEFAULT 'lesson',
    island_theme TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Printables
CREATE TABLE IF NOT EXISTS printables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    preview_url TEXT,
    category TEXT DEFAULT 'coloring',
    tier_required TEXT DEFAULT 'starter_mailer',
    ar_marker_id TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Missions
CREATE TABLE IF NOT EXISTS missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructions JSONB,
    xp_reward INTEGER DEFAULT 100,
    badge_reward TEXT,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'starter_mailer',
    mission_type TEXT DEFAULT 'activity',
    estimated_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Educational Games
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    game_url TEXT,
    game_type TEXT DEFAULT 'trivia',
    category TEXT DEFAULT 'educational',
    tier_required TEXT DEFAULT 'legends_plus',
    play_count INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    estimated_time TEXT DEFAULT '5-10 min',
    age_range TEXT DEFAULT '4-8',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    game_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 VR Locations
CREATE TABLE IF NOT EXISTS vr_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    island_name TEXT NOT NULL,
    location_name TEXT,
    description TEXT,
    panorama_url TEXT NOT NULL,
    hotspots JSONB DEFAULT '[]',
    audio_ambient_url TEXT,
    tier_required TEXT DEFAULT 'starter_mailer',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- SECTION 3: PROGRESS & ACTIVITY
-- =============================================================

-- 3.1 Activity Log
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    content_id UUID,
    xp_earned INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Badge Earnings
CREATE TABLE IF NOT EXISTS badge_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Patois Dictionary Progress
CREATE TABLE IF NOT EXISTS patois_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    meaning TEXT,
    times_practiced INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id, word)
);

-- =============================================================
-- SECTION 4: E-COMMERCE & CRM
-- =============================================================

-- 4.1 Orders & Fulfillment
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE,
    tier TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    fulfillment_hub TEXT,
    fulfillment_status TEXT DEFAULT 'pending',
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    shipping_name TEXT,
    shipping_address_line1 TEXT,
    shipping_city TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    child_name TEXT,
    selected_island TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Leads (CRM)
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    child_name TEXT,
    island_preference TEXT,
    source TEXT DEFAULT 'story_studio',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 Subscription History
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    old_tier TEXT,
    new_tier TEXT,
    status TEXT,
    event_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- SECTION 5: MESSAGING & SUPPORT
-- =============================================================

-- 5.1 Messages (User-to-User or System)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'text',
    content TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Support Inquiries
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_name TEXT,
    parent_email TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 User Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT DEFAULT 'system',
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.4 Global Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    target_audience TEXT DEFAULT 'all',
    tier_required TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- SECTION 6: SYSTEM & OPS
-- =============================================================

-- 6.1 Site Settings (CMS & Tracking)
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2 System Audit Log
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    entity_id TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.3 Email Queue
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    template_id TEXT NOT NULL,
    template_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    send_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON email_queue(status, send_at) WHERE status = 'pending';

-- 6.4 Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    profile_id UUID,
    child_id UUID,
    properties JSONB DEFAULT '{}',
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- SECTION 7: SECURITY & POLICIES (RLS)
-- =============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE grandparent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE printables ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE vr_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patois_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personality ENABLE ROW LEVEL SECURITY;

-- 7.1 Public Read (Content)
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

DROP POLICY IF EXISTS "Public read games" ON games;
CREATE POLICY "Public read games" ON games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read vr_locations" ON vr_locations;
CREATE POLICY "Public read vr_locations" ON vr_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read announcements" ON announcements;
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- 7.2 Public Insert (Leads & Support)
DROP POLICY IF EXISTS "Anyone can submit support" ON support_messages;
CREATE POLICY "Anyone can submit support" ON support_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can submit leads" ON leads;
CREATE POLICY "Anyone can submit leads" ON leads FOR INSERT WITH CHECK (true);

-- 7.3 User Specific Policies
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Parents manage their children" ON children;
CREATE POLICY "Parents manage their children" ON children FOR ALL USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Users view own activities" ON activities;
CREATE POLICY "Users view own activities" ON activities FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- 7.4 Global Admin Override
DROP POLICY IF EXISTS "Admins manage everything" ON profiles;
CREATE POLICY "Admins manage everything" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) OR
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- =============================================================
-- SECTION 8: AUTOMATION & FUNCTIONS
-- =============================================================

-- 8.1 Updated_at Auto-Refresh
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_ts ON profiles;
CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_children_ts ON children;
CREATE TRIGGER update_children_ts BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_orders_ts ON orders;
CREATE TRIGGER update_orders_ts BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 8.2 Profile Generation on Signup
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

-- 8.3 Unique Order Number Generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'LK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_gen_num ON orders;
CREATE TRIGGER orders_gen_num BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =============================================================
-- SECTION 9: SEED DATA
-- =============================================================

INSERT INTO site_settings (key, value)
VALUES ('analytics', '{"facebook_pixel_id": "", "google_analytics_id": "", "tiktok_pixel_id": "", "snapchat_pixel_id": "", "google_tag_manager_id": "", "meta_verification_code": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value)
VALUES ('hero', '{"headline": "Raise Proud, Confident Caribbean Kids", "subheadline": "Personalized stories and cultural activities delivered monthly."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
