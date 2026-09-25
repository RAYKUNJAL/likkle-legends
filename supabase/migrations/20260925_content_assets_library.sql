-- Content library: admin-managed files (coloring books, PDFs, stories)
-- distributed onto paid kid shelves.
-- Admin write. Paid members read only published assets that are assigned to a section.

DO $$ BEGIN
    CREATE TYPE public.content_asset_type AS ENUM (
        'coloring_book',
        'pdf',
        'story',
        'journey_story',
        'other'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.content_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    asset_type public.content_asset_type NOT NULL DEFAULT 'other',
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0 CHECK (file_size >= 0),
    cover_url TEXT,
    cover_path TEXT,
    published BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] NOT NULL DEFAULT '{}',
    age_min INTEGER,
    age_max INTEGER,
    age_band TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT content_assets_age_band_check CHECK (
        age_band IS NULL OR age_band IN ('all', 'mini', 'big')
    ),
    CONSTRAINT content_assets_age_range_check CHECK (
        (age_min IS NULL OR age_min BETWEEN 0 AND 18)
        AND (age_max IS NULL OR age_max BETWEEN 0 AND 18)
        AND (age_min IS NULL OR age_max IS NULL OR age_min <= age_max)
    )
);

CREATE TABLE IF NOT EXISTS public.content_section_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.content_assets(id) ON DELETE CASCADE,
    section_key TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT content_section_key_check CHECK (
        section_key IN (
            'portal_library',
            'kids_library',
            'coloring_books',
            'stories',
            'journey_stories',
            'downloads',
            'printables',
            'featured_home'
        )
    ),
    CONSTRAINT content_section_assignments_unique UNIQUE (asset_id, section_key)
);

CREATE INDEX IF NOT EXISTS idx_content_assets_published_type
    ON public.content_assets (published, asset_type);
CREATE INDEX IF NOT EXISTS idx_content_assets_updated
    ON public.content_assets (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_assets_tags
    ON public.content_assets USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_content_section_assignments_section
    ON public.content_section_assignments (section_key, featured DESC, sort_order);

CREATE OR REPLACE FUNCTION public.set_content_assets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_content_assets_updated_at ON public.content_assets;
CREATE TRIGGER trg_content_assets_updated_at
    BEFORE UPDATE ON public.content_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_content_assets_updated_at();

-- Staff: profiles admin flag/role, or a row in admin_users (admin, super_admin, editor).
CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        auth.uid() IS NOT NULL
        AND (
            EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = auth.uid()
                  AND (
                    p.is_admin IS TRUE
                    OR lower(coalesce(p.role::text, '')) IN ('admin', 'super_admin')
                  )
            )
            OR EXISTS (
                SELECT 1
                FROM public.admin_users au
                WHERE au.id = auth.uid()
                  AND au.role::text IN ('admin', 'super_admin', 'editor')
            )
        );
$$;

-- Mirrors UserContext.canAccess('starter_mailer'): active/trialing paid tiers,
-- teachers, and content admins. Free and anonymous fail closed.
CREATE OR REPLACE FUNCTION public.is_paid_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        auth.uid() IS NOT NULL
        AND (
            public.is_content_admin()
            OR EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = auth.uid()
                  AND lower(coalesce(p.role::text, '')) = 'teacher'
            )
            OR EXISTS (
                SELECT 1
                FROM public.profiles p
                WHERE p.id = auth.uid()
                  AND lower(coalesce(p.subscription_status::text, '')) IN ('active', 'trialing')
                  AND lower(coalesce(p.subscription_tier::text, 'free')) IN (
                    'starter_mailer',
                    'legends_plus',
                    'family_legacy',
                    'admin'
                  )
            )
        );
$$;

REVOKE ALL ON FUNCTION public.is_content_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_paid_member() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_content_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_paid_member() TO anon, authenticated, service_role;

ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_section_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS content_assets_select ON public.content_assets;
CREATE POLICY content_assets_select ON public.content_assets
    FOR SELECT
    USING (
        public.is_content_admin()
        OR (
            published = true
            AND public.is_paid_member()
            AND EXISTS (
                SELECT 1
                FROM public.content_section_assignments a
                WHERE a.asset_id = content_assets.id
            )
        )
    );

DROP POLICY IF EXISTS content_assets_admin_write ON public.content_assets;
CREATE POLICY content_assets_admin_write ON public.content_assets
    FOR ALL
    USING (public.is_content_admin())
    WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS content_section_assignments_select ON public.content_section_assignments;
