-- UNIVERSAL ADMIN OPERATIONS SCHEMA
-- Run this in your Supabase SQL Editor to enable CRM, Support, AI Brain, and Pixels

-- 1. Support Hub Table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'replied', 'pending', 'resolved'
    metadata JSONB DEFAULT '{}', -- Store reply logs here
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRM Leads Table (From Story Studio)
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    child_name TEXT,
    island_preference TEXT,
    source TEXT DEFAULT 'story_studio',
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'converted', 'lost'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Personality & Brain Table
CREATE TABLE IF NOT EXISTS ai_personality (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
    system_prompt TEXT,
    knowledge_base TEXT,
    voice_settings JSONB DEFAULT '{"stability": 0.5, "similarity_boost": 0.75}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Site Settings (Pixels, Global Config)
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Admin Privileges
-- Ensure profiles table has is_admin column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 6. RLS Policies
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personality ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can Insert support messages and leads
CREATE POLICY "Anyone can submit support" ON support_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit leads" ON leads FOR INSERT WITH CHECK (true);

-- Public can read site settings (for pixels to work in layout)
CREATE POLICY "Public read site settings" ON site_settings FOR SELECT USING (true);

-- ADMIN POLICIES (Only is_admin = true or in admin_users can manage)
CREATE POLICY "Admins manage support" ON support_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins manage leads" ON leads FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins manage personality" ON ai_personality FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins manage site settings" ON site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- Initial Data
INSERT INTO site_settings (key, value)
VALUES ('analytics', '{"facebook_pixel_id": "", "google_analytics_id": "", "tiktok_pixel_id": "", "snapchat_pixel_id": "", "google_tag_manager_id": "", "meta_verification_code": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
