
-- 19. Games (admin uploadable)
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    game_url TEXT, -- External URL or path to game bundle
    game_type TEXT DEFAULT 'trivia',
    category TEXT DEFAULT 'educational', -- 'match', 'puzzle', 'educational', etc.
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

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read games" ON games;
CREATE POLICY "Public read games" ON games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage games" ON games;
CREATE POLICY "Admins can manage games" ON games FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users) OR
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Update trigger for games
DROP TRIGGER IF EXISTS games_updated_at ON games;
CREATE TRIGGER games_updated_at BEFORE UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
