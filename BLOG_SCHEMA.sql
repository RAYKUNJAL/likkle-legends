-- =============================================================
-- BLOG SYSTEM SCHEMA FOR SEO
-- Run this in Supabase SQL Editor
-- =============================================================

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Content
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT, -- Short description for cards/meta
    content TEXT NOT NULL, -- Full markdown/HTML content
    featured_image_url TEXT,
    
    -- SEO
    meta_title TEXT, -- Override for SEO title
    meta_description TEXT,
    keywords TEXT[], -- Array of keywords
    canonical_url TEXT,
    
    -- Categorization
    category TEXT NOT NULL DEFAULT 'culture', -- 'culture', 'parenting', 'education', 'activities', 'recipes', 'stories'
    tags TEXT[] DEFAULT '{}',
    
    -- Author
    author_name TEXT DEFAULT 'Likkle Legends Team',
    author_avatar_url TEXT,
    
    -- Publishing
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'archived'
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    
    -- AI Generation Metadata
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT, -- The prompt used to generate
    ai_model TEXT, -- Which model was used
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    read_time_minutes INTEGER DEFAULT 5,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Categories (for filtering and navigation)
CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Emoji or icon name
    color TEXT, -- Hex color for styling
    display_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0
);

-- Insert default categories
INSERT INTO blog_categories (id, name, description, icon, color, display_order) VALUES
    ('culture', 'Caribbean Culture', 'Explore the rich traditions and heritage of the Caribbean islands', '🏝️', '#10B981', 1),
    ('parenting', 'Diaspora Parenting', 'Tips for raising Caribbean children abroad', '👨‍👩‍👧', '#8B5CF6', 2),
    ('education', 'Kid Education', 'Learning resources and educational content', '📚', '#3B82F6', 3),
    ('activities', 'Fun Activities', 'Crafts, games, and hands-on learning', '🎨', '#F59E0B', 4),
    ('recipes', 'Family Recipes', 'Kid-friendly Caribbean dishes', '🍲', '#EF4444', 5),
    ('stories', 'Heritage Stories', 'Folklore, legends, and bedtime tales', '📖', '#EC4899', 6),
    ('patois', 'Patois Learning', 'Language lessons and vocabulary', '🗣️', '#06B6D4', 7)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Public read for published posts
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts" ON blog_posts 
FOR SELECT USING (status = 'published');

-- Public read for categories
DROP POLICY IF EXISTS "Public can read categories" ON blog_categories;
CREATE POLICY "Public can read categories" ON blog_categories 
FOR SELECT USING (true);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;
CREATE POLICY "Admins can manage posts" ON blog_posts 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- TEMP: Allow public inserts (for API generation)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_posts;
CREATE POLICY "Enable insert for API" ON blog_posts FOR INSERT WITH CHECK (true);


-- Auto-update timestamps
DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at 
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE blog_posts 
    SET view_count = view_count + 1 
    WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- =============================================================
-- SUCCESS! Run this in Supabase SQL Editor
-- =============================================================
