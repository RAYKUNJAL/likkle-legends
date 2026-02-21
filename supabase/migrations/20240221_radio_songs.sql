-- Create Songs Table for Tanty Radio
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Likkle Legends',
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    category TEXT DEFAULT 'story', -- story, lullaby, culture, calm, learning, vip
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view active songs" ON public.songs
FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins have full access to songs" ON public.songs 
FOR ALL USING (auth.jwt() ->> 'email' = 'raykunjal@gmail.com' OR auth.jwt() ->> 'email' LIKE '%admin@%');

-- Grant permissions
GRANT SELECT ON public.songs TO anon, authenticated;
GRANT ALL ON public.songs TO service_role;
