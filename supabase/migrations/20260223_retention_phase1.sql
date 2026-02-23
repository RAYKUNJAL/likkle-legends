-- ============================================================
-- Phase 1 Retention Mechanics: Streaks, Freeze, Daily Chest
-- Run in Supabase SQL Editor after deploying this migration
-- ============================================================

-- 1. Daily Login Tracker
-- One row per child per day they visited the portal
CREATE TABLE IF NOT EXISTS daily_logins (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id      uuid        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    login_date    date        NOT NULL DEFAULT CURRENT_DATE,
    xp_awarded    int         NOT NULL DEFAULT 0,
    streak_day    int         NOT NULL DEFAULT 1,
    badge_earned  text,       -- badge ID if a milestone badge was triggered
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE(child_id, login_date)
);

CREATE INDEX IF NOT EXISTS daily_logins_child_date ON daily_logins(child_id, login_date DESC);

-- 2. Streak Freeze Inventory
-- One row per child (upserted), tracks how many freezes they have banked
CREATE TABLE IF NOT EXISTS streak_freezes (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id     uuid        NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    freeze_count int         NOT NULL DEFAULT 0,
    updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 3. Daily Reward Chests
-- One chest per child per day; unlocked_at is null until opened
CREATE TABLE IF NOT EXISTS reward_chests (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id      uuid        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    chest_date    date        NOT NULL DEFAULT CURRENT_DATE,
    unlocked_at   timestamptz,              -- null = still locked
    reward_type   text,                     -- 'xp' | 'badge' | 'cosmetic'
    reward_value  text,                     -- xp amount string or badge/cosmetic id
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE(child_id, chest_date)
);

CREATE INDEX IF NOT EXISTS reward_chests_child_date ON reward_chests(child_id, chest_date DESC);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE daily_logins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_chests  ENABLE ROW LEVEL SECURITY;

-- Parents can read/write their children's retention rows
CREATE POLICY "Parent can manage daily_logins"
    ON daily_logins FOR ALL
    USING (
        child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
    );

CREATE POLICY "Parent can manage streak_freezes"
    ON streak_freezes FOR ALL
    USING (
        child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
    );

CREATE POLICY "Parent can manage reward_chests"
    ON reward_chests FOR ALL
    USING (
        child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
    );

-- Service role bypass (for server actions using admin client)
CREATE POLICY "Service role bypass daily_logins"
    ON daily_logins FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass streak_freezes"
    ON streak_freezes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass reward_chests"
    ON reward_chests FOR ALL TO service_role USING (true) WITH CHECK (true);
