
-- COMMERICAL LAUNCH SCHEMA EVOLUTION & SEED DATA
-- This script aligns the database with the premium UI and loads starter content.

-- 1. EVOLVE SCHEMA
-- Add missing metadata columns to characters
ALTER TABLE public.characters 
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Add missing metadata to missions and fix naming
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS mission_type text,
  ADD COLUMN IF NOT EXISTS age_track text DEFAULT 'all';

-- Handle the xp naming discrepancy (Normalize to reward_xp as per user preference)
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='reward_xp') THEN
    -- Table already uses reward_xp, all good
    NULL;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='xp_reward') THEN
    -- Table has old name, rename it
    ALTER TABLE public.missions RENAME COLUMN xp_reward TO reward_xp;
  ELSE
    -- Column missing entirely, create it
    ALTER TABLE public.missions ADD COLUMN reward_xp integer DEFAULT 10;
  END IF;
END $$;

-- 2. SEED CHARACTERS (Personalized for the UI)
-- Ensure slug column exists (just in case)
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Insert using generated UUIDs for id; store readable key in slug
INSERT INTO public.characters (id, slug, name, role, tagline, description, display_order, is_active)
VALUES 
  (gen_random_uuid(), 'roti', 'R.O.T.I.', 'Island Learning Buddy', 'Beep boop! Ready to learn?', 'A friendly guide who helps children learn step by step through stories, games, and gentle encouragement.', 1, true),
  (gen_random_uuid(), 'tanty_spice', 'Tanty Spice', 'Village Heart & Wisdom', 'Everything Cook & Curry, me darlin.', 'A warm, caring presence who helps lessons land with kindness, patience, and reassurance.', 2, true),
  (gen_random_uuid(), 'dilly_doubles', 'Dilly Doubles', 'Joy & Sharing Guide', 'Sharing is the island way!', 'A playful island friend who teaches curiosity, sharing, and community through fun and laughter.', 3, true)
ON CONFLICT (slug) DO UPDATE SET 
  role = EXCLUDED.role,
  tagline = EXCLUDED.tagline,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 3. STARTER STORIES
INSERT INTO public.storybooks (title, summary, cover_image_url, tier_required, reading_time_minutes, is_active, display_order)
VALUES 
  ('The Lost Mango of Montego Bay', 'Join Tanty Spice as she helps a little lizard find his favorite golden mango.', 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=800', 'free', 5, true, 1),
  ('Anansi and the Magic Steelpan', 'A classic trickster tale with a musical twist. Can Anansi play the rhythm right?', 'https://images.unsplash.com/photo-1614264284560-64be73587e91?auto=format&fit=crop&w=800', 'legends_plus', 7, true, 2),
  ('Dilly’s Big Doubles Day', 'Learn about the spice islands through a magical journey to the market.', 'https://images.unsplash.com/photo-1601050633647-3f92c4509ae1?auto=format&fit=crop&w=800', 'legends_plus', 6, true, 3)
ON CONFLICT DO NOTHING;

-- 4. STARTER SONGS
INSERT INTO public.songs (title, artist, thumbnail_url, audio_url, tier_required, is_active, display_order)
VALUES 
  ('Island ABCs', 'Likkle Legends Band', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'free', true, 1),
  ('The Coconut Counting Song', 'The Island Rhythm Kids', 'https://images.unsplash.com/photo-1550293028-93d2e397702f?auto=format&fit=crop&w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'free', true, 2),
  ('Respect the Reef (Reggae Remix)', 'Coral the Calypso Crab', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'legends_plus', true, 3)
ON CONFLICT DO NOTHING;

-- 5. STARTER VIDEOS
INSERT INTO public.videos (title, thumbnail_url, video_url, duration_seconds, tier_required, is_active, display_order)
VALUES 
  ('How to Make Virtual Plantain', 'https://images.unsplash.com/photo-1528658129997-12dc9cecf325?auto=format&fit=crop&w=800', 'https://www.w3schools.com/html/mov_bbb.mp4', 120, 'free', true, 1),
  ('Meet the Island Animals', 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800', 'https://www.w3schools.com/html/mov_bbb.mp4', 180, 'legends_plus', true, 2)
ON CONFLICT DO NOTHING;

-- 6. INITIAL MISSIONS
INSERT INTO public.missions (title, description, reward_xp, mission_type, age_track, is_active, start_date, end_date)
VALUES 
  ('The Patois Word Hunt', 'Find three hidden words in the village including "Likkle"!', 50, 'Culture', 'all', true, '2025-01-01', '2030-12-31'),
  ('Counting Coconuts', 'Count all the coconut trees you see in the Story Studio today.', 30, 'Math', 'mini', true, '2025-01-01', '2030-12-31'),
  ('Caribbean Color Master', 'Name three colors of the hibiscus flowers in Tanty’s garden.', 40, 'Culture', 'big', true, '2025-01-01', '2030-12-31')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.missions IS 'Adventure quests for kids with cultural and educational goals.';
COMMENT ON TABLE public.characters IS 'Village guides who lead children through their Caribbean learning journey.';
