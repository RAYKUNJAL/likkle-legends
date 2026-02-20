-- Project Anansi: Nervous System & Advanced Analytics
-- Based on Spec v1.0.0

-- 1. Idempotent Daily Updates (Word of Day, Churn Nudges)
CREATE TABLE IF NOT EXISTS public.daily_updates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    update_date DATE DEFAULT CURRENT_DATE,
    update_type TEXT NOT NULL, -- 'word_of_day', 'churn_nudge', 'streak_alert'
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'skipped', 'failed'
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, update_date, update_type)
);

-- 2. Communication logs (Email/In-app history)
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'email', 'push', 'in_app'
    template TEXT,
    status TEXT DEFAULT 'delivered',
    provider_id TEXT, -- e.g. Resend message ID
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mastery Tracking (The "Learning North Star")
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    outcome_id UUID REFERENCES public.curriculum_outcomes(id),
    mastery_score NUMERIC DEFAULT 0, -- 0.0 to 1.0
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assignments & Tasks
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.content_assets(id),
    due_date DATE,
    status TEXT DEFAULT 'active'
);

-- 5. Assessment Results
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.content_assets(id),
    score_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assessment Blueprints (Reusable patterns)
CREATE TABLE IF NOT EXISTS public.assessment_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outcome_id UUID REFERENCES public.curriculum_outcomes(id),
    question_types_allowed TEXT[],
    rubric TEXT,
    common_misconceptions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Outcome Crosswalks (Mapping TT ↔ OECS)
CREATE TABLE IF NOT EXISTS public.outcome_crosswalks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_outcome_id UUID REFERENCES public.curriculum_outcomes(id),
    mapped_outcome_id UUID REFERENCES public.curriculum_outcomes(id),
    match_type TEXT, -- 'exact', 'partial', 'superset'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Content Templates (Style Rules per Country)
CREATE TABLE IF NOT EXISTS public.content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_type TEXT NOT NULL, -- 'worksheet', 'lesson'
    age_band TEXT,
    subject TEXT,
    format_schema_json JSONB,
    style_rules TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own communication logs." ON public.communication_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own daily updates." ON public.daily_updates FOR SELECT USING (auth.uid() = user_id);

-- Helper for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to profiles and memory
DO $$ BEGIN
    CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_memory_facts_modtime BEFORE UPDATE ON public.agent_memory_facts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
EXCEPTION WHEN OTHERS THEN NULL; END $$;
