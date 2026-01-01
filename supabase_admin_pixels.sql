-- 1. Add Admin Role to Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Site Settings
-- Everyone can read stats/public settings (if needed), but only admins can specific sensitive ones?
-- For pixels, we want the PUBLIC (layout.tsx) to read them.
CREATE POLICY "Public Read Settings" ON site_settings
    FOR SELECT USING (true); -- Publicly readable (needed for pixels to load on home page)

-- Only Admins can Update
CREATE POLICY "Admins Update Settings" ON site_settings
    FOR UPDATE USING (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

-- Only Admins can Insert
CREATE POLICY "Admins Insert Settings" ON site_settings
    FOR INSERT WITH CHECK (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

-- 5. Insert Default Settings Row
INSERT INTO site_settings (key, value)
VALUES ('analytics', '{"facebook_pixel_id": "", "google_analytics_id": "", "tiktok_pixel_id": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
