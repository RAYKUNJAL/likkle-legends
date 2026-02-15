-- Fix children table schema to match v3.1.0 professional expectations
-- Replaces family-centric children table with profile-centric children table

DROP TABLE IF EXISTS public.children CASCADE;

CREATE TABLE public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    age INTEGER,
    age_track TEXT DEFAULT 'all', -- mini, big, all
    avatar_id TEXT,
    avatar_url TEXT,
    primary_island TEXT DEFAULT 'Trinidad & Tobago',
    secondary_island TEXT,
    
    -- Gamification & Stats
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    stories_completed INTEGER DEFAULT 0,
    songs_listened INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    
    -- Cultural & Progression
    patois_words_learned TEXT[] DEFAULT '{}',
    cultural_milestones TEXT[] DEFAULT '{}',
    earned_badges TEXT[] DEFAULT '{}',
    favorite_character TEXT,
    
    last_activity_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_children_parent ON public.children(parent_id);

-- RLS
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own children" 
ON public.children FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert their own children" 
ON public.children FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can update their own children" 
ON public.children FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Users can delete their own children" 
ON public.children FOR DELETE 
USING (auth.uid() = parent_id);

-- Grants
GRANT ALL ON public.children TO authenticated;
GRANT SELECT ON public.children TO anon;
