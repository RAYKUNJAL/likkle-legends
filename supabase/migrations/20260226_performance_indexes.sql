-- Performance indexes for commercial launch
-- Run in Supabase SQL editor or via supabase db push
-- Note: profiles is a view in this project — indexes only on concrete tables

-- Children: parent lookups and streak queries
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_streak ON public.children(current_streak);
CREATE INDEX IF NOT EXISTS idx_children_last_activity ON public.children(last_activity_date);

-- Daily logins: streak calculation composite (child_id + login_date queried together)
CREATE INDEX IF NOT EXISTS idx_daily_logins_child_date ON public.daily_logins(child_id, login_date);

-- Email queue: add send_at column if missing, then create composite index
ALTER TABLE public.email_queue
  ADD COLUMN IF NOT EXISTS send_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_email_queue_status_send
  ON public.email_queue(status, COALESCE(send_at, created_at));

-- Prevent duplicate nurture emails per user per type (safe re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_nurture_user_type'
  ) THEN
    ALTER TABLE public.subscription_nurture
      ADD CONSTRAINT uniq_nurture_user_type UNIQUE (user_id, email_type);
  END IF;
END$$;
