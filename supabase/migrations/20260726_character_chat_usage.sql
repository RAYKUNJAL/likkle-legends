-- Character Chat Usage Tracking
-- Tracks per-child, per-character daily chat usage for free trial features
-- (e.g. Tanty Spice 5 free chats/day)

create table if not exists character_chat_usage (
    id uuid primary key default gen_random_uuid(),
    child_id uuid not null references children(id) on delete cascade,
    character_id text not null,
    chat_date date not null,
    chat_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (child_id, character_id, chat_date)
);

-- Fast lookups: get today's usage for a child + character
create index if not exists idx_character_chat_usage_child_char_date
    on character_chat_usage (child_id, character_id, chat_date desc);

-- RLS: parents can only read usage for their own children
alter table character_chat_usage enable row level security;

create policy "Parents can read their children's character chat usage"
    on character_chat_usage
    for select
    using (
        child_id in (
            select id from children where parent_id = auth.uid()
        )
    );

-- Service role has full access (for API routes using supabaseAdmin)
create policy "Service role has full access to character chat usage"
    on character_chat_usage
    to service_role
    using (true)
    with check (true);

-- Auto-update updated_at on changes
create or replace function update_character_chat_usage_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_character_chat_usage_updated
    on character_chat_usage;

create trigger trg_character_chat_usage_updated
    before update on character_chat_usage
    for each row execute function update_character_chat_usage_timestamp();
