-- =============================================================
-- MUSIC STORE & CUSTOM ORDERS SCHEMA
-- Supports: Pay-per-download, Bundles, Custom Song Requests
-- =============================================================

-- 1. TRACK CONTENT PURCHASES (Songs & Bundles)
CREATE TABLE IF NOT EXISTS public.purchased_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id) NOT NULL,
  content_type TEXT NOT NULL, -- 'song', 'bundle'
  content_id UUID NOT NULL,   -- references public.songs(id) or public.product_bundles(id)
  transaction_id TEXT,        -- PayPal Order ID
  amount_paid DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. PRODUCT BUNDLES (Collections of songs)
CREATE TABLE IF NOT EXISTS public.product_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  content_ids UUID[],         -- Array of song IDs included
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOM SONG REQUESTS
CREATE TABLE IF NOT EXISTS public.custom_song_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id), -- Nullable if guest (though we prefer login)
  contact_email TEXT NOT NULL,
  child_name TEXT NOT NULL,
  occasion TEXT,               -- Birthday, Graduation, etc.
  details TEXT NOT NULL,       -- Description of request
  status TEXT DEFAULT 'pending',        -- pending, paid, in_progress, completed, delivered
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid
  paypal_order_id TEXT,
  amount_paid DECIMAL(10, 2),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Purchased Content
ALTER TABLE public.purchased_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own purchases"
ON public.purchased_content
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Service Role manages purchases"
ON public.purchased_content
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Product Bundles
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone views active bundles"
ON public.product_bundles
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins manage bundles"
ON public.product_bundles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_admin = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = (SELECT auth.uid())
  )
  OR (
    (auth.jwt() ->> 'email') IN ('raykunjal@gmail.com', 'admin@likklelegends.com')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_admin = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = (SELECT auth.uid())
  )
  OR (
    (auth.jwt() ->> 'email') IN ('raykunjal@gmail.com', 'admin@likklelegends.com')
  )
);

-- Custom Song Requests
ALTER TABLE public.custom_song_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own requests"
ON public.custom_song_requests
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins view all requests"
ON public.custom_song_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_admin = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = (SELECT auth.uid())
  )
);

CREATE POLICY "Service Role manages requests"
ON public.custom_song_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to create requests (initially unpaid)
CREATE POLICY "Users create requests"
ON public.custom_song_requests
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);