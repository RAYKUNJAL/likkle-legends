-- =============================================
-- REPAIR ADMIN CENTER: SCHEMA & SECURITY ALIGNMENT
-- =============================================
-- 1. ENSURE CORE ADMIN TABLES
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'editor',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. ALIGN CHARACTERS SCHEMA
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    tagline TEXT,
    description TEXT,
    personality_traits JSONB DEFAULT '[]',
    image_url TEXT,
    model_3d_url TEXT,
    voice_id TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. ALIGN SONGS SCHEMA
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS artist TEXT DEFAULT 'Likkle Legends';
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS age_track TEXT DEFAULT 'all';
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS tier_required TEXT DEFAULT 'starter_mailer';
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'nursery';
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS island_origin TEXT;
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;
-- 4. ALIGN STORYBOOKS SCHEMA
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS audio_narration_url TEXT;
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS character_id UUID REFERENCES public.characters(id);
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS age_track TEXT DEFAULT 'all';
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS tier_required TEXT DEFAULT 'legends_plus';
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS island_theme TEXT;
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER;
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1;
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
-- 5. ENSURE & ALIGN VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    age_track TEXT DEFAULT 'all',
    tier_required TEXT DEFAULT 'legends_plus',
    category TEXT DEFAULT 'lesson',
    island_theme TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 6. ENSURE & ALIGN PRINTABLES TABLE
CREATE TABLE IF NOT EXISTS public.printables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    preview_url TEXT,
    category TEXT DEFAULT 'coloring',
    tier_required TEXT DEFAULT 'starter_mailer',
    ar_marker_id TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 7. ENSURE & ALIGN GAMES TABLE
CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    game_url TEXT,
    game_type TEXT DEFAULT 'trivia',
    category TEXT DEFAULT 'educational',
    tier_required TEXT DEFAULT 'legends_plus',
    play_count INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    estimated_time TEXT DEFAULT '5-10 min',
    age_range TEXT DEFAULT '4-8',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    game_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 8. IMPLEMENT ROBUST RLS FOR ADMINS
DO $$
DECLARE t TEXT;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'characters',
        'songs',
        'storybooks',
        'videos',
        'printables',
        'games',
        'announcements'
    ) LOOP EXECUTE format(
        'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
        t
    );
EXECUTE format(
    'DROP POLICY IF EXISTS "Admins manage %I" ON public.%I',
    t,
    t
);
EXECUTE format(
    'CREATE POLICY "Admins manage %I" ON public.%I FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin'')
            OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
        )',
    t,
    t
);
EXECUTE format(
    'DROP POLICY IF EXISTS "Public read %I" ON public.%I',
    t,
    t
);
EXECUTE format(
    'CREATE POLICY "Public read %I" ON public.%I FOR SELECT USING (true)',
    t,
    t
);
END LOOP;
END $$;
-- 9. STORAGE PERMISSIONS (ADMIN UPLOADS)
-- We use standard CREATE POLICY syntax on storage.objects
-- Allow public read access to content buckets
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR
SELECT USING (
        bucket_id IN (
            'songs',
            'videos',
            'printables',
            'storybooks',
            'characters',
            'avatars'
        )
    );
-- Allow admins to upload to content buckets
DROP POLICY IF EXISTS "Admin Uploads" ON storage.objects;
CREATE POLICY "Admin Uploads" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id IN (
            'songs',
            'videos',
            'printables',
            'storybooks',
            'characters',
            'avatars'
        )
        AND (
            EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
            )
            OR EXISTS (
                SELECT 1
                FROM public.admin_users
                WHERE admin_users.id = auth.uid()
            )
        )
    );
-- Allow admins to update/delete their own uploads (or anything in these buckets)
DROP POLICY IF EXISTS "Admin Management" ON storage.objects;
CREATE POLICY "Admin Management" ON storage.objects FOR ALL USING (
    bucket_id IN (
        'songs',
        'videos',
        'printables',
        'storybooks',
        'characters',
        'avatars'
    )
    AND (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
        OR EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    )
);