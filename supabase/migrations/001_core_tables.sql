-- Core Tables for Likkle Legends Platform
-- Run these migrations in Supabase SQL editor

-- 1. Affiliates/Promoters Table
CREATE TABLE IF NOT EXISTS promoters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  paypal_email VARCHAR(255) NOT NULL,
  instagram_handle VARCHAR(100),
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending_approval', -- pending_approval, approved, suspended
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- 2. Contests/Leaderboard Table
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  prize_pool DECIMAL(10,2),
  max_participants INT DEFAULT 1000,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_start_date (start_date)
);

-- 3. Contest Entries/Leaderboard
CREATE TABLE IF NOT EXISTS contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT NOW(),
  rank INT,
  prize_won DECIMAL(10,2),
  INDEX idx_contest_user (contest_id, user_id),
  INDEX idx_score (score DESC)
);

-- 4. Marketplace Products
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- Educational, Games, Content, Audio, etc.
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  total_sales INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_creator_id (creator_id),
  INDEX idx_category (category),
  FULLTEXT INDEX ft_title (title)
);

-- 5. Marketplace Orders
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50), -- stripe, paypal, etc.
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  stripe_payment_id VARCHAR(255),
  paypal_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_payment_status (payment_status)
);

-- 6. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- starter, growth, enterprise
  status VARCHAR(50) DEFAULT 'active', -- active, paused, cancelled
  price_per_month DECIMAL(10,2) NOT NULL,
  trial_days INT DEFAULT 30,
  trial_started_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  next_billing_date TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  paypal_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- 7. Island Portals (Personalized)
CREATE TABLE IF NOT EXISTS island_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  island_code VARCHAR(10) NOT NULL, -- TT, JM, BB, GD, GY, LC, etc.
  island_name VARCHAR(100) NOT NULL,
  character_name VARCHAR(100) NOT NULL,
  theme_colors JSONB,
  daily_fact TEXT,
  daily_word TEXT,
  featured_recipe TEXT,
  learning_path JSONB,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_island_code (island_code)
);

-- 8. Island Content
CREATE TABLE IF NOT EXISTS island_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  island_code VARCHAR(10) NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- story, fact, phrase, recipe, song
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100),
  status VARCHAR(50) DEFAULT 'approved', -- pending, approved, rejected
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_island_code (island_code),
  INDEX idx_content_type (content_type),
  INDEX idx_status (status)
);

-- 9. Referrals (Affiliate Tracking)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id UUID NOT NULL REFERENCES promoters(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'clicked', -- clicked, signup, trial, converted
  signup_value DECIMAL(10,2),
  commission_earned DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP,
  INDEX idx_promoter_id (promoter_id),
  INDEX idx_status (status)
);

-- 10. Bug Reports (Reef Monitoring)
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  route VARCHAR(255),
  error_message TEXT,
  error_stack TEXT,
  severity VARCHAR(50), -- critical, high, medium, low
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  INDEX idx_severity (severity),
  INDEX idx_status (status)
);

-- 11. Accessibility Audits
CREATE TABLE IF NOT EXISTS accessibility_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route VARCHAR(255) NOT NULL,
  wcag_level VARCHAR(10), -- A, AA, AAA
  violations INT,
  warnings INT,
  audit_date TIMESTAMP DEFAULT NOW(),
  INDEX idx_route (route)
);

-- RLS Policies for Security
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE island_portals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users see own promoter data" ON promoters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see own orders" ON marketplace_orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users see own portal" ON island_portals
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Creators can see products they created
CREATE POLICY "Creators see own products" ON marketplace_products
  FOR SELECT USING (auth.uid() = creator_id OR status = 'active');

CREATE POLICY "Creators update own products" ON marketplace_products
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators insert products" ON marketplace_products
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON subscriptions TO authenticated;
GRANT INSERT, UPDATE ON marketplace_orders TO authenticated;

-- Create indexes for performance
CREATE INDEX idx_promoters_referral_code ON promoters(referral_code);
CREATE INDEX idx_marketplace_products_creator ON marketplace_products(creator_id);
CREATE INDEX idx_island_portals_user ON island_portals(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
