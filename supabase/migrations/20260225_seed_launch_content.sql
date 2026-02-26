-- =============================================================================
-- LAUNCH CONTENT SEED — Printables, Flashcards & Storybooks
-- Run in Supabase SQL Editor → New Query → Run
-- =============================================================================
--
-- AFTER UPLOADING YOUR OWN PNG/JPG FILES:
--   1. Go to Supabase Dashboard → Storage → Create bucket "printables" (public)
--   2. Upload your files to the "printables" bucket
--   3. Run this UPDATE to replace placeholder URLs:
--
--   UPDATE printables
--   SET pdf_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/printables/YOUR_FILE.png',
--       thumbnail_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/printables/YOUR_FILE.png'
--   WHERE title = 'Your Title Here';
--
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. SCHEMA ADDITIONS (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.printables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    category text,
    pdf_url text,
    thumbnail_url text,
    age_group text,
    age_track text,
    island text,
    tier_required text,
    is_active boolean DEFAULT true,
    display_order int,
    is_new boolean DEFAULT false
);

ALTER TABLE printables ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. STORAGE BUCKET (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'printables',
    'printables',
    true,
    10485760,
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: drop-then-recreate so this script is safe to re-run
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read printables storage'
  ) THEN
    EXECUTE 'DROP POLICY "Public read printables storage" ON storage.objects';
  END IF;
END$$;
CREATE POLICY "Public read printables storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'printables');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admin upload printables storage'
  ) THEN
    EXECUTE 'DROP POLICY "Admin upload printables storage" ON storage.objects';
  END IF;
END$$;
CREATE POLICY "Admin upload printables storage"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'printables'
    AND auth.role() = 'authenticated'
);

-- =============================================================================
-- 2. PRINTABLES — Coloring Pages (8 rows)
-- =============================================================================
INSERT INTO printables (title, description, category, pdf_url, thumbnail_url, age_group, age_track, island, tier_required, is_active, display_order, is_new)
VALUES

-- FREE COLORING PAGES (visible to all)
(
    'Dilly''s Carnival Costume',
    'Color Dilly Doubles in her dazzling Carnival outfit! Use your brightest purples, golds, and pinks.',
    'coloring',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    'all', 'all', 'Jamaica', 'free', true, 1, true
),
(
    'R.O.T.I. the Learning Robot',
    'Build your own R.O.T.I.! Color this friendly robot with shimmering silvers, blues, and glowing greens.',
    'coloring',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    'all', 'all', NULL, 'free', true, 2, true
),
(
    'Tanty''s Pepper Garden',
    'Tanty Spice is tending her famous pepper garden. Color each pepper in a different bright Caribbean color!',
    'coloring',
    'https://images.unsplash.com/photo-1588891557811-5b56e6b70bcc?w=800',
    'https://images.unsplash.com/photo-1588891557811-5b56e6b70bcc?w=400',
    'all', 'all', 'Trinidad and Tobago', 'free', true, 3, true
),
(
    'Island Animals Adventure',
    'A whole page of Caribbean animals to color — parrots, iguanas, tree frogs, and hummingbirds!',
    'coloring',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    'mini', 'mini', NULL, 'free', true, 4, true
),

-- ROOKIE COLORING PAGES (members only)
(
    'Mango Moko''s Mango Tree',
    'Mango Moko swings from his favourite mango tree! Color the tree with juicy oranges and deep greens.',
    'coloring',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400',
    'all', 'all', 'Grenada', 'rookie', true, 5, true
),
(
    'Anansi Weaves His Web',
    'The trickster spider is at work! Color Anansi and his magical web with your most creative color choices.',
    'coloring',
    'https://images.unsplash.com/photo-1557531365-e8b22d93dbd0?w=800',
    'https://images.unsplash.com/photo-1557531365-e8b22d93dbd0?w=400',
    'all', 'all', 'Jamaica', 'rookie', true, 6, false
),
(
    'Papa Bois: Forest Guardian',
    'The protector of the forest stands tall. Use earth tones, deep greens, and rich browns for this legend.',
    'coloring',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    'big', 'big', 'Trinidad and Tobago', 'rookie', true, 7, false
),
(
    'Scorcha Pepper''s Spicy Kitchen',
    'Scorcha is cooking up something fierce! Color the ingredients, pots, and spices on this full kitchen scene.',
    'coloring',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    'big', 'big', 'Barbados', 'legend', true, 8, false
)
;

