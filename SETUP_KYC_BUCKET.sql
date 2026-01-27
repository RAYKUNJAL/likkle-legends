-- 1) Column: add if missing
alter table public.promoter_applications
add column if not exists id_document_url text;
-- 2) Create/Upsert PRIVATE bucket for KYC Documents
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false) on conflict (id) do
update
set name = excluded.name,
    public = excluded.public;
-- 3) Policies on storage.objects
-- Convention: objects uploaded to "user_id/filename"
-- Guard: ensure first path segment equals auth.uid()
-- INSERT: allow authenticated users to upload into their own folder only
drop policy if exists "Users can upload their own KYC docs" on storage.objects;
create policy "Users can upload their own KYC docs" on storage.objects for
insert to authenticated with check (
        bucket_id = 'kyc-documents'
        and array_length(storage.foldername(name), 1) >= 1
        and (storage.foldername(name)) [1] = (
            select auth.uid()
        )::text
    );
-- SELECT: allow users to list/view only their own files
drop policy if exists "Users can view their own KYC docs" on storage.objects;
create policy "Users can view their own KYC docs" on storage.objects for
select to authenticated using (
        bucket_id = 'kyc-documents'
        and array_length(storage.foldername(name), 1) >= 1
        and (storage.foldername(name)) [1] = (
            select auth.uid()
        )::text
    );
-- UPDATE: allow users to update/move only if both old and new paths stay in their folder
drop policy if exists "Users can update their own KYC docs" on storage.objects;
create policy "Users can update their own KYC docs" on storage.objects for
update to authenticated using (
        bucket_id = 'kyc-documents'
        and array_length(storage.foldername(name), 1) >= 1
        and (storage.foldername(name)) [1] = (
            select auth.uid()
        )::text
    ) with check (
        bucket_id = 'kyc-documents'
        and array_length(storage.foldername(name), 1) >= 1
        and (storage.foldername(name)) [1] = (
            select auth.uid()
        )::text
    );
-- DELETE: allow users to delete only files in their own folder
drop policy if exists "Users can delete their own KYC docs" on storage.objects;
create policy "Users can delete their own KYC docs" on storage.objects for delete to authenticated using (
    bucket_id = 'kyc-documents'
    and array_length(storage.foldername(name), 1) >= 1
    and (storage.foldername(name)) [1] = (
        select auth.uid()
    )::text
);