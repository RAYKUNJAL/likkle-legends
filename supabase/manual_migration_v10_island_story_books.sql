-- Migration for Likkle Legends Island Stories Library
CREATE TABLE IF NOT EXISTS public.island_story_books (
    book_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    island TEXT NOT NULL,
    age_group TEXT NOT NULL,
    category TEXT NOT NULL,
    characters TEXT [] DEFAULT '{}',
    summary TEXT,
    reading_time_minutes NUMERIC,
    pages JSONB DEFAULT '[]'::jsonb,
    -- Array of { "page_number": number, "text": string, "illustration_prompt": string }
    illustration_prompts TEXT [] DEFAULT '{}',
    audio_narration BOOLEAN DEFAULT false,
    release_date DATE,
    tags TEXT [] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    cover_image_url TEXT
);
-- Index for efficient querying by age, category, island
CREATE INDEX IF NOT EXISTS idx_island_story_books_island ON public.island_story_books(island);
CREATE INDEX IF NOT EXISTS idx_island_story_books_age_group ON public.island_story_books(age_group);
CREATE INDEX IF NOT EXISTS idx_island_story_books_category ON public.island_story_books(category);
CREATE INDEX IF NOT EXISTS idx_island_story_books_release ON public.island_story_books(release_date);
-- Security
ALTER TABLE public.island_story_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active story books" ON public.island_story_books FOR
SELECT USING (is_active = true);
CREATE POLICY "Admins can manage island story books" ON public.island_story_books FOR ALL USING (auth.jwt()->>'role' = 'admin') WITH CHECK (auth.jwt()->>'role' = 'admin');
-- Add RLS tracking for Gamification Passport
CREATE TABLE IF NOT EXISTS public.island_passport_stamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    island TEXT NOT NULL,
    book_id UUID REFERENCES public.island_story_books(book_id) ON DELETE
    SET NULL,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(child_id, island, book_id)
);
ALTER TABLE public.island_passport_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own passport stamps" ON public.island_passport_stamps FOR
SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can add stamps" ON public.island_passport_stamps FOR
INSERT WITH CHECK (auth.uid() = profile_id);