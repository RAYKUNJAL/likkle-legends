-- FIX_STORAGE_RLS_MINIMAL.sql
-- This script avoids "ALTER TABLE" which requires owner permissions.
-- It focuses only on updating the policies.
-- 1. Drop existing policies to avoid conflicts (if you have permissions to do so)
-- If these fail, you can comment them out and just run the CREATE POLICY steps.
drop policy if exists "Give users access to own folder 1qcdi6c_0" on storage.objects;
drop policy if exists "Give users access to own folder 1qcdi6c_1" on storage.objects;
drop policy if exists "Give users access to own folder 1qcdi6c_2" on storage.objects;
drop policy if exists "Give users access to own folder 1qcdi6c_3" on storage.objects;
drop policy if exists "Start fresh: Allow authenticated uploads" on storage.objects;
drop policy if exists "Start fresh: Allow authenticated updates" on storage.objects;
drop policy if exists "Start fresh: Allow authenticated deletes" on storage.objects;
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow authenticated updates" on storage.objects;
drop policy if exists "Allow authenticated deletes" on storage.objects;
drop policy if exists "Allow public viewing" on storage.objects;
drop policy if exists "Authenticated Admin Upload" on storage.objects;
drop policy if exists "Authenticated Admin Update" on storage.objects;
drop policy if exists "Authenticated Admin Delete" on storage.objects;
drop policy if exists "Public Read Access" on storage.objects;
-- 2. Create Permissive Policies for Authenticated Users (Commercial Grade Admin)
-- POLICY: Authenticated users can INSERT (Upload) to permitted buckets
create policy "Authenticated Admin Upload" on storage.objects for
insert to authenticated with check (
        bucket_id = ANY (
            ARRAY [
    'characters', 'songs', 'videos', 'storybooks', 'printables', 'avatars', 'vr-assets', 'ar-models'
  ]
        )
    );
-- POLICY: Authenticated users can UPDATE any file in these buckets
create policy "Authenticated Admin Update" on storage.objects for
update to authenticated using (
        bucket_id = ANY (
            ARRAY [
    'characters', 'songs', 'videos', 'storybooks', 'printables', 'avatars', 'vr-assets', 'ar-models'
  ]
        )
    );
-- POLICY: Authenticated users can DELETE any file in these buckets
create policy "Authenticated Admin Delete" on storage.objects for delete to authenticated using (
    bucket_id = ANY (
        ARRAY [
    'characters', 'songs', 'videos', 'storybooks', 'printables', 'avatars', 'vr-assets', 'ar-models'
  ]
    )
);
-- POLICY: Public can SELECT (Read) from these buckets
create policy "Public Read Access" on storage.objects for
select to public using (
        bucket_id = ANY (
            ARRAY [
    'characters', 'songs', 'videos', 'storybooks', 'printables', 'avatars', 'vr-assets', 'ar-models'
  ]
        )
    );