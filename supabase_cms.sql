
-- 1. Create table for site content
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Public can read everything
CREATE POLICY "Public read site_settings" ON site_settings 
    FOR SELECT 
    USING (true);

-- Only Admins can update/insert
-- Assuming you have an 'admin_users' table or similar logic. 
-- For now, we'll use a specific email check or the admin_users table if exists.
CREATE POLICY "Admins can manage site_settings" ON site_settings 
    FOR ALL 
    USING (
        auth.uid() IN (SELECT id FROM admin_users) OR
        auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
    );

-- 4. Audit Log Trigger (Optional but good)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_modtime
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
