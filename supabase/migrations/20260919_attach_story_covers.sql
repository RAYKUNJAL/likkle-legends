-- Attach public cover art for the 12 live stories_library books.
-- Safe to re-run. Does not invent titles or change story body text.

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/the-river-mummas-gift.png',
    updated_at = now()
WHERE slug = 'the-river-mummas-gift';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/dilly-doubles-and-the-carnival-king.png',
    updated_at = now()
WHERE slug = 'dilly-doubles-and-the-carnival-king';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/the-chickcharneys-lesson.png',
    updated_at = now()
WHERE slug = 'the-chickcharneys-lesson';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/the-mermaid-of-carlisle-bay.png',
    updated_at = now()
WHERE slug = 'the-mermaid-of-carlisle-bay';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/steelpan-sam-and-the-rhythm-of-the-rain.png',
    updated_at = now()
WHERE slug = 'steelpan-sam-and-the-rhythm-of-the-rain';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/anansi-and-the-mango-tree.png',
    updated_at = now()
WHERE slug = 'anansi-and-the-mango-tree';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/the-legend-of-the-silk-cotton-tree.png',
    updated_at = now()
WHERE slug = 'the-legend-of-the-silk-cotton-tree';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/papa-bois-and-the-lost-fawn.png',
    updated_at = now()
WHERE slug = 'papa-bois-and-the-lost-fawn';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/the-rolling-calf-of-green-bay.png',
    updated_at = now()
WHERE slug = 'the-rolling-calf-of-green-bay';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/mango-moko-and-the-garden-race.png',
    updated_at = now()
WHERE slug = 'mango-moko-and-the-garden-race';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/roti-and-the-lost-words.png',
    updated_at = now()
WHERE slug = 'roti-and-the-lost-words';

UPDATE public.stories_library
SET cover_image_url = '/images/story-covers/tanty-spice-and-the-pepper-sauce-secret.png',
    updated_at = now()
WHERE slug = 'tanty-spice-and-the-pepper-sauce-secret';
