-- Rita Jeans Referral System & Vouchers
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. REFERRALS TABLE (tracks who referred whom)
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'first_purchase')),
  referred_name TEXT,
  referred_email TEXT,
  referred_phone TEXT,
  first_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  reward_issued BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ============================================
-- 2. VOUCHERS TABLE (rewards)
-- ============================================
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('free_delivery', 'percent_discount')),
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  used_in_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_customer ON vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(customer_id, is_used, expires_at);

-- ============================================
-- 3. UPDATE ORDERS TABLE (add voucher_id column)
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_discount NUMERIC(10,2) DEFAULT 0;

-- ============================================
-- 4. FUNCTIONS
-- ============================================

-- Function to check for self-referral fraud
CREATE OR REPLACE FUNCTION check_self_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Block self-referral (same customer trying to refer themselves)
  IF NEW.referrer_id = NEW.referred_id THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_self_referral
  BEFORE INSERT ON referrals
  FOR EACH ROW EXECUTE FUNCTION check_self_referral();

-- Function to generate unique voucher code
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'RITA-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. UPDATED_at TRIGGER for new tables
-- ============================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. RLS POLICIES
-- ============================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Referrals: service role full access, referrers can read their own
CREATE POLICY "Referrals: service role" ON referrals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Referrals: referrer read" ON referrals
  FOR SELECT USING (auth.uid()::text = referrer_id::text);

-- Vouchers: service role full access, customers read their own
CREATE POLICY "Vouchers: service role" ON vouchers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Vouchers: customer read" ON vouchers
  FOR SELECT USING (auth.uid()::text = customer_id::text);
