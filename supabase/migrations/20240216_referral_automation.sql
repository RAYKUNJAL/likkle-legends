-- Migration: Referral Automation & Parent Rewards
-- Adds referral credits and parent referral code tracking

-- 1. Add referral code to users for parent-to-parent referrals
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS my_referral_code TEXT UNIQUE;

-- 2. Create index for fast lookup during checkout
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(my_referral_code);

-- 3. Referral Credits Table
-- Tracks rewards earned by parents (e.g., "Get a free month")
DO $$ BEGIN
    CREATE TYPE referral_reward_type AS ENUM ('subscription_credit', 'discount_code', 'cash_payout');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE referral_credit_status AS ENUM ('pending', 'available', 'consumed', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.referral_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The parent who earned the credit
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- The friend who signed up
    reward_type referral_reward_type DEFAULT 'subscription_credit',
    credit_amount NUMERIC(10, 2) DEFAULT 0.00, -- Optional: used if it's a dollar discount
    status referral_credit_status DEFAULT 'pending',
    order_id TEXT, -- Link to the order that triggered this
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Function to generate parent referral codes automatically
CREATE OR REPLACE FUNCTION generate_parent_referral_code() 
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN := FALSE;
BEGIN
    IF NEW.my_referral_code IS NULL THEN
        WHILE NOT done LOOP
            -- Generate a code like PARENT-ABCD
            new_code := 'P-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
            
            -- Check for uniqueness
            IF NOT EXISTS (SELECT 1 FROM public.users WHERE my_referral_code = new_code) THEN
                NEW.my_referral_code := new_code;
                done := TRUE;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger for new user referral codes
DROP TRIGGER IF EXISTS tr_generate_user_referral_code ON public.users;
CREATE TRIGGER tr_generate_user_referral_code
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION generate_parent_referral_code();

-- 6. Backfill existing users (optional, safe)
UPDATE public.users 
SET my_referral_code = 'P-' || UPPER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 6))
WHERE my_referral_code IS NULL;

-- 7. RLS
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral credits"
ON public.referral_credits FOR SELECT
USING (auth.uid() = user_id);

GRANT ALL ON public.referral_credits TO authenticated;
GRANT ALL ON public.referral_credits TO service_role;
