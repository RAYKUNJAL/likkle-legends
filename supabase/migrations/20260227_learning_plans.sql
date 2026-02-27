-- Learning Plans & Parent Quiz Results
-- Adds metadata column to children for quiz results
-- Creates learning_plans table for AI-generated educational plans

-- Add metadata column to children table for quiz results
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Learning plans table
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'My Learning Adventure',
  focus_areas TEXT[] DEFAULT '{}',
  learning_style TEXT,
  daily_minutes INTEGER DEFAULT 30,
  primary_goal TEXT,
  preferred_character TEXT DEFAULT 'roti',
  plan_data JSONB NOT NULL DEFAULT '{}',
  curriculum_standard TEXT DEFAULT 'OECS Caribbean Primary',
  island_theme TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_plans_child ON public.learning_plans(child_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_active ON public.learning_plans(child_id, is_active);

ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents manage their children plans"
  ON public.learning_plans
  USING (child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()));

GRANT ALL ON public.learning_plans TO authenticated;
