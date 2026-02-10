-- 20240210_gamification.sql
-- Gamification Schema for Likkle Legends

-- 1. Create Activities Table
create table if not exists public.activities (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    activity_type text not null, -- 'story_complete', 'song_listen', 'daily_login'
    xp_earned integer default 0,
    stars_earned integer default 0,
    metadata jsonb default '{}'::jsonb, -- Store story title, song id, etc.
    created_at timestamptz default now()
);

-- 2. Create Badge Definitions Table
create table if not exists public.badge_definitions (
    id text primary key, -- e.g., 'first_story', 'bookworm_1'
    name text not null,
    description text,
    icon text, -- emoji or url
    xp_bonus integer default 0,
    created_at timestamptz default now()
);

-- 3. Create Badge Earnings Table
create table if not exists public.badge_earnings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    badge_id text references public.badge_definitions(id) on delete cascade not null,
    earned_at timestamptz default now(),
    unique(user_id, badge_id) -- Prevent duplicate badges
);

-- 4. Enable Row Level Security (RLS)
alter table public.activities enable row level security;
alter table public.badge_definitions enable row level security;
alter table public.badge_earnings enable row level security;

-- 5. Create RLS Policies

-- Activities: Users can insert their own activity and view their own
create policy "Users can insert their own activities"
on public.activities for insert
with check (auth.uid() = user_id);

create policy "Users can view their own activities"
on public.activities for select
using (auth.uid() = user_id);

-- Badge Definitions: Publicly readable, only admins can insert (assumed service role)
create policy "Badge definitions are viewable by everyone"
on public.badge_definitions for select
using (true);

-- Badge Earnings: Users can view their own badges, system inserts
create policy "Users can view their own badges"
on public.badge_earnings for select
using (auth.uid() = user_id);

-- 6. Initial Seed Data for Badges
insert into public.badge_definitions (id, name, description, icon, xp_bonus)
values
    ('first_story', 'Story Starter', 'Completed your first interactive story!', '📖', 50),
    ('music_lover', 'Music Lover', 'Listened to your first Caribbean song.', '🎵', 30),
    ('streak_3', 'On Fire!', 'Logged in for 3 days in a row.', '🔥', 100),
    ('bookworm', 'Bookworm', 'Read 5 stories.', '🐛', 150)
on conflict (id) do nothing;
