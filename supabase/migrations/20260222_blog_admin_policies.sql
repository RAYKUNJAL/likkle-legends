-- Blog Admin Policies Migration (2026-02-22)
-- Enables the blog admin UI by adding admin write policies on top of the
-- existing 20240217_blog_infrastructure.sql read policies.

-- Ensure tables exist (idempotent)
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    category UUID REFERENCES public.blog_categories(id),
    tags TEXT[],
    author_name TEXT DEFAULT 'Likkle Legends',
    author_avatar_url TEXT,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    ai_model TEXT,
    view_count INTEGER DEFAULT 0,
    read_time_minutes INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS (idempotent)
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read policies (idempotent, drop first)
DROP POLICY IF EXISTS "Allow public read for categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Allow public read for published posts" ON public.blog_posts;

CREATE POLICY "Allow public read for categories" ON public.blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read for published posts" ON public.blog_posts
    FOR SELECT USING (status = 'published');

-- Admin write policies
DROP POLICY IF EXISTS "Admins can manage blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Admins can manage blog categories" ON public.blog_categories
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR
        auth.jwt() ->> 'email' LIKE '%admin@%' OR
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    );

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR
        auth.jwt() ->> 'email' LIKE '%admin@%' OR
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    );

-- Grants
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_categories TO service_role;
GRANT ALL ON public.blog_posts TO service_role;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER tr_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.set_blog_post_updated_at();

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
