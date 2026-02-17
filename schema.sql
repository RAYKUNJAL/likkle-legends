-- =========================================================
-- Extensions
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- Enums
-- =========================================================
do $$ begin
  create type public.user_role as enum ('parent','teacher','grandparent','caregiver','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.preferred_channel as enum ('email','whatsapp');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.location_type as enum ('Caribbean','Diaspora');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.child_age_band as enum ('0-2','3-5','6-9','10-12');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.family_role as enum ('parent','grandparent','guardian');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('active','trialing','canceled','past_due');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_provider as enum ('stripe','paypal','manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_type as enum ('story','song','game','activity','resource_pdf');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.dialect_type as enum ('standard_english','local_dialect');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

-- =========================================================
-- Helper: current user id
-- =========================================================
create or replace function public.uid()
returns uuid language sql stable as $$
  select auth.uid();
$$;

-- =========================================================
-- Users (profile)
-- =========================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  role public.user_role not null default 'parent',
  first_name text,

  email text unique,
  whatsapp_number text unique,

  origin_island text,
  preferred_island_code text,

  location_type public.location_type,
  country_city text,

  consent_marketing boolean not null default false,
  marketing_opt_in_whatsapp boolean not null default false,
  preferred_channel public.preferred_channel not null default 'email'
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_origin_island on public.users(origin_island);
create index if not exists idx_users_preferred_island_code on public.users(preferred_island_code);

-- =========================================================
-- Interests
-- =========================================================
create table if not exists public.interests_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table if not exists public.user_interests (
  user_id uuid not null references public.users(id) on delete cascade,
  interest_id uuid not null references public.interests_catalog(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

create index if not exists idx_user_interests_interest on public.user_interests(interest_id);

-- Seed interests (idempotent)
insert into public.interests_catalog (slug,label) values
  ('stories','Stories'),
  ('music','Music'),
  ('games','Games'),
  ('stem','STEM'),
  ('heritage','Heritage'),
  ('printables','Printables')
on conflict (slug) do update set label = excluded.label;

-- =========================================================
-- Family Groups + Members (Family Legacy + grandparent access)
-- =========================================================
create table if not exists public.family_groups (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'Family',
  created_at timestamptz not null default now()
);

create index if not exists idx_family_groups_owner on public.family_groups(owner_user_id);

create table if not exists public.family_members (
  family_group_id uuid not null references public.family_groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role_in_family public.family_role not null default 'parent',
  policy_permissions jsonb not null default jsonb_build_object('view_progress', true, 'edit_child', false),
  created_at timestamptz not null default now(),
  primary key (family_group_id, user_id)
);

create index if not exists idx_family_members_user on public.family_members(user_id);

-- =========================================================
-- Children
-- =========================================================
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  family_group_id uuid references public.family_groups(id) on delete set null,
  primary_user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  age_band public.child_age_band not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_children_primary_user on public.children(primary_user_id);
create index if not exists idx_children_family_group on public.children(family_group_id);

-- =========================================================
-- Subscriptions
-- =========================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  plan_id text not null,
  status public.subscription_status not null default 'trialing',
  provider public.payment_provider not null default 'stripe',

  provider_customer_id text,
  provider_subscription_id text,

  current_period_end timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_plan on public.subscriptions(plan_id);

-- =========================================================
-- Content (Dialect Dial + Island Tracks)
-- =========================================================
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_type public.content_type not null,
  slug text not null unique,
  title text not null,

  island_code text,              -- e.g. TT, JM, HT
  track_tags jsonb,              -- flexible tags like ["folklore","math","abc"]
  has_dialect_toggle boolean not null default false,

  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_items_type on public.content_items(content_type);
create index if not exists idx_content_items_island on public.content_items(island_code);
create index if not exists idx_content_items_published on public.content_items(published);

create table if not exists public.content_localizations (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,

  dialect_type public.dialect_type not null,
  language_code text not null default 'en',

  display_title text not null,
  body_text text,
  audio_url text,

  created_at timestamptz not null default now(),

  unique (content_item_id, dialect_type, language_code)
);

create index if not exists idx_content_localizations_item on public.content_localizations(content_item_id);
create index if not exists idx_content_localizations_dialect on public.content_localizations(dialect_type);

-- =========================================================
-- Progress
-- =========================================================
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,

  completed_at timestamptz not null default now(),
  score numeric,

  unique (child_id, content_item_id)
);

create index if not exists idx_progress_child on public.progress(child_id);

-- =========================================================
-- AI Usage (enforce plan limits)
-- =========================================================
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  feature text not null default 'story_studio',
  used_at timestamptz not null default now(),
  metadata jsonb
);

create index if not exists idx_ai_usage_user on public.ai_usage(user_id);
create index if not exists idx_ai_usage_used_at on public.ai_usage(used_at);

-- =========================================================
-- Educators
-- =========================================================
create table if not exists public.educator_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  school_name text not null,
  teacher_count integer not null default 1,
  student_count integer not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_educator_accounts_verified on public.educator_accounts(verified);

create table if not exists public.educator_verification_requests (
  id uuid primary key default gen_random_uuid(),
  educator_account_id uuid not null references public.educator_accounts(id) on delete cascade,
  status public.verification_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_edu_verify_status on public.educator_verification_requests(status);

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  educator_account_id uuid not null references public.educator_accounts(id) on delete cascade,
  code text not null unique,
  uses integer not null default 0,
  max_uses integer not null default 30,
  expires_at timestamptz
);

create index if not exists idx_invite_codes_educator on public.invite_codes(educator_account_id);

-- =========================================================
-- Events (anonymous + identified)
-- =========================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  anon_session_id text,
  user_id uuid references public.users(id) on delete set null,
  event_name text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_user on public.events(user_id);
create index if not exists idx_events_anon on public.events(anon_session_id);
create index if not exists idx_events_name on public.events(event_name);

-- =========================================================
-- RLS ENABLE
-- =========================================================
alter table public.users enable row level security;
alter table public.user_interests enable row level security;
alter table public.family_groups enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;
alter table public.subscriptions enable row level security;
alter table public.progress enable row level security;
alter table public.ai_usage enable row level security;
alter table public.educator_accounts enable row level security;
alter table public.educator_verification_requests enable row level security;
alter table public.invite_codes enable row level security;
alter table public.events enable row level security;
-- content tables can be public read; still enable RLS for consistency
alter table public.content_items enable row level security;
alter table public.content_localizations enable row level security;
alter table public.interests_catalog enable row level security;

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- USERS: user can read/update own profile; admin can read all
create policy "users_select_own"
on public.users for select
using (id = public.uid());

create policy "users_update_own"
on public.users for update
using (id = public.uid())
with check (id = public.uid());

-- INTERESTS_CATALOG: readable by all (public)
create policy "interests_catalog_select_all"
on public.interests_catalog for select
using (true);

-- USER_INTERESTS: user can manage their own
create policy "user_interests_select_own"
on public.user_interests for select
using (user_id = public.uid());

create policy "user_interests_insert_own"
on public.user_interests for insert
with check (user_id = public.uid());

create policy "user_interests_delete_own"
on public.user_interests for delete
using (user_id = public.uid());

-- FAMILY_GROUPS: owner can CRUD; members can SELECT (via membership)
create policy "family_groups_select_owner_or_member"
on public.family_groups for select
using (
  owner_user_id = public.uid()
  or exists (
    select 1 from public.family_members fm
    where fm.family_group_id = family_groups.id
      and fm.user_id = public.uid()
  )
);

create policy "family_groups_insert_owner_only"
on public.family_groups for insert
with check (owner_user_id = public.uid());

create policy "family_groups_update_owner_only"
on public.family_groups for update
using (owner_user_id = public.uid())
with check (owner_user_id = public.uid());

create policy "family_groups_delete_owner_only"
on public.family_groups for delete
using (owner_user_id = public.uid());

-- FAMILY_MEMBERS: owner can manage; member can read their membership
create policy "family_members_select_owner_or_self"
on public.family_members for select
using (
  user_id = public.uid()
  or exists (
    select 1 from public.family_groups fg
    where fg.id = family_members.family_group_id
      and fg.owner_user_id = public.uid()
  )
);

create policy "family_members_insert_owner_only"
on public.family_members for insert
with check (
  exists (
    select 1 from public.family_groups fg
    where fg.id = family_members.family_group_id
      and fg.owner_user_id = public.uid()
  )
);

create policy "family_members_update_owner_only"
on public.family_members for update
using (
  exists (
    select 1 from public.family_groups fg
    where fg.id = family_members.family_group_id
      and fg.owner_user_id = public.uid()
  )
)
with check (
  exists (
    select 1 from public.family_groups fg
    where fg.id = family_members.family_group_id
      and fg.owner_user_id = public.uid()
  )
);

create policy "family_members_delete_owner_only"
on public.family_members for delete
using (
  exists (
    select 1 from public.family_groups fg
    where fg.id = family_members.family_group_id
      and fg.owner_user_id = public.uid()
  )
);

-- CHILDREN: primary owner OR family members with permission can read; only owner can edit by default
create policy "children_select_owner_or_family"
on public.children for select
using (
  primary_user_id = public.uid()
  or (
    family_group_id is not null
    and exists (
      select 1 from public.family_members fm
      where fm.family_group_id = children.family_group_id
        and fm.user_id = public.uid()
        and (fm.policy_permissions->>'view_progress')::boolean = true
    )
  )
);

create policy "children_insert_owner_only"
on public.children for insert
with check (primary_user_id = public.uid());

create policy "children_update_owner_or_family_with_edit"
on public.children for update
using (
  primary_user_id = public.uid()
  or (
    family_group_id is not null
    and exists (
      select 1 from public.family_members fm
      where fm.family_group_id = children.family_group_id
        and fm.user_id = public.uid()
        and (fm.policy_permissions->>'edit_child')::boolean = true
    )
  )
)
with check (
  primary_user_id = public.uid()
  or (
    family_group_id is not null
    and exists (
      select 1 from public.family_members fm
      where fm.family_group_id = children.family_group_id
        and fm.user_id = public.uid()
        and (fm.policy_permissions->>'edit_child')::boolean = true
    )
  )
);

-- SUBSCRIPTIONS: user can read own; writes typically via server (service role)
create policy "subscriptions_select_own"
on public.subscriptions for select
using (user_id = public.uid());

-- PROGRESS: owner or family member with view permission can read; only owner/editors can write
create policy "progress_select_owner_or_family"
on public.progress for select
using (
  exists (
    select 1
    from public.children c
    where c.id = progress.child_id
      and (
        c.primary_user_id = public.uid()
        or (
          c.family_group_id is not null
          and exists (
            select 1 from public.family_members fm
            where fm.family_group_id = c.family_group_id
              and fm.user_id = public.uid()
              and (fm.policy_permissions->>'view_progress')::boolean = true
          )
        )
      )
  )
);

create policy "progress_insert_owner_or_family_with_edit"
on public.progress for insert
with check (
  exists (
    select 1
    from public.children c
    where c.id = progress.child_id
      and (
        c.primary_user_id = public.uid()
        or (
          c.family_group_id is not null
          and exists (
            select 1 from public.family_members fm
            where fm.family_group_id = c.family_group_id
              and fm.user_id = public.uid()
              and (fm.policy_permissions->>'edit_child')::boolean = true
          )
        )
      )
  )
);

-- AI_USAGE: user can read own; insert via server or client (if allowed)
create policy "ai_usage_select_own"
on public.ai_usage for select
using (user_id = public.uid());

create policy "ai_usage_insert_own"
on public.ai_usage for insert
with check (user_id = public.uid());

-- EDUCATOR_ACCOUNTS: teacher can read own; admin/service writes verify status
create policy "educator_accounts_select_own"
on public.educator_accounts for select
using (user_id = public.uid());

create policy "educator_accounts_insert_own"
on public.educator_accounts for insert
with check (user_id = public.uid());

-- VERIFICATION REQUESTS: teacher can read their own request; admin reviews via service role
create policy "edu_verification_select_own"
on public.educator_verification_requests for select
using (
  exists (
    select 1 from public.educator_accounts ea
    where ea.id = educator_verification_requests.educator_account_id
      and ea.user_id = public.uid()
  )
);

-- INVITE_CODES: teacher can read codes for their educator account
create policy "invite_codes_select_teacher_own"
on public.invite_codes for select
using (
  exists (
    select 1 from public.educator_accounts ea
    where ea.id = invite_codes.educator_account_id
      and ea.user_id = public.uid()
  )
);

-- EVENTS: user can read their own events; anon events readable only after merge (user_id set)
create policy "events_select_own"
on public.events for select
using (user_id = public.uid());

create policy "events_insert_anon_or_own"
on public.events for insert
with check (
  (user_id is null and anon_session_id is not null)
  or (user_id = public.uid())
);

-- CONTENT: public read for published content
create policy "content_items_select_published"
on public.content_items for select
using (published = true);

create policy "content_localizations_select_public"
on public.content_localizations for select
using (
  exists (
    select 1 from public.content_items ci
    where ci.id = content_localizations.content_item_id
      and ci.published = true
  )
);
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