-- =============================================================================
-- 3. PRINTABLES — Activity Sheets (6 rows)
-- =============================================================================
INSERT INTO printables (title, description, category, pdf_url, thumbnail_url, age_group, age_track, island, tier_required, is_active, display_order, is_new)
VALUES

(
    'Connect Dilly to Her Island',
    'Draw lines to connect each Caribbean island name to its correct shape on the map. Great for Geography!',
    'activity',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
    'mini', 'mini', NULL, 'free', true, 10, true
),
(
    'R.O.T.I.''s Number Maze',
    'Help R.O.T.I. navigate the maze by following the numbers in order from 1 to 20. Math + adventure!',
    'activity',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400',
    'all', 'all', NULL, 'free', true, 11, true
),
(
    'Count the Mangoes with Moko',
    'Count the mangoes in each group and write the number. Perfect for early number recognition!',
    'activity',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400',
    'mini', 'mini', NULL, 'free', true, 12, true
),
(
    'Caribbean Fruits Matching',
    'Match each Caribbean fruit to its name! Features soursop, ackee, guinep, sapodilla, and more.',
    'activity',
    'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800',
    'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400',
    'all', 'all', NULL, 'rookie', true, 13, false
),
(
    'Island Word Search',
    'Find 15 hidden Caribbean words — islands, animals, foods, and celebrations. Medium difficulty!',
    'activity',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    'big', 'big', NULL, 'rookie', true, 14, false
),
(
    'Trace the Letters with Dilly',
    'Practice uppercase and lowercase letters with Dilly as your guide. Each letter features a Caribbean word!',
    'activity',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    'mini', 'mini', NULL, 'free', true, 15, false
)
;

-- =============================================================================
-- 4. PRINTABLES — Educational Worksheets (4 rows)
-- =============================================================================
INSERT INTO printables (title, description, category, pdf_url, thumbnail_url, age_group, age_track, island, tier_required, is_active, display_order, is_new)
VALUES

(
    'ABC Island Alphabet',
    'A is for Ackee, B is for Breadfruit, C is for Coconut! Learn the alphabet with Caribbean flavour.',
    'worksheet',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    'mini', 'mini', NULL, 'free', true, 20, true
),
(
    'Caribbean Counting 1 to 20',
    'Count hummingbirds, steel drums, sea turtles, and more! Write the numbers and draw your own pictures.',
    'worksheet',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400',
    'all', 'all', NULL, 'free', true, 21, false
),
(
    'Island Animals Writing Practice',
    'Trace and copy the names of Caribbean animals. Practice pencil grip with iguanas, parrots & more!',
    'worksheet',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    'mini', 'mini', NULL, 'rookie', true, 22, false
),
(
    'My Heritage Island Map',
    'A blank Caribbean map your child colours and labels. Mark your family''s heritage island and write 3 facts!',
    'worksheet',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
    'big', 'big', NULL, 'legend', true, 23, false
)
;

-- =============================================================================
-- 5. PRINTABLES — Craft Sheets (2 rows)
-- =============================================================================
INSERT INTO printables (title, description, category, pdf_url, thumbnail_url, age_group, age_track, island, tier_required, is_active, display_order, is_new)
VALUES

(
    'Make Your Own Legend Mask',
    'Cut out and decorate your own Carnival Legend Mask! Inspired by Caribbean masquerade traditions.',
    'craft',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    'all', 'all', 'Trinidad and Tobago', 'rookie', true, 30, true
),
(
    'Paper Tanty Spice Puppet',
    'Print, colour, cut and fold — and you''ve got your very own Tanty Spice finger puppet! Story time starts!',
    'craft',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
    'all', 'all', NULL, 'legend', true, 31, false
)
;

