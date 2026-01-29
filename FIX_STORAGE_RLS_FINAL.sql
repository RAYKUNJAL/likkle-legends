-- FIX_STORAGE_RLS_FINAL.sql
-- Enables robust RLS policies for storage buckets supporting Admin workflows
-- 1. Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;
-- 2. Create Performance Index (Recommended)
create index if not exists idx_storage_objects_bucket on storage.objects(bucket_id);
-- 3. Drop existing policies to avoid conflicts (clean slate)
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
-- 4. Create Permissive Policies for Authenticated Users (Commercial Grade Admin)
-- We allow authenticated users (Admins) to upload to ANY folder in these buckets.
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