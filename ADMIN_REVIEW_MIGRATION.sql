
-- ADD ADMIN REVIEW STATUS
-- Run this in Supabase SQL Editor to enable the new Admin Review workflow.

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'

-- Update existing records to be approved (so they don't disappear)
UPDATE generated_content 
SET admin_status = 'approved' 
WHERE admin_status IS NULL OR admin_status = 'pending';

-- Add Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_generated_content_admin_status ON generated_content(admin_status);
