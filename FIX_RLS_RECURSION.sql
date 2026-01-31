-- Fix Infinite Recursion in Profiles RLS
-- The "Admins manage everything" policy was querying profiles table, triggering itself.
-- 1. Create a secure function to check admin status without triggering RLS
-- We use SECURITY DEFINER to run as owner (bypass RLS)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$ BEGIN -- Check admin_users table first (cleanest)
    IF EXISTS (
        SELECT 1
        FROM admin_users
        WHERE id = auth.uid()
    ) THEN RETURN TRUE;
END IF;
-- Check profiles table (legacy/fallback)
-- Since this is SECURITY DEFINER, it bypasses the RLS on profiles to read the row
IF EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
        AND is_admin = true
) THEN RETURN TRUE;
END IF;
RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. Update the Profiles Policy to use the function
DROP POLICY IF EXISTS "Admins manage everything" ON profiles;
CREATE POLICY "Admins manage everything" ON profiles FOR ALL USING (is_admin());
-- 3. Update other Admin policies to use this function for consistency/performance
DROP POLICY IF EXISTS "Admins manage promoters" ON promoters;
CREATE POLICY "Admins manage promoters" ON promoters FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Admins view referal clicks" ON referral_clicks;
CREATE POLICY "Admins view referal clicks" ON referral_clicks FOR
SELECT USING (is_admin());