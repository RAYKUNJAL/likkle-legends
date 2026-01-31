-- ==============================================================================
-- GROWTH ENGINE: AFFILIATES, REFERRALS, & VIRAL CONTESTS
-- ==============================================================================
-- 1. PROMOTERS (Cash Affiliates)
-- Trusted partners who get paid revenue share
CREATE TABLE IF NOT EXISTS public.promoters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending_approval' CHECK (
        status IN (
            'pending_approval',
            'approved',
            'suspended',
            'rejected'
        )
    ),
    commission_rate NUMERIC DEFAULT 0.20,
    -- 20% default
    paypal_email TEXT,
    total_earnings NUMERIC DEFAULT 0,
    paid_earnings NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_promoters_code ON promoters(referral_code);
-- 2. PARENT REFERRALS (Credit System)
-- "Give $10, Get 1 Month"
CREATE TABLE IF NOT EXISTS public.referral_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id),
    referred_user_id UUID REFERENCES auth.users(id),
    -- The new customer
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'redeemed')),
    credit_amount NUMERIC DEFAULT 1,
    -- 1 Month free
    created_at TIMESTAMPTZ DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ
);
-- 3. VIRAL CONTESTS (UpViral Clone)
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    -- e.g. "summer-giveaway"
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{
        "points_signup": 10,
        "points_referral": 20,
        "points_share": 3
    }',
    prizes JSONB DEFAULT '[]',
    -- List of prizes and thresholds
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. CONTEST ENTRIES
CREATE TABLE IF NOT EXISTS public.contest_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id),
    email TEXT NOT NULL,
    ref_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    -- Unique referral code for this entry
    referred_by_code TEXT,
    -- Code of the person who referred them
    total_points INTEGER DEFAULT 0,
    referral_count INTEGER DEFAULT 0,
    fraud_score INTEGER DEFAULT 0,
    -- 0-100, 100 = definitely fraud
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contest_id, email)
);
-- 5. ANALYTICS (Referral Tracking)
CREATE TABLE IF NOT EXISTS public.referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code TEXT NOT NULL,
    visitor_ip TEXT,
    user_agent TEXT,
    converted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ==============================================================================
-- SECURITY (RLS)
-- ==============================================================================
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
-- Promoters can view their own data
CREATE POLICY "Promoters view own data" ON promoters FOR
SELECT USING (auth.uid() = user_id);
-- Admins can view/edit everything
CREATE POLICY "Admins manage promoters" ON promoters FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- Public read for active contests
CREATE POLICY "Public read active contests" ON contests FOR
SELECT USING (is_active = true);
-- Anyone can insert contest entry (Viral nature)
CREATE POLICY "Public insert contest entries" ON contest_entries FOR
INSERT WITH CHECK (true);
-- Users (Participants) view their own entries
CREATE POLICY "Participants view own entries" ON contest_entries FOR
SELECT USING (
        email = current_setting('request.jwt.claim.email', true)
    );
-- Public Insert for Referral Clicks (Anonymous tracking)
CREATE POLICY "Public insert referral clicks" ON referral_clicks FOR
INSERT WITH CHECK (true);
-- Admins view clicks
CREATE POLICY "Admins view referal clicks" ON referral_clicks FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Users view their own entries (via email matching, handled by app logic usually, but here we assume logged in for safety or token based)
-- For now, we'll allow public insert, but select needs security.
-- Leaving select restricted to admins for now, app will use service role to check status.
-- ==============================================================================
-- FUNCTIONS
-- ==============================================================================
-- Trigger to update points when someone signs up with a ref code
CREATE OR REPLACE FUNCTION handle_contest_referral() RETURNS TRIGGER AS $$ BEGIN -- If new entry has a referred_by_code, find that entry and increment points
    IF NEW.referred_by_code IS NOT NULL THEN
UPDATE contest_entries
SET referral_count = referral_count + 1,
    total_points = total_points + 20 -- Hardcoded 20 for now, should read from contest settings
WHERE ref_code = NEW.referred_by_code
    AND contest_id = NEW.contest_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_contest_entry_referral
AFTER
INSERT ON contest_entries FOR EACH ROW
    WHEN (NEW.referred_by_code IS NOT NULL) EXECUTE FUNCTION handle_contest_referral();
-- ==============================================================================
-- SEED DATA (Launch Giveaway)
-- ==============================================================================
INSERT INTO public.contests (
        slug,
        title,
        description,
        end_date,
        settings,
        prizes
    )
VALUES (
        'launch-giveaway',
        'Official Launch Giveaway',
        'Win a lifetime subscription and a magical storybox!',
        NOW() + INTERVAL '30 days',
        '{"points_signup": 10, "points_referral": 20, "points_share": 3}',
        '[
        {"rank": 1, "title": "Grand Prize Playlist + Storybox"},
        {"rank": 5, "title": "1 Year Free Subscription"},
        {"rank": 10, "title": "Likkle Legends T-Shirt"}
    ]'::jsonb
    ) ON CONFLICT (slug) DO NOTHING;