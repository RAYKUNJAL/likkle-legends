-- Create Waitlist Table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Enable RLS (Optional but good practice)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for the waitlist form)
CREATE POLICY "Allow public inserts" ON waitlist FOR INSERT WITH CHECK (true);
