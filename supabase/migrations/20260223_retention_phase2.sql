-- ============================================================
-- Phase 2: Friend Invites + Family Challenges
-- ============================================================

-- 1. Referrals table
-- One row per invite link created by a parent
CREATE TABLE IF NOT EXISTS referrals (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ref_code        text        NOT NULL UNIQUE,
    ref_type        text        NOT NULL DEFAULT 'friend', -- 'friend' | 'family'
    clicks          int         NOT NULL DEFAULT 0,
    conversions     int         NOT NULL DEFAULT 0,
    xp_earned       int         NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_code ON referrals(ref_code);

-- 2. Referral conversions log
-- Created when a new user signs up with a ref code
CREATE TABLE IF NOT EXISTS referral_conversions (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id     uuid        NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    referred_user   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    xp_awarded      int         NOT NULL DEFAULT 0,
    converted_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE(referred_user) -- one conversion per new user
);

-- 3. Family Challenges table
-- Parent creates a challenge for one or more children
CREATE TABLE IF NOT EXISTS family_challenges (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           text        NOT NULL,
    description     text,
    challenge_type  text        NOT NULL DEFAULT 'read_stories', -- 'read_stories' | 'earn_xp' | 'beat_streak' | 'complete_missions'
    target_value    int         NOT NULL DEFAULT 3,   -- e.g. read 3 stories
    reward_xp       int         NOT NULL DEFAULT 100,
    reward_badge    text,
    starts_at       timestamptz NOT NULL DEFAULT now(),
    ends_at         timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    status          text        NOT NULL DEFAULT 'active', -- 'active' | 'completed' | 'expired'
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_challenges_parent ON family_challenges(parent_id, status);

-- 4. Challenge participants
-- Each child invited to a challenge, tracking their progress
CREATE TABLE IF NOT EXISTS challenge_participants (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id    uuid        NOT NULL REFERENCES family_challenges(id) ON DELETE CASCADE,
    child_id        uuid        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    progress        int         NOT NULL DEFAULT 0,
    completed       bool        NOT NULL DEFAULT false,
    completed_at    timestamptz,
    reward_claimed  bool        NOT NULL DEFAULT false,
    joined_at       timestamptz NOT NULL DEFAULT now(),
    UNIQUE(challenge_id, child_id)
);

CREATE INDEX IF NOT EXISTS challenge_participants_child ON challenge_participants(child_id);
CREATE INDEX IF NOT EXISTS challenge_participants_challenge ON challenge_participants(challenge_id);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE referrals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_challenges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants  ENABLE ROW LEVEL SECURITY;

-- Parents own their referrals
CREATE POLICY "Owner manages referrals"
    ON referrals FOR ALL
    USING (referrer_id = auth.uid());

-- Public can read a referral by code (for signup validation)
CREATE POLICY "Public read referral by code"
    ON referrals FOR SELECT
    USING (true);

-- Conversion visible to referrer
CREATE POLICY "Referrer sees conversions"
    ON referral_conversions FOR SELECT
    USING (
        referral_id IN (SELECT id FROM referrals WHERE referrer_id = auth.uid())
    );

-- Service role inserts conversions
CREATE POLICY "Service role manages referral_conversions"
    ON referral_conversions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Parents manage their challenges
CREATE POLICY "Parent manages family_challenges"
    ON family_challenges FOR ALL
    USING (parent_id = auth.uid());

-- Children (via parent) manage their challenge participation
CREATE POLICY "Parent manages challenge_participants"
    ON challenge_participants FOR ALL
    USING (
        challenge_id IN (
            SELECT id FROM family_challenges WHERE parent_id = auth.uid()
        )
        OR
        child_id IN (
            SELECT id FROM children WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "Service role bypass referrals"
    ON referrals FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass family_challenges"
    ON family_challenges FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass challenge_participants"
    ON challenge_participants FOR ALL TO service_role USING (true) WITH CHECK (true);
