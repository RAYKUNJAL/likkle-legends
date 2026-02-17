-- Likkle Legends Database Schema v3.1.0 (COPPA & Growth Engine)

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'grandparent', 'caregiver', 'admin');
    CREATE TYPE preferred_channel AS ENUM ('email', 'whatsapp');
    CREATE TYPE location_type AS ENUM ('Caribbean', 'Diaspora');
    CREATE TYPE child_age_band AS ENUM ('0-2', '3-5', '6-9', '10-12');
    CREATE TYPE family_role AS ENUM ('parent', 'grandparent', 'guardian');
    CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'canceled', 'past_due');
    CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'manual');
    CREATE TYPE content_type AS ENUM ('story', 'song', 'game', 'activity', 'resource_pdf');
    CREATE TYPE dialect_type AS ENUM ('standard_english', 'local_dialect');
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
    CREATE TYPE job_status AS ENUM ('queued', 'running', 'failed', 'completed', 'canceled');
    CREATE TYPE job_type AS ENUM (
        'ai_outline', 'ai_page', 'ai_localization', 'ai_audio', 'ai_cover', 
        'pdf_export', 'email_send', 'whatsapp_send', 'messenger_send', 
        'webhook_process', 'coppa_retention_enforce', 'coppa_sla_check', 
        'coppa_vendor_check', 'coppa_incident_workflow'
    );
    CREATE TYPE review_status AS ENUM ('draft', 'in_review', 'changes_requested', 'approved', 'published');
    CREATE TYPE message_channel AS ENUM ('email', 'whatsapp', 'messenger');
    CREATE TYPE message_category AS ENUM ('otp', 'transactional', 'marketing', 'share', 'support');
    CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
    CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'opened', 'clicked');
    CREATE TYPE contest_status AS ENUM ('draft', 'scheduled', 'live', 'paused', 'ended');
    CREATE TYPE affiliate_status AS ENUM ('pending', 'active', 'suspended');
    CREATE TYPE fraud_flag_type AS ENUM ('duplicate_ip', 'self_referral', 'burst_referrals', 'bot_like_behavior', 'invalid_phone', 'email_bounce');
    CREATE TYPE consent_method AS ENUM ('email_verification', 'sms_otp', 'whatsapp_otp', 'credit_card_verification', 'signed_form_upload', 'video_verification', 'teacher_verification');
    CREATE TYPE consent_scope_type AS ENUM ('basic_platform', 'ai_features', 'photo_sharing', 'third_party_disclosure');
    CREATE TYPE data_request_type AS ENUM ('access_export', 'deletion', 'correction');
    CREATE TYPE data_request_status AS ENUM ('new', 'acknowledged', 'in_progress', 'fulfilled', 'denied', 'overdue');
    CREATE TYPE vendor_compliance_status AS ENUM ('unknown', 'pending_dpa', 'compliant', 'needs_review', 'non_compliant');
    CREATE TYPE retention_action AS ENUM ('delete', 'anonymize', 'archive');
    CREATE TYPE admin_action_type AS ENUM ('view_child_pii', 'export_child_data', 'delete_child_data', 'edit_child_profile', 'edit_consent', 'approve_teacher', 'override_consent_block');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Core Tables

