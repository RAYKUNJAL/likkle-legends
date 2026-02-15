-- Align gamification tables with professional service expectations v3.1.0

-- 1. Activities Table
-- Rename user_id to profile_id for consistency with other professional tables
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_id') THEN
        ALTER TABLE public.activities RENAME COLUMN user_id TO profile_id;
    END IF;
END $$;

-- Add missing columns
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS content_id UUID;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- 2. Badge Earnings Table
-- Rename user_id to profile_id
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badge_earnings' AND column_name = 'user_id') THEN
        ALTER TABLE public.badge_earnings RENAME COLUMN user_id TO profile_id;
    END IF;
END $$;

-- Make profile_id optional if we want to rely on child_id
ALTER TABLE public.badge_earnings ALTER COLUMN profile_id DROP NOT NULL;

-- 3. Profiles View (Ensure it's up to date)
-- Handled by 20240214_professional_content.sql, but let's re-verify or refresh if needed.
-- Already using first_name as full_name.

-- 4. RLS for Activities
-- Drop old policies and add new ones using profile_id
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;

CREATE POLICY "Users can insert their own activities"
ON public.activities FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view their own activities"
ON public.activities FOR SELECT
USING (auth.uid() = profile_id);

-- 5. RLS for Badge Earnings
DROP POLICY IF EXISTS "Users can view their own badges" ON public.badge_earnings;

CREATE POLICY "Users can view their own badges"
ON public.badge_earnings FOR SELECT
USING (auth.uid() = profile_id);

-- 6. Grants
GRANT ALL ON public.activities TO authenticated;
GRANT ALL ON public.badge_earnings TO authenticated;
