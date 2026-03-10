-- =============================================================================
-- LAUNCH FIX: Ensure children table has the correct schema
-- Run this in Supabase SQL Editor → then click "Reload Schema" in API settings
-- =============================================================================

-- Add parent_id if it doesn't exist (maps from old primary_user_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.children ADD COLUMN parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    -- Backfill from old column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'primary_user_id'
    ) THEN
      UPDATE public.children SET parent_id = primary_user_id WHERE parent_id IS NULL;
    END IF;
  END IF;
END $$;

-- Add first_name if it doesn't exist (maps from old 'name')
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.children ADD COLUMN first_name TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'name'
    ) THEN
      UPDATE public.children SET first_name = name WHERE first_name IS NULL;
    END IF;
  END IF;
END $$;

-- Add remaining columns used by the app
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='age') THEN
    ALTER TABLE public.children ADD COLUMN age INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='age_track') THEN
    ALTER TABLE public.children ADD COLUMN age_track TEXT DEFAULT 'all';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='primary_island') THEN
    ALTER TABLE public.children ADD COLUMN primary_island TEXT DEFAULT 'Trinidad & Tobago';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='secondary_island') THEN
    ALTER TABLE public.children ADD COLUMN secondary_island TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='favorite_character') THEN
    ALTER TABLE public.children ADD COLUMN favorite_character TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='avatar_id') THEN
    ALTER TABLE public.children ADD COLUMN avatar_id TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='avatar_url') THEN
    ALTER TABLE public.children ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='total_xp') THEN
    ALTER TABLE public.children ADD COLUMN total_xp INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='current_level') THEN
    ALTER TABLE public.children ADD COLUMN current_level INTEGER DEFAULT 1;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='current_streak') THEN
    ALTER TABLE public.children ADD COLUMN current_streak INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='longest_streak') THEN
    ALTER TABLE public.children ADD COLUMN longest_streak INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='stories_completed') THEN
    ALTER TABLE public.children ADD COLUMN stories_completed INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='songs_listened') THEN
    ALTER TABLE public.children ADD COLUMN songs_listened INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='missions_completed') THEN
    ALTER TABLE public.children ADD COLUMN missions_completed INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='earned_badges') THEN
    ALTER TABLE public.children ADD COLUMN earned_badges TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='cultural_milestones') THEN
    ALTER TABLE public.children ADD COLUMN cultural_milestones TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='patois_words_learned') THEN
    ALTER TABLE public.children ADD COLUMN patois_words_learned TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='last_activity_date') THEN
    ALTER TABLE public.children ADD COLUMN last_activity_date TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='metadata') THEN
    ALTER TABLE public.children ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='children' AND column_name='updated_at') THEN
    ALTER TABLE public.children ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Drop NOT NULL from the old primary_user_id column — the app now writes parent_id instead.
-- This is the key fix: production DB had primary_user_id NOT NULL which blocked new inserts.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='children' AND column_name='primary_user_id'
  ) THEN
    ALTER TABLE public.children ALTER COLUMN primary_user_id DROP NOT NULL;
  END IF;
END $$;

-- Also drop NOT NULL from old 'name' column if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='children' AND column_name='name'
  ) THEN
    ALTER TABLE public.children ALTER COLUMN name DROP NOT NULL;
  END IF;
END $$;

-- Ensure parent_id is NOT NULL now that it's backfilled
-- (only do this if ALL rows have it)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.children WHERE parent_id IS NULL) THEN
    ALTER TABLE public.children ALTER COLUMN parent_id SET NOT NULL;
  END IF;
END $$;

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);

-- Ensure RLS is enabled
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist with wrong names, recreate correctly
DROP POLICY IF EXISTS "Users can view their own children" ON public.children;
DROP POLICY IF EXISTS "Users can insert their own children" ON public.children;
DROP POLICY IF EXISTS "Users can update their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can insert their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;

CREATE POLICY "Parents can view their own children"
  ON public.children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own children"
  ON public.children FOR DELETE
  USING (auth.uid() = parent_id);

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
