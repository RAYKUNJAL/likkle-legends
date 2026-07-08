-- ============================================================================
-- Migration: 20260706_agent_coordination.sql
-- Purpose:  Shared-memory + inter-agent-communication layer in Supabase
--           for the paperclip (control-plane) and goose (execution-plane)
--           self-hosted AI agents to coordinate on running the Next.js site.
--
-- Two tables are created:
--   1. agent_memory   - shared key/value memory store (per agent, unique key)
--   2. agent_messages - durable message queue between agents (pending -> done)
--
-- RLS is enabled and locked to the service_role only. The service role bypasses
-- RLS by default in Supabase (via the postgres role inheritance), so the
-- explicit permissive policy is belt-and-suspenders. anon and authenticated
-- roles get an explicit deny-all via the default "no policy = no access" model;
-- we additionally add a REVOKE on table privileges to be unambiguous.
--
-- This migration is purely additive: it creates new tables/indexes/policies and
-- touches no existing schema.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. agent_memory : shared key/value memory, upsertable per (agent, key)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_memory (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name    text        NOT NULL,
    memory_key    text        NOT NULL,
    memory_value  jsonb       NOT NULL,
    created_at    timestamptz DEFAULT now(),
    updated_at    timestamptz DEFAULT now(),
    UNIQUE (agent_name, memory_key)
);

-- auto-maintain updated_at on row update
CREATE OR REPLACE FUNCTION public.agent_memory_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agent_memory_set_updated_at ON public.agent_memory;
CREATE TRIGGER trg_agent_memory_set_updated_at
    BEFORE UPDATE ON public.agent_memory
    FOR EACH ROW
    EXECUTE FUNCTION public.agent_memory_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_name
    ON public.agent_memory (agent_name);

-- ----------------------------------------------------------------------------
-- 2. agent_messages : durable message queue between agents
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_messages (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent    text        NOT NULL,
    to_agent      text,
    message_type  text        NOT NULL,
    payload       jsonb       NOT NULL DEFAULT '{}'::jsonb,
    status        text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'claimed', 'done', 'failed')),
    created_at    timestamptz DEFAULT now(),
    claimed_at    timestamptz,
    completed_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_status_created_at
    ON public.agent_messages (status, created_at);

-- ----------------------------------------------------------------------------
-- 3. Row Level Security : service_role only
-- ----------------------------------------------------------------------------
ALTER TABLE public.agent_memory   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Belt-and-suspenders explicit permissive policy for service_role.
-- (service_role bypasses RLS already, this just makes intent explicit.)
DROP POLICY IF EXISTS agent_memory_service_role_all   ON public.agent_memory;
CREATE POLICY agent_memory_service_role_all
    ON public.agent_memory
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS agent_messages_service_role_all ON public.agent_messages;
CREATE POLICY agent_messages_service_role_all
    ON public.agent_messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Explicit deny-all for anon and authenticated roles. With RLS enabled and no
-- other policies, anon/authenticated have no access by default; we also REVOKE
-- table privileges to be unambiguous (defence in depth).
REVOKE ALL ON public.agent_memory   FROM anon, authenticated;
REVOKE ALL ON public.agent_messages FROM anon, authenticated;

-- Keep privileges available to the service role / postgres / service_role.
GRANT ALL ON public.agent_memory   TO service_role;
GRANT ALL ON public.agent_messages TO service_role;

-- Grant usage on sequences (in case of triggers/functions needing it).
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
