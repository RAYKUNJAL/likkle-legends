-- Printables Table for Activity Sheets
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS printables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'coloring' CHECK (
        category IN (
            'coloring',
            'worksheet',
            'activity',
            'game',
            'craft'
        )
    ),
    pdf_url TEXT NOT NULL,
    thumbnail_url TEXT,
    age_group TEXT DEFAULT 'all' CHECK (age_group IN ('all', 'mini', 'big')),
    age_track TEXT DEFAULT 'all',
    island TEXT,
    is_active BOOLEAN DEFAULT true,
    tier_required TEXT DEFAULT 'free' CHECK (tier_required IN ('free', 'rookie', 'legend')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE printables ENABLE ROW LEVEL SECURITY;
-- Allow public read access
CREATE POLICY "Printables are viewable by everyone" ON printables FOR
SELECT USING (is_active = true);
-- Allow authenticated admin to manage
CREATE POLICY "Admins can manage printables" ON printables FOR ALL USING (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
) WITH CHECK (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
);
-- Email Queue Table for Growth Agent
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    template_id TEXT NOT NULL,
    template_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'failed', 'skipped')
    ),
    campaign_type TEXT CHECK (
        campaign_type IN (
            'welcome',
            'abandoned_checkout',
            'win_back',
            'newsletter',
            'transactional'
        )
    ),
    scheduled_for TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
-- Only admin can access email queue
CREATE POLICY "Admins can manage email queue" ON email_queue FOR ALL USING (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
) WITH CHECK (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
);
-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON email_queue (status, scheduled_for)
WHERE status = 'pending';
-- Campaign Settings Table
CREATE TABLE IF NOT EXISTS campaign_settings (
    id TEXT PRIMARY KEY,
    welcome_sequence_enabled BOOLEAN DEFAULT true,
    abandoned_checkout_enabled BOOLEAN DEFAULT false,
    win_back_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Insert default settings
INSERT INTO campaign_settings (
        id,
        welcome_sequence_enabled,
        abandoned_checkout_enabled,
        win_back_enabled
    )
VALUES ('default', true, false, false) ON CONFLICT (id) DO NOTHING;
-- Content Schedule Table for Calendar
CREATE TABLE IF NOT EXISTS content_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL,
    island_id TEXT DEFAULT 'TT',
    age_group TEXT DEFAULT 'mini' CHECK (age_group IN ('mini', 'big', 'all')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled',
            'generating',
            'pending_review',
            'published',
            'failed'
        )
    ),
    generated_content_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
-- Only admin can access content schedule
CREATE POLICY "Admins can manage content schedule" ON content_schedule FOR ALL USING (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
) WITH CHECK (
    auth.jwt()->>'email' IN ('raykunjal@gmail.com')
);
-- Index for efficient date queries
CREATE INDEX IF NOT EXISTS idx_content_schedule_date ON content_schedule (scheduled_date);
