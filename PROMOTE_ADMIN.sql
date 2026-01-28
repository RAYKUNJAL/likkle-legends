-- PROMOTE USER TO SUPER ADMIN
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- 1. Add entry to admin_users table (joining to auth.users for ID)
-- This follows Option A: Avoids duplication of the email field
INSERT INTO public.admin_users (id, role)
SELECT id,
    'super_admin'
FROM auth.users
WHERE email = 'raykunjal@gmail.com' ON CONFLICT (id) DO
UPDATE
SET role = EXCLUDED.role;
-- 2. Update profiles table to ensure is_admin flag is synced
-- This enables UI features that check profiles.is_admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'raykunjal@gmail.com';
-- 3. Verification
SELECT p.full_name,
    p.email,
    a.role
FROM public.profiles p
    JOIN public.admin_users a ON p.id = a.id
WHERE p.email = 'raykunjal@gmail.com';