-- Likkle Legends Database Schema (Simple Version)
-- Run this in Supabase SQL Editor

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'parent',
    avatar_url TEXT,
    xp_total INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    stars INTEGER DEFAULT 100,
    subscription_tier TEXT DEFAULT 'free',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHILD PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.child_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    age_track TEXT DEFAULT 'big',
    avatar_url TEXT,
    favorite_character TEXT DEFAULT 'roti',
    xp_total INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORYBOOKS TABLE
CREATE TABLE IF NOT EXISTS public.storybooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    child_id UUID,
    title TEXT NOT NULL,
    summary TEXT,
    hero_name TEXT,
    hero_type TEXT,
    style TEXT DEFAULT 'folklore',
    pages JSONB DEFAULT '[]',
    moral TEXT,
    parent_note JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SAVED STORIES TABLE
CREATE TABLE IF NOT EXISTS public.saved_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    child_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    child_id UUID,
    activity_type TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    stars_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BADGE DEFINITIONS TABLE
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    xp_bonus INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BADGE EARNINGS TABLE
CREATE TABLE IF NOT EXISTS public.badge_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    child_id UUID,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTENT ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}',
    thumbnail_url TEXT,
    audio_url TEXT,
    tier_required TEXT DEFAULT 'free',
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    notification_bar JSONB DEFAULT '{}',
    hero JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    pricing JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
