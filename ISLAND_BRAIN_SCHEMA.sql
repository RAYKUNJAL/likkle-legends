
-- ISLAND BRAIN AGENT STORE SCHEMA
-- Stores raw AI generated outputs, requests, and approvals.

-- 1. Generated Content Store
-- Acts as the "Content Store" service from the blueprint.
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    island_id TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'song_video_script', 'story_bedtime', etc.
    title TEXT,
    payload JSONB NOT NULL, -- The full JSON output from the AI
    parent_note JSONB, -- Extracted parent guidance notes
    metadata JSONB DEFAULT '{}', -- Usage tags, qa_report, etc.
    
    -- Approval Status
    is_approved_for_kid BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    
    -- Cache / Reuse
    version INTEGER DEFAULT 1,
    is_public_template BOOLEAN DEFAULT false, -- If true, can be reused by other families
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Monthly Drop Bundles
-- Stores the high-level bundles generated for families.
CREATE TABLE IF NOT EXISTS monthly_drops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    month_key TEXT NOT NULL, -- '2026-02'
    theme_title TEXT,
    visitor_character_id TEXT,
    bundle_payload JSONB NOT NULL, -- The full structure
    
    is_viewed BOOLEAN DEFAULT false,
    viewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_family ON generated_content(family_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_monthly_drops_family ON monthly_drops(family_id, month_key);

-- RLS Policies
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_drops ENABLE ROW LEVEL SECURITY;

-- Families can view their own content
CREATE POLICY "Users view own generated content" ON generated_content
    FOR SELECT USING (auth.uid() = family_id);

CREATE POLICY "Users view own monthly drops" ON monthly_drops
    FOR SELECT USING (auth.uid() = family_id);

-- Service Role (Agent) needs full access (handled by bypassing RLS in server code usually, 
-- but we can add specific policies if using client SDK)