-- =============================================================================
-- 6. FLASHCARD SETS (stored as printable activity items, category = 'activity')
-- =============================================================================
INSERT INTO printables (title, description, category, pdf_url, thumbnail_url, age_group, age_track, island, tier_required, is_active, display_order, is_new)
VALUES

(
    'Caribbean Animals Flashcards',
    '20 double-sided flashcards featuring Caribbean wildlife. Name, habitat, and fun fact on every card. Print & cut!',
    'activity',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    'all', 'all', NULL, 'free', true, 40, true
),
(
    'Island Fruits & Veggies Flashcards',
    '16 flashcards: ackee, breadfruit, sorrel, soursop, guinep, callaloo & more. Patois name on the back!',
    'activity',
    'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800',
    'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400',
    'all', 'all', NULL, 'free', true, 41, true
),
(
    'Numbers 1–10 Flashcards',
    'Bold, colourful number flashcards with matching Caribbean objects to count on each card. Great for mini-legends!',
    'activity',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400',
    'mini', 'mini', NULL, 'free', true, 42, false
),
(
    'Alphabet Flashcards A–M',
    'First half of the island alphabet! Each letter features a Caribbean word, picture, and pronunciation guide.',
    'activity',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    'mini', 'mini', NULL, 'free', true, 43, false
),
(
    'Alphabet Flashcards N–Z',
    'Second half of the island alphabet! Includes N for Nutmeg, S for Steelpan, Z for Zandoli (anole lizard).',
    'activity',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    'mini', 'mini', NULL, 'free', true, 44, false
),
(
    'Caribbean Flags Flashcards',
    '15 Caribbean nation flags — both sides feature the flag, country name, capital city, and a heritage fact.',
    'activity',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400',
    'big', 'big', NULL, 'rookie', true, 45, true
)
;

-- =============================================================================
-- 7. STORYBOOKS — stored in content_items (content_type = 'story')
-- Fields: slug, title, description (=summary), thumbnail_url (=cover),
--         age_track, tier_required, island_code, reward_xp, is_active,
--         metadata.reading_time_minutes, metadata.content_json,
--         metadata.display_order
-- =============================================================================
INSERT INTO public.content_items
    (id, slug, content_type, title, description, thumbnail_url,
     age_track, tier_required, island_code, reward_xp, is_active, metadata)
VALUES

