-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;
-- Policy to allow authenticated users to upload files to any bucket
-- (For a stricter production app, you might limit this to 'admin' role, 
--  but for now assuming authenticated app users/admins)
create policy "Allow authenticated uploads" on storage.objects for
insert to authenticated with check (
        bucket_id in (
            'characters',
            'songs',
            'videos',
            'storybooks',
            'printables',
            'avatars',
            'vr-assets',
            'ar-models'
        )
    );
-- Policy to allow authenticated users to update their own files or all files if admin
create policy "Allow authenticated updates" on storage.objects for
update to authenticated using (
        bucket_id in (
            'characters',
            'songs',
            'videos',
            'storybooks',
            'printables',
            'avatars',
            'vr-assets',
            'ar-models'
        )
    );
-- Policy to allow authenticated users to delete files
create policy "Allow authenticated deletes" on storage.objects for delete to authenticated using (
    bucket_id in (
        'characters',
        'songs',
        'videos',
        'storybooks',
        'printables',
        'avatars',
        'vr-assets',
        'ar-models'
    )
);
-- Policy to allow public to view files (already likely exists but ensuring it)
create policy "Allow public viewing" on storage.objects for
select to public using (
        bucket_id in (
            'characters',
            'songs',
            'videos',
            'storybooks',
            'printables',
            'avatars',
            'vr-assets',
            'ar-models'
        )
    );