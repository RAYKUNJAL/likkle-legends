-- Ensure pgcrypto is enabled for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create videos table (Aligned with supabase_schema.sql)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    -- New columns from schema
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'legends_plus',
    category TEXT DEFAULT 'lesson', -- 'lesson', 'song', 'story', 'activity'
    island_theme TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policies

-- Public read access (for all users, including anonymous)
-- We allow reading all active videos. The application layer handles hiding URL/blocking access if tier not met.
DROP POLICY IF EXISTS "Public read active videos" ON videos;
CREATE POLICY "Public read active videos" ON videos
    FOR SELECT
    USING (is_active = true);

-- Admin Management Policy
-- Uses the 'admin_users' table as defined in supabase_schema.sql
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
CREATE POLICY "Admins can manage videos" ON videos
    FOR ALL
    USING (
        auth.uid() IN (SELECT id FROM admin_users)
    );

-- Seed Data (using ON CONFLICT to avoid duplicates if run multiple times)
-- We assume title or ID is unique? The table definition doesn't enforce unique title. 
-- We will just insert if table is empty or try to match on a generated ID if we had one.
-- Since we don't have unique constraints on title, we'll just insert these specific rows only if the table is empty to be safe,
-- OR we can just use a DO block. Let's use a simple check.

INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, tier_required, category, display_order)
SELECT 'Welcome to Likkle Legends', 'Meet the team and start your adventure!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?w=800', 180, 'free', 'lesson', 1
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Welcome to Likkle Legends');

INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, tier_required, category, display_order)
SELECT 'Steel Pan History', 'Learn about the invention of the Steel Pan in Trinidad.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1542120526-89a7039730ab?w=800', 240, 'free', 'lesson', 2
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Steel Pan History');

INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, tier_required, category, display_order)
SELECT 'How to Dance Calypso', 'Get moving with Tanty Spice!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800', 300, 'starter_mailer', 'lesson', 3
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'How to Dance Calypso');
