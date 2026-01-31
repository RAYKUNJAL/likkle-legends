-- SCHEMA_FIX_CONTENT.sql
-- Ensure all content tables have the required columns for AI generation/publishing
-- 1. FIX PRINTABLES
ALTER TABLE public.printables
ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS category text,
    ADD COLUMN IF NOT EXISTS tier_required text DEFAULT 'starter_mailer',
    ADD COLUMN IF NOT EXISTS pdf_url text,
    ADD COLUMN IF NOT EXISTS preview_url text,
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
-- 2. FIX VIDEOS
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS category text DEFAULT 'lesson',
    ADD COLUMN IF NOT EXISTS island_theme text,
    ADD COLUMN IF NOT EXISTS age_track text,
    ADD COLUMN IF NOT EXISTS duration_seconds integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tier_required text DEFAULT 'legends_plus',
    ADD COLUMN IF NOT EXISTS video_url text,
    ADD COLUMN IF NOT EXISTS thumbnail_url text,
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
-- 3. FIX GAMES (if needed)
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS game_type text,
    ADD COLUMN IF NOT EXISTS estimated_time text,
    ADD COLUMN IF NOT EXISTS game_config jsonb DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
-- 4. FIX STORYBOOKS (Ensure all expected columns exist)
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS reading_time_minutes integer DEFAULT 5,
    ADD COLUMN IF NOT EXISTS word_count integer,
    ADD COLUMN IF NOT EXISTS difficulty_level text,
    ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tier_required text DEFAULT 'free';
-- 5. FIX SONGS
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS artist text DEFAULT 'Likkle Legends',
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS thumbnail_url text,
    ADD COLUMN IF NOT EXISTS duration_seconds integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS island_origin text,
    ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS audio_url text;