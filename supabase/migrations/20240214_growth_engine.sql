-- Growth Engine Schema
-- Migration: Add promoters, contests, and referral tracking

-- Enums
DO $$ BEGIN
    CREATE TYPE affiliate_status AS ENUM ('pending_approval', 'approved', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contest_status AS ENUM ('draft', 'scheduled', 'live', 'paused', 'ended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables to avoid schema conflicts (they are currently empty or partial)
DROP TABLE IF EXISTS public.referral_clicks CASCADE;
DROP TABLE IF EXISTS public.contest_entries CASCADE;
DROP TABLE IF EXISTS public.contests CASCADE;
DROP TABLE IF EXISTS public.promoters CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.support_messages CASCADE;

-- Promoters Table
CREATE TABLE IF NOT EXISTS public.promoters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    paypal_email TEXT UNIQUE,
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate REAL DEFAULT 0.10,
    total_earned NUMERIC(10, 2) DEFAULT 0.00,
    total_paid NUMERIC(10, 2) DEFAULT 0.00,
    status affiliate_status DEFAULT 'pending_approval',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contests Table
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    prizes JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT false,
    status contest_status DEFAULT 'draft',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Contest Entries Table
CREATE TABLE IF NOT EXISTS public.contest_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    referred_by_code TEXT,
    total_points INTEGER DEFAULT 0,
    referral_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(contest_id, email)
);

-- Referral Clicks Table
CREATE TABLE IF NOT EXISTS public.referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads Table (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    child_name TEXT,
    island_preference TEXT,
    source TEXT DEFAULT 'story_studio',
    status TEXT DEFAULT 'new',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_name TEXT,
    parent_email TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Basic)
ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to promoters" ON public.promoters 
FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');

CREATE POLICY "Admins have full access to contests" ON public.contests 
FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');

CREATE POLICY "Admins have full access to contest_entries" ON public.contest_entries 
FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');

CREATE POLICY "Admins have full access to referral_clicks" ON public.referral_clicks 
FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');

CREATE POLICY "Admins have full access to leads" ON public.leads 
FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');

CREATE POLICY "Admins have full access to support_messages" ON public.support_messages 
FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');

-- Public access for certain actions (participation)
CREATE POLICY "Public can view active contests" ON public.contests
FOR SELECT USING (is_active = true AND status = 'live');

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.contests TO anon;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.support_messages TO authenticated;
