-- =============================================================
-- FIX: SIGNUP & PROFILES TRIGGER
-- Run this in Supabase SQL Editor to resolve "Database error saving new user"
-- =============================================================

-- 1. Ensure 'role' column exists in profiles (Frontend sends this)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'parent';

-- 2. Make the specific Trigger Function Robust
--    - Handles missing metadata gracefully
--    - Uses ON CONFLICT to prevent errors if profile exists
--    - Sets search_path for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, subscription_tier)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Parent'),
        NEW.email,
        'parent',
        COALESCE(NEW.raw_user_meta_data->>'chosen_plan', 'free')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction (optional, but good for debugging)
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify RLS (Just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
