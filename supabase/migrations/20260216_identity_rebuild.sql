-- 1. Redefine profiles view to include all required fields for UserContext
DROP VIEW IF EXISTS public.profiles CASCADE;
CREATE VIEW public.profiles AS 
SELECT 
    u.id,
    u.created_at,
    u.role,
    u.first_name,
    u.first_name as full_name,
    u.email,
    u.whatsapp_number,
    u.origin_island,
    u.preferred_island_code,
    u.location_type,
    u.country_city,
    u.consent_marketing as marketing_opt_in,
    u.is_coppa_designated_parent,
    u.age_verified_at,
    u.preferred_channel,
    (u.role = 'admin' OR EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = u.id)) as is_admin,
    s.plan_id as subscription_tier,
    COALESCE(s.status::text, 'free') as subscription_status,
    s.current_period_end
FROM public.users u
LEFT JOIN (
    SELECT DISTINCT ON (user_id) 
        user_id, 
        plan_id, 
        status, 
        current_period_end
    FROM public.subscriptions
    ORDER BY user_id, created_at DESC
) s ON u.id = s.user_id;

-- 2. Create WhatsApp OTP Table
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_codes(phone);

-- 3. Grants
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO service_role;
GRANT ALL ON public.otp_codes TO service_role;
GRANT ALL ON public.otp_codes TO authenticated; -- For verification flow
