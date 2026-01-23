-- FORCE FIX BLOG PERMISSIONS AND RLS
-- Run this in Supabase SQL Editor

-- 1. Reset RLS on blog_posts
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy polices to be safe
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Enable insert for API" ON blog_posts;
DROP POLICY IF EXISTS "Enable update for API" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;

-- 3. Create Permissive Policies

-- READ: Everyone can read published posts
CREATE POLICY "Public can read published posts" ON blog_posts 
FOR SELECT USING (status = 'published');

-- INSERT: Allow anyone to insert (Temporary for seeing)
CREATE POLICY "Enable insert for API" ON blog_posts 
FOR INSERT WITH CHECK (true);

-- UPDATE: Allow anyone to update (Temporary)
CREATE POLICY "Enable update for API" ON blog_posts 
FOR UPDATE USING (true);

-- 4. Fix Categories as well
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read categories" ON blog_categories;
CREATE POLICY "Public can read categories" ON blog_categories 
FOR SELECT USING (true);

-- 5. Ensure the Initial Categories exist (Idempotent)
INSERT INTO blog_categories (id, name, description, icon, color, display_order) VALUES
    ('culture', 'Caribbean Culture', 'Explore the rich traditions and heritage of the Caribbean islands', '🏝️', '#10B981', 1),
    ('parenting', 'Diaspora Parenting', 'Tips for raising Caribbean children abroad', '👨‍👩‍👧', '#8B5CF6', 2),
    ('education', 'Kid Education', 'Learning resources and educational content', '📚', '#3B82F6', 3),
    ('activities', 'Fun Activities', 'Crafts, games, and hands-on learning', '🎨', '#F59E0B', 4),
    ('recipes', 'Family Recipes', 'Kid-friendly Caribbean dishes', '🍲', '#EF4444', 5),
    ('stories', 'Heritage Stories', 'Folklore, legends, and bedtime tales', '📖', '#EC4899', 6)
ON CONFLICT (id) DO NOTHING;
