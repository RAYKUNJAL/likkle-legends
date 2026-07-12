-- =============================================
-- LAUNCH MIGRATION: Missing tables and columns
-- Run in Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Email queue table (for nurture automation)
CREATE TABLE IF NOT EXISTS email_queue (
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

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON email_queue(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id);

-- 2. Add parent_name column to profiles if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parent_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN parent_name TEXT DEFAULT '';
    END IF;
END $$;

-- 3. One-time orders table (for birthday letters and other non-subscription products)
CREATE TABLE IF NOT EXISTS one_time_orders (
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

CREATE INDEX IF NOT EXISTS idx_one_time_orders_email ON one_time_orders(parent_email);
CREATE INDEX IF NOT EXISTS idx_one_time_orders_user ON one_time_orders(user_id);

-- 4. Island curricula table (for concierge agent)
CREATE TABLE IF NOT EXISTS island_curricula (
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

CREATE INDEX IF NOT EXISTS idx_island_curricula_user ON island_curricula(user_id);

-- 5. Enable RLS on new tables
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_time_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE island_curricula ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see their own data
CREATE POLICY IF NOT EXISTS "Users can view own email queue" ON email_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own orders" ON one_time_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own curricula" ON island_curricula
    FOR SELECT USING (auth.uid() = user_id);

-- Service role bypasses RLS (for cron jobs and admin)
-- No INSERT/UPDATE policies needed for users — all writes go through service role

-- 6. Subscription nurture table (for email automation tracking)
CREATE TABLE IF NOT EXISTS subscription_nurture (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    email_type TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, email_type)
);

CREATE INDEX IF NOT EXISTS idx_subscription_nurture_user ON subscription_nurture(user_id);