-- ── Book 1: Dilly's First Day at Island School ──────────────────────────────
(
    'aaaaaaaa-1111-1111-1111-111111111111',
    'dilly-first-day-island-school',
    'story',
    'Dilly''s First Day at Island School',
    'Dilly is nervous about her first day at Island School — but a new friend, a mango tree, and a little Tanty wisdom make it the best day ever.',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    '{
        "book_meta": {
            "id": "dilly-001",
            "title": "Dilly''s First Day at Island School",
            "series": "Dilly Doubles Adventures",
            "language_variant": "en-CAR",
            "target_age": 4,
            "reading_level": "early",
            "theme": "Courage & Friendship",
            "setting_island": "Jamaica",
            "moral": "Bravery is just taking one small step forward.",
            "estimated_minutes": 5
        },
        "folklore_profile": {
            "story_type": "slice-of-life",
            "core_tradition": "Caribbean school culture",
            "character_templates": ["dilly_doubles", "tanty_spice"]
        },
        "structure": {
            "pages": [
                {
                    "page_number": 1,
                    "layout": "interactive",
                    "narrative_text": "Dilly Doubles stood at the school gate, her brand-new bag on her back. Her tummy felt like it was full of jumping frogs.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Chile, we all nervous de first day! Tanty know — she been to school plenty times! Now breathe and walk through dat gate!",
                        "roti_prompt": "How does Dilly feel? Can you point to your own tummy and show me what nervous feels like?"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Dilly", "school gate", "backpack", "nervous face"]},
                    "illustration_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
                },
                {
                    "page_number": 2,
                    "layout": "interactive",
                    "narrative_text": "Inside the classroom, a girl with two big puffs waved at Dilly. \"Come sit by me! I saved you a seat under the mango tree painting!\"",
                    "guide_interventions": {
                        "tanty_spice_intro": "Mmm-hmm! See dat? One smile can change de whole day! Dat is a friend waiting to happen, darlin.",
                        "roti_prompt": "What did the girl do to make Dilly feel welcome? What can YOU do to welcome a new friend?"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["classroom", "mango tree mural", "two girls", "waving"]},
                    "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"
                },
                {
                    "page_number": 3,
                    "layout": "interactive",
                    "narrative_text": "By lunchtime, Dilly had learned three new words, drawn a hummingbird, and made a best friend named Zara.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Three words, one picture, one friend — not bad for one morning, eh? Tanty proud a you, Dilly!",
                        "roti_prompt": "What THREE things did Dilly do? Can you remember them? Let''s count together!"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Dilly", "Zara", "lunch", "hummingbird drawing"]},
                    "illustration_url": "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800"
                },
                {
                    "page_number": 4,
                    "layout": "interactive",
                    "narrative_text": "Walking home, Dilly''s tummy no longer had jumping frogs. It had warm sunshine instead. \"Can''t wait for tomorrow!\" she said.",
                    "guide_interventions": {
                        "tanty_spice_intro": "And THAT is what bravery feel like — warm like sunshine! You did it, Dilly! And you can do it too, me darlin.",
                        "roti_prompt": "How did Dilly feel at the END compared to the BEGINNING? What changed for her?"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Dilly walking", "sunshine", "big smile", "school in background"]},
                    "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"
                }
            ]
        },
        "assessment": {
            "after_story_questions": [
                {"q": "Why was Dilly nervous?", "type": "recall"},
                {"q": "What made Dilly feel better?", "type": "comprehension"},
                {"q": "Have YOU ever felt nervous? What helped you?", "type": "connection"}
            ],
            "home_connection": {
                "family_activity": "Ask your child to draw their classroom or school and share their favourite part of the day.",
                "language_flex": ["nervous", "brave", "friend", "welcome"]
            }
        }
    }'::jsonb,
    'mini', 'free', 'JAM', 50, true,
    '{"reading_time_minutes": 5, "display_order": 3}'::jsonb
),

