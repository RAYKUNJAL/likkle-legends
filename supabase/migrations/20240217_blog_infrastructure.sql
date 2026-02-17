
-- Blog categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    author_name TEXT,
    author_avatar_url TEXT,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    ai_model TEXT,
    view_count INTEGER DEFAULT 0,
    read_time_minutes INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Allow public read for categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read for published posts" ON public.blog_posts FOR SELECT USING (status = 'published');

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE blog_posts
    SET view_count = view_count + 1
    WHERE slug = post_slug;
END;
$$;
