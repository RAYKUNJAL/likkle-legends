-- Parent music download licenses and bundle credit ledger.
-- Rows are written by the service role only after a verified PayPal capture.

CREATE TABLE IF NOT EXISTS public.account_entitlements (
    user_id UUID NOT NULL,
    entitlement_key TEXT NOT NULL,
    sku TEXT NOT NULL,
    source_order_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, entitlement_key)
);

CREATE TABLE IF NOT EXISTS public.music_credit_ledger (
    source_order_id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.account_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_credit_ledger ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users read own entitlements" ON public.account_entitlements
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users read own credit ledger" ON public.music_credit_ledger
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.account_entitlements TO authenticated;
GRANT SELECT ON public.music_credit_ledger TO authenticated;
GRANT ALL ON public.account_entitlements TO service_role;
GRANT ALL ON public.music_credit_ledger TO service_role;
