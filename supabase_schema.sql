-- SUPABASE SCHEMA FOR LIKKLE LEGENDS MAIL CLUB
-- This schema handles customers, subscriptions, and digital content management.

-- 1. Profiles (for Parents)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    subscription_tier TEXT DEFAULT 'free', -- 'mail_club', 'legends_plus', 'annual_plus'
    subscription_status TEXT DEFAULT 'inactive', -- 'active', 'past_due', 'canceled'
    next_billing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Children (Sub-profiles)
CREATE TABLE IF NOT EXISTS children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    age_track TEXT DEFAULT 'mini', -- 'mini' (4-5), 'big' (6-8)
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Content: Songs
CREATE TABLE IF NOT EXISTS songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Likkle Legends',
    audio_url TEXT NOT NULL,
    thumbnail_url TEXT,
    tier_required TEXT DEFAULT 'mail_club', -- Access control
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Content: Digital Storybooks
CREATE TABLE IF NOT EXISTS storybooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content_json JSONB, -- For interactive story structure
    cover_image_url TEXT,
    tier_required TEXT DEFAULT 'legends_plus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Content: Printables (Coloring Pages)
CREATE TABLE IF NOT EXISTS printables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    preview_url TEXT,
    category TEXT DEFAULT 'coloring', -- 'coloring', 'guide', 'training'
    tier_required TEXT DEFAULT 'mail_club',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Activity Log
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'read_story', 'listened_song', 'completed_mission'
    activity_meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Storage Buckets (for Assets)
-- Note: This requires the storage extension to be enabled, which is default.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('legends-assets', 'legends-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE printables ENABLE ROW LEVEL SECURITY;

-- Policies

-- Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Children
CREATE POLICY "Parents can view their children" ON children FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can add children" ON children FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update children" ON children FOR UPDATE USING (auth.uid() = parent_id);

-- Content (Public Read / Admin Write)
CREATE POLICY "Viewable content for everyone" ON songs FOR SELECT USING (true);
CREATE POLICY "Viewable content for everyone" ON storybooks FOR SELECT USING (true);
CREATE POLICY "Viewable content for everyone" ON printables FOR SELECT USING (true);

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'legends-assets' );
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'legends-assets' );

-- Helper to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
