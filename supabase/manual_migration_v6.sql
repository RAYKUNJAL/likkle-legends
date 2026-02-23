-- LIKKLE LEGENDS: CREATE MISSING TABLES FOR LAUNCH (2026-02-22)
-- This script creates blog_posts, content_items, and site_settings tables

-- 1. CREATE blog_posts TABLE
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

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- 2. CREATE content_items TABLE
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    island_code VARCHAR(50),
    age_track VARCHAR(50),
    published BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON public.content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_published ON public.content_items(published);

-- 3. CREATE site_settings TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(setting_key);

-- 4. GRANTS
GRANT SELECT ON public.blog_posts TO authenticated, anon;
GRANT SELECT ON public.content_items TO authenticated, anon;
GRANT SELECT ON public.site_settings TO authenticated, anon;
GRANT ALL ON public.blog_posts TO service_role;
GRANT ALL ON public.content_items TO service_role;
GRANT ALL ON public.site_settings TO service_role;

-- 5. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
