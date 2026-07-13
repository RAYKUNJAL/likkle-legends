-- =============================================
-- LIKKLE LEGENDS — Full Schema for Self-Hosted Supabase
-- =============================================

-- 1. profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    role TEXT DEFAULT 'parent',
    first_name TEXT DEFAULT '',
    full_name TEXT DEFAULT '',
    email TEXT,
    whatsapp_number TEXT DEFAULT '',
    origin_island TEXT DEFAULT '',
    preferred_island_code TEXT DEFAULT '',
    location_type TEXT DEFAULT '',
    country_city TEXT DEFAULT '',
    is_admin BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'inactive',
    current_period_end TIMESTAMPTZ,
    parent_name TEXT DEFAULT ''
);

-- 2. children table
CREATE TABLE IF NOT EXISTS public.children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    primary_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    first_name TEXT DEFAULT '',
    age INTEGER DEFAULT 5,
    age_track TEXT DEFAULT 'mini',
    age_band TEXT DEFAULT 'mini',
    age_verified BOOLEAN DEFAULT FALSE,
    avatar_id TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    primary_island TEXT DEFAULT 'mixed',
    secondary_island TEXT DEFAULT '',
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    stories_completed INTEGER DEFAULT 0,
    songs_listened INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    patois_words_learned TEXT[] DEFAULT '{}',
    cultural_milestones TEXT[] DEFAULT '{}',
    earned_badges TEXT[] DEFAULT '{}',
    favorite_character TEXT DEFAULT 'roti',
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    family_group_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    plan_id TEXT,
    tier TEXT DEFAULT 'free',
    status TEXT DEFAULT 'inactive',
    paypal_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    child_id UUID REFERENCES public.children(id),
    product_id TEXT,
    product_name TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    paypal_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Email queue table
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    email_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    html_content TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON public.email_queue(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON public.email_queue(user_id);

-- 6. One-time orders table
CREATE TABLE IF NOT EXISTS public.one_time_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    product_id TEXT NOT NULL,
    product_name TEXT,
    child_name TEXT,
    child_age INTEGER,
    character TEXT,
    parent_email TEXT NOT NULL,
    personalization_message TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'refunded', 'disputed')),
    fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'fulfilled', 'cancelled')),
    fulfilled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_one_time_orders_email ON public.one_time_orders(parent_email);
CREATE INDEX IF NOT EXISTS idx_one_time_orders_user ON public.one_time_orders(user_id);

-- 7. Island curricula table
CREATE TABLE IF NOT EXISTS public.island_curricula (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    island_code TEXT NOT NULL,
    child_name TEXT NOT NULL,
    age_track TEXT CHECK (age_track IN ('mini', 'big')),
    character_host TEXT,
    curriculum JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, island_code, child_name)
);

CREATE INDEX IF NOT EXISTS idx_island_curricula_user ON public.island_curricula(user_id);

-- 8. Subscription nurture table
CREATE TABLE IF NOT EXISTS public.subscription_nurture (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    email_type TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, email_type)
);

CREATE INDEX IF NOT EXISTS idx_subscription_nurture_user ON public.subscription_nurture(user_id);

-- 9. Content tables (for blog, stories, etc.)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    meta_title TEXT,
    meta_description TEXT,
    body_md TEXT,
    body_html TEXT,
    hero_image_url TEXT,
    word_count INTEGER DEFAULT 0,
    primary_keyword TEXT,
    secondary_keywords TEXT[] DEFAULT '{}',
    angle TEXT,
    faq JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id),
    referred_id UUID REFERENCES auth.users(id),
    code TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Activities / XP
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    type TEXT,
    description TEXT,
    xp_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_child ON public.activities(child_id);

-- 12. Badge earnings
CREATE TABLE IF NOT EXISTS public.badge_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    badge_id TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Daily logins
CREATE TABLE IF NOT EXISTS public.daily_logins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    login_date DATE DEFAULT CURRENT_DATE,
    streak_day INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Characters
CREATE TABLE IF NOT EXISTS public.characters (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    tagline TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Stories
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    title TEXT,
    content TEXT,
    character TEXT,
    island TEXT,
    age_track TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Agent tables
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    status TEXT DEFAULT 'idle',
    last_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_key TEXT,
    event TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_key TEXT,
    status TEXT DEFAULT 'pending',
    input JSONB DEFAULT '{}'::jsonb,
    output JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_key TEXT,
    title TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    assignee TEXT,
    due_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_key TEXT,
    level TEXT DEFAULT 'info',
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_key TEXT,
    content_type TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Content schedule
CREATE TABLE IF NOT EXISTS public.content_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT,
    title TEXT,
    scheduled_for TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT,
    topic TEXT,
    status TEXT DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ,
    generated_post_id UUID,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 18. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Streak freezes
CREATE TABLE IF NOT EXISTS public.streak_freezes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    freeze_date DATE DEFAULT CURRENT_DATE,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    island TEXT,
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_time_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.island_curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_nurture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

-- Users can view/edit their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can manage their own children
CREATE POLICY IF NOT EXISTS "Users can view own children" ON public.children FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = primary_user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own children" ON public.children FOR INSERT WITH CHECK (auth.uid() = parent_id OR auth.uid() = primary_user_id);
CREATE POLICY IF NOT EXISTS "Users can update own children" ON public.children FOR UPDATE USING (auth.uid() = parent_id OR auth.uid() = primary_user_id);

-- Users can view own subscriptions/orders
CREATE POLICY IF NOT EXISTS "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own email queue" ON public.email_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own one_time_orders" ON public.one_time_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own curricula" ON public.island_curricula FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT parent_id FROM public.children WHERE id = activities.child_id));

-- =============================================
-- Trigger: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, first_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Seed data
-- =============================================
INSERT INTO public.characters (id, name, role, tagline, description) VALUES
    ('roti', 'R.O.T.I.', 'Learning Buddy', 'Beep boop! Ready to learn?', 'A friendly robot guide who helps children learn step by step.'),
    ('tanty_spice', 'Tanty Spice', 'Village Heart', 'Everything cook & curry, me darlin''.', 'A warm, caring presence who helps lessons land with kindness.'),
    ('dilly_doubles', 'Dilly Doubles', 'Joy & Sharing', 'Sharing is the island way!', 'A playful island friend who teaches curiosity and sharing.'),
    ('scholar_supreme', 'Scholar Supreme', 'Knowledge & Adventure', 'Books are portals!', 'A wise guide who opens doors to stories and discovery.')
ON CONFLICT (id) DO NOTHING;
