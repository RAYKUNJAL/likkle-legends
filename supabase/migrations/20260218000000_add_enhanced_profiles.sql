
-- =========================================================
-- Enhanced Profiles (V2)
-- =========================================================

-- FAMILY_PROFILE: Stores household-level preferences (culture, safety, language)
create table if not exists public.family_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Cultural & Regional
  home_islands text[] not null default '{}', -- e.g. ['Trinidad and Tobago','Grenada']
  preferred_language text not null default 'en',
  language_flavour text not null default 'caribbean_light', -- 'neutral','caribbean_light','creole_sprinkles'
  
  -- Safety & Values
  values_notes text, -- freeform: "Christian home", "no horror", etc.
  allow_scary_folklore boolean not null default false,
  allow_trickster_folklore boolean not null default true,
  max_story_length_pages int not null default 12,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHILD_PROFILE: Stores individual child preferences & traits
create table if not exists public.child_profile (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.family_profile(id) on delete cascade,
  
  child_name text not null,
  birthdate date,
  age_years int, -- denormalized for quick access (nullable if birthdate used)
  
  -- Learning Traits
  reading_level text, -- 'pre-reader','emerging','early-fluent'
  attention_span text default 'medium', -- 'short','medium','long'
  
  -- Interests
  favourite_topics text[] default '{}', -- ['ocean animals','Carnival']
  favourite_characters text[] default '{}', -- ['Tanty Spice','Anansi']
  favourite_colours text[] default '{}',
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHILD_LEARNING_STATE: Tracks progress/mastery per subject
create table if not exists public.child_learning_state (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profile(id) on delete cascade,
  
  subject text not null, -- 'Language Arts','Math','Science','HFLE'
  level_band text, -- 'A','B','C' or similar
  
  -- Stats
  total_books_generated int not null default 0,
  last_book_generated_at timestamptz,
  
  -- Context for Next Gen
  last_topics text[] default '{}', -- last 3–5 topic keywords
  preferred_islands text[] default '{}', -- if different from home_islands
  last_feedback text, -- 'loved it','too hard','too long'
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique(child_id, subject)
);

-- =========================================================
-- RLS for Enhanced Profiles
-- =========================================================

alter table public.family_profile enable row level security;
alter table public.child_profile enable row level security;
alter table public.child_learning_state enable row level security;

-- FAMILY_PROFILE Policies
create policy "family_profile_select_own" on public.family_profile
  for select using (user_id = auth.uid());

create policy "family_profile_insert_own" on public.family_profile
  for insert with check (user_id = auth.uid());

create policy "family_profile_update_own" on public.family_profile
  for update using (user_id = auth.uid());

create policy "family_profile_delete_own" on public.family_profile
  for delete using (user_id = auth.uid());

-- CHILD_PROFILE Policies (via family_id)
create policy "child_profile_select_own" on public.child_profile
  for select using (
    exists (
      select 1 from public.family_profile fp
      where fp.id = child_profile.family_id
      and fp.user_id = auth.uid()
    )
  );

create policy "child_profile_insert_own" on public.child_profile
  for insert with check (
    exists (
      select 1 from public.family_profile fp
      where fp.id = child_profile.family_id
      and fp.user_id = auth.uid()
    )
  );

create policy "child_profile_update_own" on public.child_profile
  for update using (
    exists (
      select 1 from public.family_profile fp
      where fp.id = child_profile.family_id
      and fp.user_id = auth.uid()
    )
  );

create policy "child_profile_delete_own" on public.child_profile
  for delete using (
    exists (
      select 1 from public.family_profile fp
      where fp.id = child_profile.family_id
      and fp.user_id = auth.uid()
    )
  );

-- CHILD_LEARNING_STATE Policies (via child_id -> family_id)
create policy "child_learning_state_select_own" on public.child_learning_state
  for select using (
    exists (
      select 1 from public.child_profile cp
      join public.family_profile fp on cp.family_id = fp.id
      where cp.id = child_learning_state.child_id
      and fp.user_id = auth.uid()
    )
  );

create policy "child_learning_state_insert_own" on public.child_learning_state
  for insert with check (
    exists (
      select 1 from public.child_profile cp
      join public.family_profile fp on cp.family_id = fp.id
      where cp.id = child_learning_state.child_id
      and fp.user_id = auth.uid()
    )
  );

create policy "child_learning_state_update_own" on public.child_learning_state
  for update using (
    exists (
      select 1 from public.child_profile cp
      join public.family_profile fp on cp.family_id = fp.id
      where cp.id = child_learning_state.child_id
      and fp.user_id = auth.uid()
    )
  );

create policy "child_learning_state_delete_own" on public.child_learning_state
  for delete using (
    exists (
      select 1 from public.child_profile cp
      join public.family_profile fp on cp.family_id = fp.id
      where cp.id = child_learning_state.child_id
      and fp.user_id = auth.uid()
    )
  );
