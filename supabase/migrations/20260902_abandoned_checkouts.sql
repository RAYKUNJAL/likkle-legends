-- Abandoned checkout recovery table.
-- The CRO upgrade (39fc133a) ships capture + reminder routes that query
-- , but the table was never created - the funnel was
-- dead end-to-end (inserts 500, reminder cron 500). This migration creates it.
-- Table is managed via service-role key (supabaseAdmin), so RLS stays disabled
-- like the sibling  table it replaces.

CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT NOT NULL,
    first_name          TEXT,
    country             TEXT,
    cart_value          NUMERIC,
    plan                TEXT,
    source              TEXT DEFAULT 'offer_checkout',
    status              TEXT NOT NULL DEFAULT 'pending',  -- pending | reminded | recovered
    trigger_reminder_at TIMESTAMPTZ NOT NULL,
    reminder_sent_at    TIMESTAMPTZ,
    recovered           BOOLEAN NOT NULL DEFAULT false,
    reminder_count      INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Upsert-by-email lookups (capture route: latest row for an email).
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_email
    ON public.abandoned_checkouts (email, created_at DESC);

-- Cron scan: due, pending, never-reminded rows.
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_due
    ON public.abandoned_checkouts (status, trigger_reminder_at)
    WHERE reminder_sent_at IS NULL;
