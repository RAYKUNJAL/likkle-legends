-- Project Anansi Foundation Migration
-- Based on Spec v1.0.0

-- 1. Profiles (Enhanced)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    child_name TEXT,
    age_band TEXT, -- 3-5, 6-7, 8-9
    grade_band TEXT, -- Infants1, Infants2, Std1, etc.
    island_id TEXT,
    character_preference TEXT,
    dialect_intensity TEXT DEFAULT 'medium',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agent Memory Facts
CREATE TABLE IF NOT EXISTS public.agent_memory_facts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fact_key TEXT NOT NULL,
    fact_value TEXT NOT NULL,
    confidence NUMERIC DEFAULT 1.0,
    source TEXT DEFAULT 'inferred',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, fact_key)
);

-- 3. Agent Memory Summaries
CREATE TABLE IF NOT EXISTS public.agent_memory_summaries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    summary TEXT,
    token_estimate INT DEFAULT 0,
    last_interaction TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Curriculum
CREATE TABLE IF NOT EXISTS public.curriculum_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country_scope TEXT NOT NULL,
    publisher TEXT,
    url TEXT,
    version_year INT,
    license_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.curriculum_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.curriculum_sources(id),
    country_scope TEXT NOT NULL,
    grade_band TEXT,
    age_band TEXT,
    subject TEXT,
    strand TEXT,
    outcome_code TEXT,
    outcome_text TEXT NOT NULL,
    success_criteria TEXT,
    difficulty INT DEFAULT 1,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Content Assets
CREATE TABLE IF NOT EXISTS public.content_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type TEXT NOT NULL, -- worksheet, lesson_plan, story, etc.
    country_scope TEXT,
    island_id TEXT,
    age_band TEXT,
    grade_band TEXT,
    subject TEXT,
    character TEXT,
    payload_json JSONB NOT NULL,
    render_status TEXT DEFAULT 'pending', -- pending, done, failed
    storage_path TEXT,
    cache_key_hash TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Agent Jobs
CREATE TABLE IF NOT EXISTS public.agent_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'queued', -- queued, running, done, failed, canceled
    input_json JSONB,
    output_json JSONB,
    asset_ids UUID[],
    model_tier_used TEXT,
    cost_estimate NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Usage Logs
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    tier TEXT DEFAULT 'free',
    feature_type TEXT,
    tokens_in_est INT DEFAULT 0,
    tokens_out_est INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Schools & Classes
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    island_region TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    teacher_user_id UUID REFERENCES auth.users(id),
    grade_band TEXT,
    island_id TEXT,
    class_code TEXT UNIQUE,
    settings_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id),
    display_name TEXT NOT NULL,
    age_band TEXT,
    parent_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Baseline
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Memory tables are service-role only for now (policy: none can access via client)
-- But we can add specific ones later if needed.

-- Usage logs: user can read their own
CREATE POLICY "Users can see their own usage." ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
