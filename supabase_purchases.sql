-- =========================================================
-- Digital Possessions / Products Table
-- Tracks one-time digital purchases (coloring packs, special stories)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.digital_possessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL, -- e.g. 'digital_activity_super_pack', 'heritage_dna_story'
    order_id TEXT, -- PayPal subscription or order id
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- RLS
ALTER TABLE public.digital_possessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own digital possessions" 
ON public.digital_possessions FOR SELECT 
USING (user_id = auth.uid());

-- Admin can see all (for fulfillment)
CREATE POLICY "Admins can view all digital possessions" 
ON public.digital_possessions FOR ALL 
TO service_role
USING (true);

-- =========================================================
-- Indexing for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_digital_possessions_user ON public.digital_possessions(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_possessions_product ON public.digital_possessions(product_id);
