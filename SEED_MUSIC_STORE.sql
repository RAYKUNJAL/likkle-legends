-- 1) Ensure 'url' exists for frontend compatibility
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS url TEXT;
-- 2) Upsert sample songs with correct columns
INSERT INTO public.songs (
        id,
        title,
        artist,
        url,
        audio_url,
        duration_seconds,
        thumbnail_url
    )
VALUES (
        'd290f1ee-6c54-4b01-90e6-d701748f0851',
        'Island Morning',
        'Likkle Legends',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        180,
        'https://images.unsplash.com/photo-1598155523122-3842334d6c10?w=800&auto=format&fit=crop&q=60'
    ),
    (
        'd290f1ee-6c54-4b01-90e6-d701748f0852',
        'Mango Seasons',
        'Tanty Vibes',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        210,
        'https://images.unsplash.com/photo-1542619087-dc139c279d47?w=800&auto=format&fit=crop&q=60'
    ),
    (
        'd290f1ee-6c54-4b01-90e6-d701748f0853',
        'Steel Pan Jam',
        'Calypso Kid',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        240,
        'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&auto=format&fit=crop&q=60'
    ),
    (
        'd290f1ee-6c54-4b01-90e6-d701748f0854',
        'Soca Dance Party',
        'Island Rhythms',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        195,
        'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=800&auto=format&fit=crop&q=60'
    ),
    (
        'd290f1ee-6c54-4b01-90e6-d701748f0855',
        'Sunset Lullaby',
        'Mama Joy',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        300,
        'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60'
    ) ON CONFLICT (id) DO
UPDATE
SET url = EXCLUDED.url,
    audio_url = EXCLUDED.audio_url,
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    duration_seconds = EXCLUDED.duration_seconds,
    thumbnail_url = EXCLUDED.thumbnail_url;
-- 3) Upsert bundle pointing to those songs
INSERT INTO public.product_bundles (
        id,
        title,
        description,
        price,
        content_ids,
        is_active
    )
VALUES (
        'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
        'Island Jams Bundle',
        'Get our top 5 most popular dance tracks in one pack!',
        3.99,
        ARRAY [
    'd290f1ee-6c54-4b01-90e6-d701748f0851'::uuid,
    'd290f1ee-6c54-4b01-90e6-d701748f0852'::uuid,
    'd290f1ee-6c54-4b01-90e6-d701748f0853'::uuid,
    'd290f1ee-6c54-4b01-90e6-d701748f0854'::uuid,
    'd290f1ee-6c54-4b01-90e6-d701748f0855'::uuid
  ],
        true
    ) ON CONFLICT (id) DO
UPDATE
SET title = EXCLUDED.title,
    content_ids = EXCLUDED.content_ids;