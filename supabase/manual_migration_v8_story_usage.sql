-- LIKKLE LEGENDS: STORY USAGE TRACKING TABLE (2026-02-24)
-- Tracks free tier story usage for rate limiting

CREATE TABLE IF NOT EXISTS public.story_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    story_id TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- INDEX for fast queries
CREATE INDEX IF NOT EXISTS idx_story_usage_user_date ON public.story_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_story_usage_child_date ON public.story_usage(child_id, date);

-- UNIQUE constraint per user per day (one record per user per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_usage_user_day ON public.story_usage(user_id, date);

-- PERMISSIONS
GRANT SELECT, INSERT, UPDATE ON public.story_usage TO authenticated;
GRANT ALL ON public.story_usage TO service_role;

-- REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
