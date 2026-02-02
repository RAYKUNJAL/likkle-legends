-- Migration: Create saved_stories table for user story library
-- Run this in Supabase SQL Editor
-- Create saved_stories table
CREATE TABLE IF NOT EXISTS public.saved_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    child_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_saved_stories_user_id ON public.saved_stories(user_id);
-- Enable RLS (Row Level Security)
ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;
-- Policy: Users can only view their own saved stories
CREATE POLICY "Users can view own saved stories" ON public.saved_stories FOR
SELECT USING (auth.uid() = user_id);
-- Policy: Users can insert their own saved stories
CREATE POLICY "Users can insert own saved stories" ON public.saved_stories FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Policy: Users can update their own saved stories
CREATE POLICY "Users can update own saved stories" ON public.saved_stories FOR
UPDATE USING (auth.uid() = user_id);
-- Policy: Users can delete their own saved stories
CREATE POLICY "Users can delete own saved stories" ON public.saved_stories FOR DELETE USING (auth.uid() = user_id);
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_stories_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to auto-update updated_at on changes
DROP TRIGGER IF EXISTS trigger_update_saved_stories_updated_at ON public.saved_stories;
CREATE TRIGGER trigger_update_saved_stories_updated_at BEFORE
UPDATE ON public.saved_stories FOR EACH ROW EXECUTE FUNCTION update_saved_stories_updated_at();
-- Grant access to authenticated users
GRANT ALL ON public.saved_stories TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;