-- Users Table (extends Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    role user_role DEFAULT 'parent',
    first_name TEXT,
    email TEXT UNIQUE,
    whatsapp_number TEXT UNIQUE,
    messenger_psid TEXT UNIQUE,
    origin_island TEXT,
    preferred_island_code TEXT,
    location_type location_type,
    country_city TEXT,
    consent_marketing BOOLEAN DEFAULT false,
    marketing_opt_in_whatsapp BOOLEAN DEFAULT false,
    preferred_channel preferred_channel DEFAULT 'email',
    last_seen_at TIMESTAMPTZ,
    is_coppa_designated_parent BOOLEAN DEFAULT false,
    age_verified_at TIMESTAMPTZ,
    coppa_training_completed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_island ON users(preferred_island_code);
CREATE INDEX IF NOT EXISTS idx_users_coppa_parent ON users(is_coppa_designated_parent);

-- Family Groups
CREATE TABLE IF NOT EXISTS family_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID REFERENCES users(id),
    name TEXT DEFAULT 'Family',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Family Members
CREATE TABLE IF NOT EXISTS family_members (
    family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_in_family family_role DEFAULT 'parent',
    permissions JSONB DEFAULT '{"view_progress": true, "edit_child": false}',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (family_group_id, user_id)
);

-- Children
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL,
    primary_user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    age_band child_age_band,
    created_at TIMESTAMPTZ DEFAULT now(),
    age_verified BOOLEAN DEFAULT false,
    requires_parental_consent BOOLEAN DEFAULT true,
    consent_last_verified TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_children_user ON children(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_children_verified ON children(age_verified);

-- 3. COPPA Compliance Suite

-- Parental Consents
CREATE TABLE IF NOT EXISTS parental_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    parent_user_id UUID REFERENCES users(id),
    scope consent_scope_type NOT NULL,
    method consent_method NOT NULL,
    verified BOOLEAN DEFAULT false,
    verification_evidence JSONB,
    consented_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    UNIQUE(child_id, scope)
);

CREATE INDEX IF NOT EXISTS idx_consents_child ON parental_consents(child_id);
CREATE INDEX IF NOT EXISTS idx_consents_verified ON parental_consents(verified);

-- Parent Data Requests (SLA Tracked)
CREATE TABLE IF NOT EXISTS parent_data_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID REFERENCES users(id),
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    request_type data_request_type NOT NULL,
    status data_request_status DEFAULT 'new',
    acknowledged_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,
    notes TEXT,
    export_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor Compliance Registry
CREATE TABLE IF NOT EXISTS vendor_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT UNIQUE NOT NULL,
    status vendor_compliance_status DEFAULT 'unknown',
    dpa_signed BOOLEAN DEFAULT false,
    dpa_signed_at TIMESTAMPTZ,
    dpa_expires_at TIMESTAMPTZ,
    data_categories JSONB,
    notes TEXT,
    last_reviewed_at TIMESTAMPTZ
);

-- Admin Actions Audit (Immutable)
CREATE TABLE IF NOT EXISTS admin_actions_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES users(id),
    action_type admin_action_type NOT NULL,
    child_id UUID REFERENCES children(id),
    parent_user_id UUID REFERENCES users(id),
    justification TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Data Retention Policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT UNIQUE NOT NULL,
    retention_days INT NOT NULL,
    action retention_action NOT NULL,
    where_clause_sql TEXT,
    dry_run BOOLEAN DEFAULT true,
    last_enforced_at TIMESTAMPTZ
);

-- Additional Support Tables (Required for Seeds)
CREATE TABLE IF NOT EXISTS interests_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    content TEXT,
    channel message_channel,
    status message_status DEFAULT 'queued',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS age_verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    method consent_method,
    status verification_status,
    evidence_path TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    child_id UUID REFERENCES children(id),
    job_type job_type,
    tokens_input INT,
    tokens_output INT,
    provider TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RPCs & Logic

-- Consent Verification RPC
CREATE OR REPLACE FUNCTION rpc_verify_parental_consent(p_child_id UUID, p_scope consent_scope_type)
RETURNS TABLE (allowed BOOLEAN, reason TEXT) AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM parental_consents 
        WHERE child_id = p_child_id 
        AND scope = p_scope 
        AND verified = true 
        AND (expires_at IS NULL OR expires_at > now())
        AND revoked_at IS NULL
    ) THEN
        RETURN QUERY SELECT true, 'Consent verified'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Valid consent missing for this scope'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit Admin Access RPC
CREATE OR REPLACE FUNCTION rpc_audit_admin_access(
    p_admin_user_id UUID,
    p_action_type admin_action_type,
    p_child_id UUID,
    p_justification TEXT,
    p_context JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO admin_actions_audit (admin_user_id, action_type, child_id, justification, context)
    VALUES (p_admin_user_id, p_action_type, p_child_id, p_justification, p_context);
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Seed Initial Data
INSERT INTO interests_catalog (slug, label) VALUES
('stories', 'Stories'),
('music', 'Music'),
('games', 'Games'),
('stem', 'STEM'),
('heritage', 'Heritage'),
('printables', 'Printables')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO vendor_compliance (vendor_name, status, dpa_signed) VALUES
('Google Gemini/Vertex', 'pending_dpa', false),
('ElevenLabs', 'pending_dpa', false),
('Stripe', 'pending_dpa', false),
('Resend', 'pending_dpa', false),
('Meta (WhatsApp/Messenger)', 'pending_dpa', false),
('Supabase', 'pending_dpa', false)
ON CONFLICT (vendor_name) DO NOTHING;

INSERT INTO data_retention_policies (table_name, retention_days, action, dry_run) VALUES
('events', 180, 'anonymize', true),
('messages', 365, 'archive', true),
('age_verification_attempts', 365, 'delete', true),
('ai_usage', 365, 'anonymize', true)
ON CONFLICT (table_name) DO NOTHING;
