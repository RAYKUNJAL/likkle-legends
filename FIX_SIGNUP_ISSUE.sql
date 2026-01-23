-- =============================================================
-- FIX: SIGNUP & PROFILES TRIGGER
-- Run this ENTIRE script in Supabase SQL Editor to resolve:
-- "Database error saving new user"
-- 
-- Last Updated: 2026-01-22
-- =============================================================

-- STEP 1: Ensure profiles table has all required columns
-- -------------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'parent';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_name TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- STEP 2: Drop old INSERT-only policy and add UPSERT support
-- -----------------------------------------------------------
-- Allow users to INSERT their own profile (needed for upsert from client)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- STEP 3: Create a robust trigger function that won't fail signups
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        role, 
        subscription_tier,
        subscription_status
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Parent'),
        NEW.email,
        'parent',
        COALESCE(NEW.raw_user_meta_data->>'chosen_plan', 'free'),
        'inactive'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = NOW();
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log the error but DON'T fail the user signup
    -- The profile can be created later via the client-side upsert
    RAISE WARNING 'Profile creation in trigger failed for user %: % (this is non-fatal)', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- STEP 4: Re-attach the trigger to auth.users
-- --------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 5: Ensure RLS policies are correct
-- ----------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- STEP 6: Verify the fix
-- ----------------------
-- Run this to confirm the trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- =============================================================
-- SUCCESS! The signup flow should now work.
-- If you still see errors, check the Supabase Logs for details.
-- =============================================================
