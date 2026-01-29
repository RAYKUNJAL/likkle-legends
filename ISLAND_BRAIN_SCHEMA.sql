-- 1. Create table if it doesn't exist (Idempotent)
CREATE TABLE IF NOT EXISTS public.ai_personality (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
    system_prompt TEXT,
    knowledge_base TEXT,
    voice_settings JSONB DEFAULT '{"stability": 0.5, "similarity_boost": 0.75}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Enable RLS (Safe to run multiple times)
ALTER TABLE public.ai_personality ENABLE ROW LEVEL SECURITY;
-- 3. Create Policy SAFELY using DO block to check existence first
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'ai_personality'
        AND policyname = 'Admins manage personality'
) THEN EXECUTE 'CREATE POLICY "Admins manage personality" ON public.ai_personality
      FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
      )';
END IF;
END $$;
-- 4. Grant Access (Safe to run multiple times)
GRANT ALL ON public.ai_personality TO service_role;
GRANT ALL ON public.ai_personality TO authenticated;
-- 5. Create Performance Indexes (Safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_personality_character_id ON public.ai_personality(character_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_admin_users_id ON public.admin_users(id);