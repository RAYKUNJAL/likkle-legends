-- MASTER DATABASE FIX SCRIPT
-- Resolves Infinite Recursion errors on both 'profiles' and 'blog_posts' tables.

-- 1. Create secure admin check function (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix PROFILES Policies (Drop recursive ones, add simple ones)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- 3. Fix BLOG_POSTS Policies (Use is_admin function)
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;

CREATE POLICY "Admins can manage posts" ON blog_posts
FOR ALL
USING ( is_admin() );

-- 4. Fix CATEGORIES Policies
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;

CREATE POLICY "Admins can manage categories" ON blog_categories
FOR ALL
USING ( is_admin() );
