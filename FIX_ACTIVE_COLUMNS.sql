-- ENSURE CONSISTENT is_active COLUMNS
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.printables
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
-- Update rows that might have been created without it
UPDATE public.songs
SET is_active = true
WHERE is_active IS NULL;
UPDATE public.storybooks
SET is_active = true
WHERE is_active IS NULL;
UPDATE public.videos
SET is_active = true
WHERE is_active IS NULL;
UPDATE public.printables
SET is_active = true
WHERE is_active IS NULL;
UPDATE public.games
SET is_active = true
WHERE is_active IS NULL;
UPDATE public.characters
SET is_active = true
WHERE is_active IS NULL;