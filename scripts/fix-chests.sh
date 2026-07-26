#!/usr/bin/env bash
set -e
echo "Creating reward_chests table..."
docker exec -i supabase-db psql -U supabase_admin -d postgres <<'SQL'
CREATE TABLE IF NOT EXISTS reward_chests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    chest_date DATE NOT NULL,
    unlocked_at TIMESTAMPTZ,
    reward_type TEXT,
    reward_value TEXT,
    xp_reward INTEGER DEFAULT 10,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE reward_chests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rc_all ON reward_chests;
CREATE POLICY rc_all ON reward_chests FOR ALL USING (true) WITH CHECK (true);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rc_child_date ON reward_chests(child_id, chest_date);
NOTIFY pgrst, 'reload schema';
SQL
sleep 2
SVC=$(grep ^SUPABASE_SERVICE_ROLE_KEY= /opt/likkle-legends/.env.production|cut -d= -f2-)
echo "Verify reward_chests..."
curl -s --max-time 10 -H "apikey: $SVC" -H "Authorization: Bearer $SVC" "http://127.0.0.1:8800/rest/v1/reward_chests?select=*&limit=1"
echo

echo "Seed chest for test child Kai..."
CHILD_ID="2a3c1080-c48d-4e0e-b2d3-86b8eaccbdee"
TODAY=$(date -u +%Y-%m-%d)
docker exec -i supabase-db psql -U supabase_admin -d postgres -c "INSERT INTO reward_chests (child_id, chest_date, xp_reward) VALUES ('$CHILD_ID', '$TODAY', 15) ON CONFLICT (child_id, chest_date) DO NOTHING;"
echo "Done"