CREATE POLICY content_section_assignments_select ON public.content_section_assignments
    FOR SELECT
    USING (
        public.is_content_admin()
        OR (
            public.is_paid_member()
            AND EXISTS (
                SELECT 1
                FROM public.content_assets ca
                WHERE ca.id = content_section_assignments.asset_id
                  AND ca.published = true
            )
        )
    );

DROP POLICY IF EXISTS content_section_assignments_admin_write ON public.content_section_assignments;
CREATE POLICY content_section_assignments_admin_write ON public.content_section_assignments
    FOR ALL
    USING (public.is_content_admin())
    WITH CHECK (public.is_content_admin());

GRANT SELECT ON public.content_assets TO authenticated;
GRANT SELECT ON public.content_section_assignments TO authenticated;
GRANT ALL ON public.content_assets TO service_role;
GRANT ALL ON public.content_section_assignments TO service_role;

-- Private bucket. Writes are admin-only. Paid members can read objects that
-- belong to a published, section-assigned asset. API routes also sign URLs
-- after the same check.
DO $$
DECLARE
    has_limit boolean;
    has_mimes boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'storage' AND table_name = 'buckets' AND column_name = 'file_size_limit'
    ) INTO has_limit;
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'storage' AND table_name = 'buckets' AND column_name = 'allowed_mime_types'
    ) INTO has_mimes;

    IF has_limit AND has_mimes THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'content-assets',
            'content-assets',
            false,
            83886080,
            ARRAY[
                'application/pdf',
                'image/png',
                'image/jpeg',
                'image/webp',
                'image/gif',
                'application/zip',
                'application/x-zip-compressed'
            ]::text[]
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = EXCLUDED.file_size_limit,
            allowed_mime_types = EXCLUDED.allowed_mime_types;
    ELSIF has_limit THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('content-assets', 'content-assets', false, 83886080)
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = EXCLUDED.file_size_limit;
    ELSE
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('content-assets', 'content-assets', false)
        ON CONFLICT (id) DO UPDATE SET public = false;
    END IF;
END $$;

DROP POLICY IF EXISTS "Admins manage content-assets bucket" ON storage.objects;
CREATE POLICY "Admins manage content-assets bucket" ON storage.objects
    FOR ALL
    USING (bucket_id = 'content-assets' AND public.is_content_admin())
    WITH CHECK (bucket_id = 'content-assets' AND public.is_content_admin());

DROP POLICY IF EXISTS "Paid members read published content assets" ON storage.objects;
CREATE POLICY "Paid members read published content assets" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'content-assets'
        AND public.is_paid_member()
        AND EXISTS (
            SELECT 1
            FROM public.content_assets ca
            WHERE ca.published = true
              AND (
                ca.file_path = storage.objects.name
                OR ca.cover_path = storage.objects.name
              )
              AND EXISTS (
                SELECT 1
                FROM public.content_section_assignments a
                WHERE a.asset_id = ca.id
              )
        )
    );

-- Lead magnets and printables can point at a published library PDF later.
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'lead_magnets'
    ) THEN
        ALTER TABLE public.lead_magnets
            ADD COLUMN IF NOT EXISTS content_asset_id UUID REFERENCES public.content_assets(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_lead_magnets_content_asset
            ON public.lead_magnets (content_asset_id);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'printables'
    ) THEN
        ALTER TABLE public.printables
            ADD COLUMN IF NOT EXISTS content_asset_id UUID REFERENCES public.content_assets(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_printables_content_asset
            ON public.printables (content_asset_id);
    END IF;
END $$;

COMMENT ON TABLE public.content_assets IS
    'Admin content files (coloring books, PDFs, stories). Kids see a row only when published and assigned to a section.';
COMMENT ON TABLE public.content_section_assignments IS
    'Which kid-app shelf a content asset appears on, plus sort order and featured flag.';

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'lead_magnets' AND column_name = 'content_asset_id'
    ) THEN
        COMMENT ON COLUMN public.lead_magnets.content_asset_id IS
            'Optional pointer at a published content_assets PDF for lead magnets and journey packs.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'printables' AND column_name = 'content_asset_id'
    ) THEN
        COMMENT ON COLUMN public.printables.content_asset_id IS
            'Optional pointer at a published content_assets file for printable packs.';
    END IF;
END $$;
