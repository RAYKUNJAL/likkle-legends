-- Leads Table for Caribbean Growth Engine
-- Run in Supabase SQL Editor
-- Main leads table with full segmentation
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    -- Segmentation fields
    user_type TEXT DEFAULT 'parent' CHECK (
        user_type IN (
            'parent',
            'teacher',
            'grandparent',
            'school_admin',
            'other'
        )
    ),
    island_origin TEXT,
    -- TT, JM, BB, GY, LC, etc.
    current_location TEXT,
    -- City/Country for diaspora tracking
    is_diaspora BOOLEAN DEFAULT false,
    -- Children info (for parents)
    num_children INTEGER,
    child_age_range TEXT,
    -- 'toddler', 'preschool', 'early_elementary', 'mixed'
    -- Interest tags (JSONB array)
    interests JSONB DEFAULT '[]',
    -- ['stories', 'music', 'games', 'printables', 'crafts']
    -- Acquisition tracking
    source TEXT,
    -- 'homepage_popup', 'story_gate', 'educator_signup', 'lead_magnet', 'referral'
    lead_magnet_id UUID,
    -- which PDF they downloaded
    referrer_id UUID,
    -- who referred them
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    -- Consent & compliance
    email_consent BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT true,
    consent_date TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT,
    -- Engagement tracking
    email_opens INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    last_email_open TIMESTAMPTZ,
    last_site_visit TIMESTAMPTZ,
    total_site_visits INTEGER DEFAULT 0,
    -- Status
    status TEXT DEFAULT 'active' CHECK (
        status IN (
            'active',
            'unsubscribed',
            'bounced',
            'spam_reported'
        )
    ),
    unsubscribed_at TIMESTAMPTZ,
    -- Conversion tracking
    converted_to_user BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- Admin can manage all leads
CREATE POLICY "Admins can manage leads" ON leads FOR ALL USING (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
) WITH CHECK (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
);
-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_user_type ON leads (user_type);
CREATE INDEX IF NOT EXISTS idx_leads_island ON leads (island_origin);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
-- Lead Magnets table
CREATE TABLE IF NOT EXISTS lead_magnets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    thumbnail_url TEXT,
    -- Targeting
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('parent', 'teacher', 'all')),
    tags JSONB DEFAULT '[]',
    -- Stats
    download_count INTEGER DEFAULT 0,
    email_captures INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
-- Public can view active lead magnets
CREATE POLICY "Lead magnets are publicly viewable" ON lead_magnets FOR
SELECT USING (is_active = true);
-- Admin can manage lead magnets
CREATE POLICY "Admins can manage lead magnets" ON lead_magnets FOR ALL USING (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
) WITH CHECK (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
);
-- Lead Magnet Downloads tracking
CREATE TABLE IF NOT EXISTS lead_magnet_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    lead_magnet_id UUID REFERENCES lead_magnets(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT
);
-- Enable RLS
ALTER TABLE lead_magnet_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view downloads" ON lead_magnet_downloads FOR ALL USING (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
);
-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_lead_magnet_downloads() RETURNS TRIGGER AS $$ BEGIN
UPDATE lead_magnets
SET download_count = download_count + 1
WHERE id = NEW.lead_magnet_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger for download count
DROP TRIGGER IF EXISTS trigger_increment_downloads ON lead_magnet_downloads;
CREATE TRIGGER trigger_increment_downloads
AFTER
INSERT ON lead_magnet_downloads FOR EACH ROW EXECUTE FUNCTION increment_lead_magnet_downloads();