-- ── Book 2: Mango Moko and the Lost Mango Grove ─────────────────────────────
(
    'bbbbbbbb-2222-2222-2222-222222222222',
    'mango-moko-lost-mango-grove',
    'story',
    'Mango Moko and the Lost Mango Grove',
    'Mango Moko discovers the ancient mango grove of his ancestors is disappearing. Can he convince the village to save it before the last tree falls?',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800',
    '{
        "book_meta": {
            "id": "moko-001",
            "title": "Mango Moko and the Lost Mango Grove",
            "series": "Mango Moko Legends",
            "language_variant": "en-CAR",
            "target_age": 7,
            "reading_level": "transitional",
            "theme": "Environment & Heritage",
            "setting_island": "Grenada",
            "moral": "Every living thing deserves a protector.",
            "estimated_minutes": 7
        },
        "folklore_profile": {
            "story_type": "legend",
            "core_tradition": "Caribbean nature spirit",
            "character_templates": ["mango_moko", "papa_bois"]
        },
        "structure": {
            "pages": [
                {
                    "page_number": 1,
                    "layout": "interactive",
                    "narrative_text": "High on the green hills of Grenada, Mango Moko had lived in the same mango grove for one hundred years. But this morning, something was wrong — three trees had vanished overnight.",
                    "guide_interventions": {
                        "tanty_spice_intro": "One hundred years! Imagine how much mango Moko eat in dat time! But something wrong now, and Moko need to find out what.",
                        "roti_prompt": "The story says THREE trees vanished. How do you think Moko felt when he noticed? What would YOU feel?"
                    },
                    "illustration_brief": {"style": "lush-vibrant", "must_include": ["Mango Moko", "mango grove", "missing trees", "worried expression"]},
                    "illustration_url": "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800"
                },
                {
                    "page_number": 2,
                    "layout": "interactive",
                    "narrative_text": "Moko climbed down the hill to the village. The people were building a new road. \"We need the wood,\" said the foreman. \"We need those trees,\" said Moko.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Both sides have a point, eh? Dat is what we call a dilemma — when two things both seem right but dey pulling in different directions.",
                        "roti_prompt": "Why does the foreman want the trees? Why does Moko want to keep them? Who do you agree with — and why?"
                    },
                    "illustration_brief": {"style": "lush-vibrant", "must_include": ["Mango Moko", "foreman", "village", "road construction"]},
                    "illustration_url": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800"
                },
                {
                    "page_number": 3,
                    "layout": "interactive",
                    "narrative_text": "Moko had an idea. He gathered the village children and showed them how to plant new seedlings alongside the road. \"Build the road AND keep the grove,\" Moko said. \"There is always a third way.\"",
                    "guide_interventions": {
                        "tanty_spice_intro": "Ohhh, now THAT is wisdom right there! When two people argue, sometimes de answer is outside de argument entirely. Moko is smart!",
                        "roti_prompt": "What is Moko''s idea? Is it fair to BOTH sides? Can you think of another way to solve the problem?"
                    },
                    "illustration_brief": {"style": "lush-vibrant", "must_include": ["Moko", "children planting", "seedlings", "road + trees together"]},
                    "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"
                },
                {
                    "page_number": 4,
                    "layout": "interactive",
                    "narrative_text": "Years later, the new mango grove stood tall beside the road. Every harvest, the village shared the mangoes — and they never forgot the green creature who taught them that nature and progress can grow together.",
                    "guide_interventions": {
                        "tanty_spice_intro": "And now de whole village benefit! That is how you leave a legacy, darlin. You plant for people who not even born yet.",
                        "roti_prompt": "What is a LEGACY? Why is planting trees a good example of leaving one? What legacy would YOU like to leave?"
                    },
                    "illustration_brief": {"style": "lush-vibrant", "must_include": ["grown mango grove", "village celebration", "Moko watching proudly", "harvest"]},
                    "illustration_url": "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800"
                }
            ]
        },
        "assessment": {
            "after_story_questions": [
                {"q": "What was happening to the mango grove?", "type": "recall"},
                {"q": "What does the word legacy mean?", "type": "vocabulary"},
                {"q": "What can you do to protect nature near your home?", "type": "action"}
            ],
            "home_connection": {
                "family_activity": "Plant a seed together — a herb, a flower, or a fruit — and track its growth for 30 days.",
                "language_flex": ["heritage", "legacy", "compromise", "environment", "seedling"]
            }
        }
    }'::jsonb,
    'big', 'rookie', 'GRD', 50, true,
    '{"reading_time_minutes": 7, "display_order": 4}'::jsonb
),

