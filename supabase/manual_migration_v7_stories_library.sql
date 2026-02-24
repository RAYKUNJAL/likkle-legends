-- LIKKLE LEGENDS: CREATE STORIES_LIBRARY TABLE (2026-02-24)
-- Database-driven story system with robust filtering for Caribbean content

-- 1. CREATE stories_library TABLE
CREATE TABLE IF NOT EXISTS public.stories_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,

    -- FILTERING COLUMNS (indexed for fast queries)
    tradition VARCHAR(50) NOT NULL,  -- 'anansi', 'papa_bois', 'river_mumma', 'chickcharney'
    reading_level VARCHAR(50) NOT NULL,  -- 'emergent', 'early', 'transitional'
    island_code VARCHAR(50) NOT NULL,  -- 'JM', 'TT', 'GY', 'PR', 'CU', etc.
    age_track VARCHAR(50) NOT NULL,  -- 'mini' (3-5), 'big' (6-9)

    -- CONTENT
    summary TEXT,
    cover_image_url TEXT,
    content_json JSONB NOT NULL,  -- Full story structure (pages, metadata)

    -- METADATA
    xp_reward INTEGER DEFAULT 100,
    estimated_reading_time_minutes INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CREATE INDEXES FOR FAST FILTERING
CREATE INDEX IF NOT EXISTS idx_stories_tradition ON public.stories_library(tradition);
CREATE INDEX IF NOT EXISTS idx_stories_reading_level ON public.stories_library(reading_level);
CREATE INDEX IF NOT EXISTS idx_stories_island ON public.stories_library(island_code);
CREATE INDEX IF NOT EXISTS idx_stories_age_track ON public.stories_library(age_track);
CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories_library(is_active);

-- COMPOUND INDEX for common multi-filter queries
CREATE INDEX IF NOT EXISTS idx_stories_filter_combo
    ON public.stories_library(island_code, reading_level, age_track, is_active);

-- 3. PERMISSIONS
GRANT SELECT ON public.stories_library TO authenticated, anon;
GRANT ALL ON public.stories_library TO service_role;

-- 4. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
