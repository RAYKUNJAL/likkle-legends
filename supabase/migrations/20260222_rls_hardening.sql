/* 
  RLS Hardening & Cleanup Migration
  Target: Commercial Launch Readiness
*/

-- 0. BASELINE SYNC
-- Ensure critical shared tables exist so policies don't fail due to missing relations.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id TEXT,
    status TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1. IDENTITY & COPPA SCHEMA FIXES

-- These columns are required by UserContext and profiles view.
-- We check for both 'users' and 'profiles' to be resilient to different schema versions.

DO $$ 
BEGIN
    -- Try to add to users table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'users') THEN
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_coppa_designated_parent BOOLEAN DEFAULT false;
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ;
    END IF;

    -- Try to add to profiles table (if it exists and is NOT a view)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'profiles') 
       AND NOT EXISTS (SELECT FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'profiles')
       AND NOT EXISTS (SELECT FROM pg_views WHERE schemaname = 'public' AND viewname = 'profiles') THEN
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_coppa_designated_parent BOOLEAN DEFAULT false;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ;
    END IF;
END $$;


-- 2. WAITLIST
-- 2. WAITLIST
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'waitlist') THEN
        ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public inserts to waitlist" ON public.waitlist;
        DROP POLICY IF EXISTS "Admins can view waitlist" ON public.waitlist;
        
        CREATE POLICY "Allow public inserts to waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
        CREATE POLICY "Admins can view waitlist" ON public.waitlist FOR SELECT USING (
            auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
            auth.jwt() ->> 'email' LIKE '%admin@%' OR
            EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
        );
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. SITE_SETTINGS
-- 3. SITE_SETTINGS
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_settings') THEN
        ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
        DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;

        CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
        CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (
            auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
            auth.jwt() ->> 'email' LIKE '%admin@%' OR
            EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
        );
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. ADMIN_USERS
-- 4. ADMIN_USERS
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
        ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
        
        CREATE POLICY "Admins can view admin list" ON public.admin_users FOR SELECT USING (
            auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
            auth.jwt() ->> 'email' LIKE '%admin@%' OR
            (auth.uid() = id)
        );
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. ANNOUNCEMENTS
-- 5. ANNOUNCEMENTS
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'announcements') THEN
        ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view active announcements" ON public.announcements;
        DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;

        CREATE POLICY "Public can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);
        CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
            auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
            auth.jwt() ->> 'email' LIKE '%admin@%' OR
            EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
        );
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. OTP_CODES
-- 6. OTP_CODES
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'otp_codes') THEN
        ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Admins can view otp codes" ON public.otp_codes;
        
        CREATE POLICY "Admins can view otp codes" ON public.otp_codes FOR SELECT USING (
            auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
            auth.jwt() ->> 'email' LIKE '%admin@%' OR
            EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
        );
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. CUSTOM_SONG_REQUESTS
-- 7. CUSTOM_SONG_REQUESTS
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'custom_song_requests') THEN
        ALTER TABLE public.custom_song_requests ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own custom song requests" ON public.custom_song_requests;
        DROP POLICY IF EXISTS "Users can insert own custom song requests" ON public.custom_song_requests;
        DROP POLICY IF EXISTS "Admins can manage all custom song requests" ON public.custom_song_requests;

        CREATE POLICY "Users can view own custom song requests" ON public.custom_song_requests FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own custom song requests" ON public.custom_song_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Admins can manage all custom song requests" ON public.custom_song_requests FOR ALL USING (
            auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR 
            auth.jwt() ->> 'email' LIKE '%admin@%' OR
            EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
        );
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Updatable Profiles View Infrastructure
-- This ensures that frontend updates to the 'profiles' view (which has joins) 
-- are correctly propagated to the underlying 'users' and 'subscriptions' tables.

-- 8. Updatable Profiles View Infrastructure
-- This ensures that frontend updates to the 'profiles' view (which has joins) 
-- are correctly propagated to the underlying 'users' and 'subscriptions' tables.

DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_views WHERE schemaname = 'public' AND viewname = 'profiles') THEN
        CREATE OR REPLACE FUNCTION public.handle_profile_update()
        RETURNS TRIGGER AS $inner$
        BEGIN
            -- 1. Update public.users (if it exists)
            IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
                UPDATE public.users SET
                    first_name = COALESCE(NEW.full_name, NEW.first_name, first_name),
                    whatsapp_number = COALESCE(NEW.whatsapp_number, whatsapp_number),
                    origin_island = COALESCE(NEW.origin_island, origin_island),
                    preferred_island_code = COALESCE(NEW.preferred_island_code, preferred_island_code),
                    location_type = COALESCE(NEW.location_type, location_type),
                    country_city = COALESCE(NEW.country_city, country_city),
                    consent_marketing = COALESCE(NEW.marketing_opt_in, consent_marketing),
                    is_coppa_designated_parent = COALESCE(NEW.is_coppa_designated_parent, is_coppa_designated_parent),
                    age_verified_at = COALESCE(NEW.age_verified_at, age_verified_at)
                WHERE id = OLD.id;
            -- Fallback to profiles table if users table is missing
            ELSIF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
                 UPDATE public.profiles SET
                    first_name = COALESCE(NEW.full_name, first_name),
                    whatsapp_number = COALESCE(NEW.whatsapp_number, whatsapp_number),
                    is_coppa_designated_parent = COALESCE(NEW.is_coppa_designated_parent, is_coppa_designated_parent),
                    age_verified_at = COALESCE(NEW.age_verified_at, age_verified_at)
                WHERE id = OLD.id;
            END IF;

            -- 2. Update subscription if tier/status is provided
            IF (NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier OR 
               NEW.subscription_status IS DISTINCT FROM OLD.subscription_status)
               AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
                
                -- Logic: Update the most recent subscription for this user
                UPDATE public.subscriptions SET
                    plan_id = COALESCE(NEW.subscription_tier, plan_id),
                    status = COALESCE(NEW.subscription_status::public.subscription_status, status),
                    current_period_end = COALESCE(NEW.current_period_end, current_period_end)
                WHERE id = (
                    SELECT id FROM public.subscriptions 
                    WHERE user_id = OLD.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                );
            END IF;

            RETURN NEW;
        END;
        $inner$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS tr_update_profiles_view ON public.profiles;
        CREATE TRIGGER tr_update_profiles_view
        INSTEAD OF UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();
    END IF;
END $$;

-- 9. Final Grants
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

GRANT ALL ON public.waitlist TO authenticated, service_role;
GRANT ALL ON public.otp_codes TO service_role;
GRANT SELECT ON public.otp_codes TO authenticated;

-- Ensure users can update their own data in the base table if they bypass the view
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        DROP POLICY IF EXISTS "Users can update own user data" ON public.users;
        CREATE POLICY "Users can update own user data" ON public.users FOR UPDATE USING (auth.uid() = id);
    END IF;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

