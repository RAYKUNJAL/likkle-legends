-- COMPLETE SUPABASE SETUP FOR LIKKLE LEGENDS
-- Media Storage: Music Files, Videos, Training Materials

-- Training Materials Table
CREATE TABLE IF NOT EXISTS training_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT DEFAULT 'lesson',
    content_url TEXT,
    thumbnail_url TEXT,
    pdf_url TEXT,
    duration_minutes INTEGER,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'legends_plus',
    category TEXT,
    island_theme TEXT,
    learning_objectives JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters Table
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions Table  
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

-- Printables Table
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

-- Enable RLS on all tables
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE printables ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Public read training_materials" ON training_materials FOR SELECT USING (true);
CREATE POLICY "Public read characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Public read missions" ON missions FOR SELECT USING (true);
CREATE POLICY "Public read printables" ON printables FOR SELECT USING (true);

-- Admin insert/update/delete policies (requires admin role)
CREATE POLICY "Admin manage storybooks" ON storybooks FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admin manage songs" ON songs FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admin manage training_materials" ON training_materials FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admin manage characters" ON characters FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- Admin users table (if doesn't exist)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'editor',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_materials_tier ON training_materials(tier_required);
CREATE INDEX IF NOT EXISTS idx_training_materials_active ON training_materials(is_active);
CREATE INDEX IF NOT EXISTS idx_characters_active ON characters(is_active);
CREATE INDEX IF NOT EXISTS idx_missions_dates ON missions(start_date, end_date);
