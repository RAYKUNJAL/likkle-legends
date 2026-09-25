-- Journey Stories picture queue.
-- Rows are the source of truth. Claim with FOR UPDATE SKIP LOCKED.
-- Product name stays Journey Stories. Not a trademarked social-story table.

create table if not exists public.journey_stories (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'ready', 'published', 'archived')),
  scenario_id text not null,
  scenario_label text not null default '',
  language_mode text not null default 'standard' check (language_mode in ('standard', 'literal')),
  point_of_view text not null default 'third' check (point_of_view in ('first', 'third')),
  cast_character_ids text[] not null default '{}',
  library_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journey_stories add column if not exists library_key text;

create index if not exists journey_stories_library_key
  on public.journey_stories (library_key)
  where status = 'published';

create table if not exists public.journey_story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.journey_stories (id) on delete cascade,
  page_index int not null check (page_index >= 0 and page_index < 5),
  role text not null,
  title text,
  body text not null,
  image_url text,
  image_status text not null default 'pending' check (image_status in ('pending', 'ready', 'failed', 'reused')),
  image_error text,
  updated_at timestamptz not null default now(),
  unique (story_id, page_index)
);

create table if not exists public.journey_story_jobs (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.journey_stories (id) on delete cascade,
  page_index int,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  phase text not null default 'pending' check (phase in ('pending', 'generating_text', 'illustrating', 'ready', 'failed')),
  attempts int not null default 0,
  last_error text,
  request jsonb,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  finished_at timestamptz,
  check (page_index is null or (page_index >= 0 and page_index < 5))
);

alter table public.journey_story_jobs add column if not exists phase text not null default 'pending';
alter table public.journey_story_jobs add column if not exists request jsonb;

create index if not exists journey_story_jobs_queued
  on public.journey_story_jobs (created_at)
  where status = 'queued';

alter table public.journey_story_pages replica identity full;

alter table public.journey_stories enable row level security;
alter table public.journey_story_pages enable row level security;
alter table public.journey_story_jobs enable row level security;

-- Page picture fields stream to the parent wizard. Story text stays off the anon select list.
grant select (id, story_id, page_index, role, image_url, image_status, updated_at)
  on public.journey_story_pages to anon, authenticated;

drop policy if exists journey_story_pages_select on public.journey_story_pages;
create policy journey_story_pages_select
  on public.journey_story_pages
  for select
  to anon, authenticated
  using (true);

-- Jobs and story rows are service-role only (worker + adult API).

create or replace function public.claim_journey_story_job()
returns setof public.journey_story_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.journey_story_jobs;
begin
  select *
    into claimed
  from public.journey_story_jobs
  where status = 'queued'
     or (
       status = 'running'
       and claimed_at < now() - interval '15 minutes'
       and attempts < 8
     )
  order by case when status = 'queued' then 0 else 1 end, created_at
  for update skip locked
  limit 1;

  if not found then
    return;
  end if;

  update public.journey_story_jobs
  set status = 'running',
      phase = 'illustrating',
      attempts = attempts + 1,
      claimed_at = now()
  where id = claimed.id
  returning * into claimed;

  return next claimed;
end;
$$;

revoke all on function public.claim_journey_story_job() from public, anon, authenticated;
grant execute on function public.claim_journey_story_job() to service_role;

-- A stuck row can be claimed again by id. The on-host worker uses claim_journey_story_job().
create or replace function public.claim_journey_story_job_by_id(target uuid)
returns setof public.journey_story_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.journey_story_jobs;
begin
  select *
    into claimed
  from public.journey_story_jobs
  where id = target
    and (
      status = 'queued'
      or (
        status = 'running'
        and claimed_at < now() - interval '3 minutes'
        and attempts < 8
      )
      or (status = 'failed' and attempts < 8)
    )
  for update skip locked;

  if not found then
    return;
  end if;

  update public.journey_story_jobs
  set status = 'running',
      phase = 'illustrating',
      attempts = attempts + 1,
      claimed_at = now(),
      finished_at = null,
      last_error = null
  where id = claimed.id
  returning * into claimed;

  return next claimed;
end;
$$;

revoke all on function public.claim_journey_story_job_by_id(uuid) from public, anon, authenticated;
grant execute on function public.claim_journey_story_job_by_id(uuid) to service_role;

do $$
begin
  alter publication supabase_realtime add table public.journey_story_pages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