-- ── Book 3: Tanty Spice's Pepper Patch Party ────────────────────────────────
(
    'cccccccc-3333-3333-3333-333333333333',
    'tanty-spice-pepper-patch-party',
    'story',
    'Tanty Spice''s Pepper Patch Party',
    'Every year Tanty Spice throws the biggest pepper-tasting party on the island. But this year, someone has stolen her prize-winning pepper recipe — and Dilly, Moko, and R.O.T.I. must solve the mystery before the party begins!',
    'https://images.unsplash.com/photo-1588891557811-5b56e6b70bcc?w=800',
    '{
        "book_meta": {
            "id": "tanty-001",
            "title": "Tanty Spice''s Pepper Patch Party",
            "series": "Island Mysteries",
            "language_variant": "en-CAR",
            "target_age": 6,
            "reading_level": "early-transitional",
            "theme": "Teamwork & Problem Solving",
            "setting_island": "Trinidad and Tobago",
            "moral": "Friends who solve problems together grow stronger together.",
            "estimated_minutes": 6
        },
        "folklore_profile": {
            "story_type": "mystery",
            "core_tradition": "Caribbean community celebration",
            "character_templates": ["tanty_spice", "dilly_doubles", "mango_moko", "roti"]
        },
        "structure": {
            "pages": [
                {
                    "page_number": 1,
                    "layout": "interactive",
                    "narrative_text": "The whole village smelled like pepper sauce and possibility. Tanty Spice''s annual party was today! But when Tanty went to her secret recipe box, it was empty. GONE!",
                    "guide_interventions": {
                        "tanty_spice_intro": "Me recipe box! Me SOUL is in dat box! Every pepper, every spice, every secret — gone! Oh lawd, somebody call de children. We need help now-now!",
                        "roti_prompt": "The story says the box was empty — GONE! What do those words tell us about how serious this is? How does Tanty feel?"
                    },
                    "illustration_brief": {"style": "vibrant-warm", "must_include": ["Tanty", "empty recipe box", "shocked expression", "pepper garden background"]},
                    "illustration_url": "https://images.unsplash.com/photo-1588891557811-5b56e6b70bcc?w=800"
                },
                {
                    "page_number": 2,
                    "layout": "interactive",
                    "narrative_text": "Dilly, Moko, and R.O.T.I. arrived quickly. R.O.T.I. scanned the ground. \"I detect footprints — small ones — leading toward the market,\" it said. \"Let''s go!\" cried Dilly.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Look at me legends go! When trouble come, real friends show up fast. And R.O.T.I. scanning already! Dat robot earning its name today!",
                        "roti_prompt": "R.O.T.I. found a CLUE. What was the clue? What does the clue tell the team about where to look next?"
                    },
                    "illustration_brief": {"style": "vibrant-warm", "must_include": ["Dilly", "Moko", "R.O.T.I. scanning", "footprints", "market in distance"]},
                    "illustration_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"
                },
                {
                    "page_number": 3,
                    "layout": "interactive",
                    "narrative_text": "At the market they found Little Theo, age 5, sitting behind a stall with the recipe box — he thought it was a treasure chest! \"I just wanted to find treasure,\" he said with big watery eyes.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Awwww! Little Theo! He wasn''t trying to be bad — he just wanted adventure like every child! Tanty heart soften immediately.",
                        "roti_prompt": "Was Theo trying to do something BAD, or did he just make a MISTAKE? What is the difference between bad intentions and a mistake?"
                    },
                    "illustration_brief": {"style": "vibrant-warm", "must_include": ["Little Theo", "recipe box", "watery eyes", "market stall", "our three heroes"]},
                    "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"
                },
                {
                    "page_number": 4,
                    "layout": "interactive",
                    "narrative_text": "Tanty hugged little Theo. \"Every box IS a treasure chest — full of family love,\" she said. The party started late, but the pepper sauce tasted sweeter than ever, made with a new ingredient: teamwork.",
                    "guide_interventions": {
                        "tanty_spice_intro": "And THAT is the best ingredient in any recipe — love and good friends! Now somebody pass Tanty de pepper sauce, because she HUNGRY after all dat excitement!",
                        "roti_prompt": "Tanty says every box is a treasure chest. What do you think SHE means — what was the real treasure in her recipe box?"
                    },
                    "illustration_brief": {"style": "vibrant-warm", "must_include": ["party scene", "Tanty + Theo hugging", "all characters celebrating", "food + joy"]},
                    "illustration_url": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800"
                }
            ]
        },
        "assessment": {
            "after_story_questions": [
                {"q": "What was stolen from Tanty?", "type": "recall"},
                {"q": "Why did Theo take the box?", "type": "comprehension"},
                {"q": "Is there a difference between making a mistake and being bad? Tell me more.", "type": "critical-thinking"}
            ],
            "home_connection": {
                "family_activity": "Cook a simple Caribbean dish together. Talk about family recipes and why they are special to your family.",
                "language_flex": ["mystery", "clue", "intention", "mistake", "teamwork"]
            }
        }
    }'::jsonb,
    'all', 'free', 'TTO', 50, true,
    '{"reading_time_minutes": 6, "display_order": 5}'::jsonb
)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Done! Run this in Supabase SQL Editor.
-- After running, upload your PNG/JPG files to Storage bucket "printables"
-- and UPDATE the pdf_url + thumbnail_url columns with your real file URLs.
-- =============================================================================
