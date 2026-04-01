-- Create Admin Audit Logs Table
-- This table records all admin actions for accountability and auditing

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  admin_email text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for fast querying
CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_resource_type ON public.admin_audit_logs(resource_type);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_status ON public.admin_audit_logs(status);
CREATE INDEX idx_admin_audit_logs_admin_email ON public.admin_audit_logs(admin_email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (select)
CREATE POLICY admin_audit_logs_select ON public.admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Only the system can insert audit logs (via service role)
CREATE POLICY admin_audit_logs_insert ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Audit logs cannot be updated or deleted (immutable)
CREATE POLICY admin_audit_logs_no_update ON public.admin_audit_logs
  FOR UPDATE USING (false);

CREATE POLICY admin_audit_logs_no_delete ON public.admin_audit_logs
  FOR DELETE USING (false);

-- Grant access to authenticated users (but RLS policies will restrict viewing)
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT INSERT ON public.admin_audit_logs TO service_role;
