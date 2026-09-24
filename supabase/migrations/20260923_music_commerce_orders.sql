-- Parent music checkout history.
-- created → paypal_pending → captured → entitled
-- Service role writes. Parents can read their own rows.

CREATE TABLE IF NOT EXISTS public.music_commerce_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sku TEXT NOT NULL,
    track_id TEXT,
    request_id UUID,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'created',
    paypal_order_id TEXT UNIQUE,
    entitlement_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT music_commerce_orders_status_check CHECK (
        status IN ('created', 'paypal_pending', 'captured', 'entitled', 'failed')
    )
);

CREATE INDEX IF NOT EXISTS music_commerce_orders_user_idx
    ON public.music_commerce_orders (user_id, created_at DESC);

ALTER TABLE public.music_commerce_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users read own music orders" ON public.music_commerce_orders
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.music_commerce_orders TO authenticated;
GRANT ALL ON public.music_commerce_orders TO service_role;
