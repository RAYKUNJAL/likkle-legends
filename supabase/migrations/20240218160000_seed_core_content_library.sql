-- =========================================================
-- Core Content Seeding: Likkle Legends Professional Library (v2.0 Compliant)
-- Goal: Provide high-quality "Canon" books and trainings to save tokens.
-- =========================================================

-- 2. Seed Books (Storybooks) - Updated with v2.0 Schema
INSERT INTO public.storybooks (id, title, summary, content_json, age_track, tier_required, island_theme, reading_time_minutes, is_active, display_order)
VALUES 
(
    '11111111-1111-1111-1111-111111111111', 
    'Anansi and the Great Yam', 
    'A classic trickster tale where Anansi tries to outsmart the village during the harvest festival.',
    '{
        "book_meta": {
            "id": "anansi-001",
            "title": "Anansi and the Great Yam",
            "series": "Anansi Legends",
            "language_variant": "en-CAR",
            "target_age": 5,
            "reading_level": "early",
            "theme": "Honesty & Wit",
            "setting_island": "Jamaica",
            "moral": "Trickery often leads to hungry bellies.",
            "estimated_minutes": 5
        },
        "folklore_profile": {
            "story_type": "folktale",
            "core_tradition": "Anansi",
            "character_templates": []
        },
        "structure": {
            "pages": [
                {
                    "page_number": 1,
                    "layout": "interactive",
                    "narrative_text": "Once upon a time in the lush hills of Jamaica, there lived a very clever spider named Anansi.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Gather round, me darlin! Let me tell you about that crafty spider...",
                        "roti_prompt": "Can you find the word Hills? It starts with the /h/ sound!"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Anansi", "Hills"]},
                    "illustration_url": "https://images.unsplash.com/photo-1596464716127-f2a82984de30"
                },
                {
                    "page_number": 2,
                    "layout": "interactive",
                    "narrative_text": "It was the time of the Great Yam Festival, and everyone was excited. But Anansi was also very hungry.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Oh, that Anansi! His stomach always leadin him into trouble.",
                        "roti_prompt": "Yam is a delicious root vegetable! Have you ever tried one?"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Yams", "Market"]},
                    "illustration_url": "https://images.unsplash.com/photo-1590779033100-9f60705a413b"
                }
            ]
        },
        "assessment": {
            "after_story_questions": [],
            "home_connection": {"family_activity": "Try making a yam dish together!", "language_flex": []}
        }
    }'::jsonb,
    'all', 'free', 'Jamaica', 5, true, 1
),
(
    '22222222-2222-2222-2222-222222222222', 
    'Papa Bois: The Forest Guardian', 
    'Learn about the protector of the woods and why we must respect nature.',
    '{
        "book_meta": {
            "id": "nature-001",
            "title": "Papa Bois: The Forest Guardian",
            "series": "Island Protectors",
            "language_variant": "en-CAR",
            "target_age": 7,
            "reading_level": "transitional",
            "theme": "Nature Preservation",
            "setting_island": "Trinidad and Tobago",
            "moral": "The forest provides for those who protect it.",
            "estimated_minutes": 6
        },
        "folklore_profile": {
            "story_type": "legend",
            "core_tradition": "Papa Bois",
            "character_templates": []
        },
        "structure": {
            "pages": [
                {
                    "page_number": 1,
                    "layout": "interactive",
                    "narrative_text": "In the deep, misty forests of Trinidad, lives a wise old man with hooves for feet.",
                    "guide_interventions": {
                        "tanty_spice_intro": "Listen close... you might hear his horn in the distance.",
                        "roti_prompt": "Misty means it is a bit foggy and hard to see. Can you say Misty?"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Forest", "Mist"]},
                    "illustration_url": "https://images.unsplash.com/photo-1518495973542-4542c06a5843"
                },
                {
                    "page_number": 2,
                    "layout": "interactive",
                    "narrative_text": "He is Papa Bois, the guardian of the animals. He watches over every parrot and every agouti.",
                    "guide_interventions": {
                        "tanty_spice_intro": "He don''t like when people bother his friends in the bush.",
                        "roti_prompt": "An agouti is a small animal that lives in the forest!"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Animals", "Papa Bois"]},
                    "illustration_url": "https://images.unsplash.com/photo-1544923246-77307dd654ca"
                }
            ]
        },
        "assessment": {
            "after_story_questions": [],
            "home_connection": {"family_activity": "Go on a nature walk and see what animals you can find.", "language_flex": []}
        }
    }'::jsonb,
    'big', 'free', 'Trinidad and Tobago', 6, true, 2
),
(
    '33333333-3333-3333-3333-333333333333', 
    'The Golden Comb of River Mumma', 
    'A mysterious tale about the protector of the rivers and the lesson of greed.',
    '{
        "book_meta": {
            "id": "mystery-001",
            "title": "The Golden Comb of River Mumma",
            "series": "Island Mysteries",
            "language_variant": "en-CAR",
            "target_age": 8,
            "reading_level": "transitional",
            "theme": "Respect for Mystery",
            "setting_island": "Guyana",
            "moral": "True beauty belongs to the water.",
            "estimated_minutes": 7
        },
        "folklore_profile": {
            "story_type": "myth",
            "core_tradition": "River Mumma",
            "character_templates": []
        },
        "structure": {
            "pages": [
                {
                    "page_number": 1,
                    "layout": "interactive",
                    "narrative_text": "Near the sparkling rivers of Guyana, people tell stories of a beautiful mermaid with skin like copper.",
                    "guide_interventions": {
                        "tanty_spice_intro": "The water has many secrets, and River Mumma keeps them all.",
                        "roti_prompt": "Copper is a shiny metal that looks a bit like gold but more orange!"
                    },
                    "illustration_brief": {"style": "vibrant", "must_include": ["Mermaid", "River"]},
                    "illustration_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21"
                }
            ]
        },
        "assessment": {
            "after_story_questions": [],
            "home_connection": {"family_activity": "Draw your own version of a river guardian.", "language_flex": []}
        }
    }'::jsonb,
    'big', 'legend', 'Guyana', 7, true, 3
);

