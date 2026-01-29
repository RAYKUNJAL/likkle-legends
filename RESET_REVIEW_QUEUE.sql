-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    island_id TEXT,
    content_type TEXT,
    title TEXT,
    payload JSONB DEFAULT '{}',
    parent_note JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    qa_report JSONB DEFAULT '{}',
    admin_status TEXT DEFAULT 'pending',
    -- 'pending', 'approved', 'rejected'
    is_approved_for_kid BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Enable RLS
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
-- 3. Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Admins manage all generated content" ON public.generated_content;
DROP POLICY IF EXISTS "Users can view own generated content" ON public.generated_content;
-- 4. Create Admin Policy
CREATE POLICY "Admins manage all generated content" ON public.generated_content FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    )
    OR EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND is_admin = true
    )
);
-- 5. Create User Policy
CREATE POLICY "Users can view own generated content" ON public.generated_content FOR
SELECT USING (auth.uid() = family_id);
-- 6. Grant Permissions
GRANT ALL ON public.generated_content TO service_role;
GRANT SELECT,
    UPDATE ON public.generated_content TO authenticated;
-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_family_id ON public.generated_content(family_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_admin_status ON public.generated_content(admin_status);