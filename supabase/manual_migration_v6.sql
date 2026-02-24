-- LIKKLE LEGENDS: CREATE MISSING TABLES FOR LAUNCH (2026-02-22)
-- This script safely creates or updates blog_posts, content_items, and site_settings tables

-- 1. blog_posts TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(50),
    author_name TEXT DEFAULT 'Likkle Legends',
    featured_image_url TEXT,
    published_at TIMESTAMPTZ,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure critical columns exist if table already existed from an older/different schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='status') THEN
        ALTER TABLE public.blog_posts ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='published_at') THEN
        ALTER TABLE public.blog_posts ADD COLUMN published_at TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- 2. content_items TABLE
-- Unified library for stories, characters, missions, and videos.
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    island_code VARCHAR(50),
    age_track VARCHAR(50),
    published BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Polyfill for missing columns in content_items (fixes "published column does not exist" error)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_items' AND column_name='published') THEN
        ALTER TABLE public.content_items ADD COLUMN published BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_items' AND column_name='is_active') THEN
        ALTER TABLE public.content_items ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_items' AND column_name='track_tags') THEN
        ALTER TABLE public.content_items ADD COLUMN track_tags JSONB DEFAULT '[]';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON public.content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_published ON public.content_items(published);

-- 3. site_settings TABLE
-- Robust creation for site_settings which has multiple versions in the codebase
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'site_settings' AND schemaname = 'public') THEN
        CREATE TABLE public.site_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value JSONB,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    ELSE
        -- Ensure compatible column names exist if table exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='setting_key') THEN
            ALTER TABLE public.site_settings ADD COLUMN setting_key VARCHAR(255) UNIQUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='setting_value') THEN
            ALTER TABLE public.site_settings ADD COLUMN setting_value JSONB;
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);

-- Ensure stories_library exists (Required for interactive stories and AI features)
CREATE TABLE IF NOT EXISTS public.stories_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tradition TEXT,
    reading_level TEXT,
    island_code TEXT,
    age_track TEXT,
    summary TEXT,
    cover_image_url TEXT,
    xp_reward INTEGER DEFAULT 100,
    estimated_reading_time_minutes INTEGER DEFAULT 5,
    content_json JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for stories_library (Public Read)
ALTER TABLE public.stories_library ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stories_library' AND policyname = 'stories_library_public_read') THEN
        CREATE POLICY "stories_library_public_read" ON public.stories_library FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Final Grants
GRANT ALL ON public.blog_posts TO service_role;
GRANT ALL ON public.content_items TO service_role;
GRANT ALL ON public.site_settings TO service_role;
GRANT ALL ON public.stories_library TO service_role;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT ON public.content_items TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.stories_library TO anon, authenticated;

-- Notify Supabase to reload schema
NOTIFY pgrst, 'reload schema';
