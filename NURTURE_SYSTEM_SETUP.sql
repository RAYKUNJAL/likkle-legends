-- 1. Create table to track sent emails (prevents duplicates)
CREATE TABLE IF NOT EXISTS public.subscription_nurture (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  UNIQUE(user_id, email_type)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_nurture_type ON public.subscription_nurture(email_type);
CREATE INDEX IF NOT EXISTS idx_nurture_user ON public.subscription_nurture(user_id);

-- 3. RLS
ALTER TABLE public.subscription_nurture ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscription_nurture'
      AND policyname = 'Service role only access'
  ) THEN
    EXECUTE 'DROP POLICY "Service role only access" ON public.subscription_nurture';
  END IF;

  EXECUTE $pol$
    CREATE POLICY "Service role only access"
    ON public.subscription_nurture
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)
  $pol$;
END$$;

-- 4. Analytics Settings (Initial Seed)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.site_settings (key, value)
VALUES (
  'analytics',
  jsonb_build_object(
    'facebook_pixel_id', 'YOUR_PIXEL_ID',
    'google_analytics_id', 'G-XXXXXXXXXX',
    'tiktok_pixel_id', 'TIKTOK_ID',
    'meta_verification_code', 'VERIFICATION_STRING'
  )
)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.subscription_nurture IS 'Tracks automated commercial emails to prevent spam and duplicates.';
