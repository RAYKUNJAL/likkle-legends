-- Child Character Chat Sessions
-- Stores per-child, per-character conversation history for AI buddy system

create table if not exists child_character_sessions (
    id uuid primary key default gen_random_uuid(),
    child_id uuid not null references children(id) on delete cascade,
    character_id text not null check (character_id in ('roti', 'tanty_spice', 'dilly_doubles')),
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamptz not null default now()
);

-- Fast retrieval: load recent messages for a child + character pair
create index if not exists idx_character_sessions_child_char_time
    on child_character_sessions (child_id, character_id, created_at desc);

-- RLS: parents can only read/write sessions for their own children
alter table child_character_sessions enable row level security;

create policy "Parents can manage their children's character sessions"
    on child_character_sessions
    using (
        child_id in (
            select id from children where parent_id = auth.uid()
        )
    )
    with check (
        child_id in (
            select id from children where parent_id = auth.uid()
        )
    );

-- Service role has full access (for API routes using supabaseAdmin)
create policy "Service role has full access to character sessions"
    on child_character_sessions
    to service_role
    using (true)
    with check (true);