-- 3. Seed Songs (Nursery Rhymes & Educational)
INSERT INTO public.songs (title, artist, description, lyrics, category, island_origin, age_track, is_active, display_order)
VALUES 
(
    'Brown Gal in de Ring', 
    'Island Legends Group', 
    'A traditional Caribbean ring game song enjoyed by children for generations.',
    'Brown girl in the ring, tra-la-la-la-la... There is a brown girl in the ring, tra-la-la-la-la...', 
    'nursery', 'Jamaica', 'all', true, 1
),
(
    'Mango Vert', 
    'Tanty Spice', 
    'A rhythmic song about the different stages of a mango and island fruits.',
    'Mango vert, mango tini... sweet mango, green mango!', 
    'cultural', 'Saint Lucia', 'mini', true, 2
),
(
    'ABC Island Beat', 
    'Steelpan Sam', 
    'Learn your alphabet with a catchy calypso rhythm.',
    'A is for Antigua, B for Barbados, C for Caribbean... come sing with us!', 
    'educational', 'all', 'mini', true, 3
);

-- 4. Seed Trainings (Videos/Lessons)
INSERT INTO public.videos (title, description, video_url, category, island_theme, age_track, tier_required, is_active, display_order)
VALUES 
(
    'Caribbean Phonics: The Letter S', 
    'ROTI teaches the /s/ sound using island words like Sea, Sand, and Sun.', 
    'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    'educational', 'General', 'mini', 'free', true, 1
),
(
    'Counting Mangoes with Tanty', 
    'Practice counting 1 to 10 while gathering delicious mangoes in the garden.', 
    'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    'educational', 'General', 'mini', 'free', true, 2
),
(
    'Respecting de Elders', 
    'A social-emotional lesson on traditional Caribbean manners and respect.', 
    'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    'cultural', 'General', 'all', 'free', true, 3
);

-- 6. UNIFIED V2 Sync (Seed content_items for unified portal)
INSERT INTO public.content_items (content_type, slug, title, island_code, track_tags, published)
VALUES 
('story', 'core-anansi-pot', 'Anansi and the Great Yam', 'JM', '["folklore", "tradition"]', true),
('story', 'core-papa-bois', 'Papa Bois: The Forest Guardian', 'TT', '["folklore", "nature"]', true),
('story', 'core-river-mumma', 'The Golden Comb of River Mumma', 'GY', '["folklore", "mystery"]', true),
('song', 'core-brown-gal', 'Brown Gal in de Ring', 'JM', '["music", "roots"]', true),
('video', 'lesson-phonics-s', 'Caribbean Phonics: The Letter S', 'all', '["alphabet", "phonics"]', true),
('video', 'lesson-counting-mangoes', 'Counting Mangoes with Tanty', 'all', '["math", "numbers"]', true),
('activity', 'lesson-respect', 'Respecting de Elders', 'all', '["sel", "manners"]', true)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, published = EXCLUDED.published;
