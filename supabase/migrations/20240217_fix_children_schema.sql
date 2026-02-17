-- Ensure 'children' table exists first
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL,
    primary_user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    age_band child_age_band,
    created_at TIMESTAMPTZ DEFAULT now(),
    age_verified BOOLEAN DEFAULT false,
    requires_parental_consent BOOLEAN DEFAULT true,
    consent_last_verified TIMESTAMPTZ
);

-- Ensure the 'age_verified' column exists safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'children'
      AND column_name = 'age_verified'
  ) THEN
    ALTER TABLE public.children
      ADD COLUMN age_verified BOOLEAN DEFAULT false;
  END IF;
END$$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_children_verified ON public.children(age_verified);
