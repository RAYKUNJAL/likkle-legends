-- CLEANUP_LAUNCH_READY.sql
-- Clear content tables while preserving characters that the user created
DELETE FROM public.product_bundles;
DELETE FROM public.songs;
DELETE FROM public.storybooks;
DELETE FROM public.printables;
DELETE FROM public.missions;
DELETE FROM public.videos;
DELETE FROM public.games;
DELETE FROM public.vr_locations;
DELETE FROM public.curriculum_nodes;
-- 5. Keep Characters but clear sample bio data if needed, 
-- or just delete all if they are meant to be re-created via Admin.
-- For now, deleting all to allow a fresh "Village" setup.
-- DELETE FROM public.characters; -- Removed to preserve user-created assets
-- 6. Optional: Reset search indexing or other caches if applicable
-- (Specific to Supabase setup if used)
-- 7. Reset Profiles to 'free' or clear test profiles (BE CAREFUL)
-- DELETE FROM public.profiles WHERE email LIKE '%@test.com' OR email = 'placeholder@example.com';
-- Verify counts
SELECT (
        SELECT count(*)
        FROM songs
    ) as songs_count,
    (
        SELECT count(*)
        FROM storybooks
    ) as stories_count,
    (
        SELECT count(*)
        FROM characters
    ) as characters_count,
    (
        SELECT count(*)
        FROM printables
    ) as printables_count;