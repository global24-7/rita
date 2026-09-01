-- Rita Jeans Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  reset_password_token TEXT,
  reset_password_expire TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sparse email (allow nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Skinny', 'Straight', 'Ripped', 'Mom Fit', 'Baggy', 'Wide Leg')),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  discount_percent NUMERIC(5,2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  sale_starts_at TIMESTAMPTZ,
  sale_ends_at TIMESTAMPTZ,
  images JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  is_new_arrival BOOLEAN DEFAULT false,
  is_flash_sale BOOLEAN DEFAULT false,
  average_rating NUMERIC(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_flash_sale ON products(is_flash_sale, sale_ends_at);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_location TEXT NOT NULL CHECK (delivery_location IN ('La Paz', 'Ablekuma', 'Other')),
  delivery_address TEXT DEFAULT '',
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  referral_code TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- ============================================
-- 5. ORDER ITEMS TABLE (replaces embedded array)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty >= 1),
  size TEXT NOT NULL,
  price_at_order NUMERIC(10,2) NOT NULL
);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================
-- 6. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- ============================================
-- 7. SETTINGS TABLE (singleton)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_fee NUMERIC(10,2) DEFAULT 20,
  currency TEXT DEFAULT 'GH₵',
  business_phone TEXT DEFAULT '0592117747',
  business_name TEXT DEFAULT 'Rita Jeans',
  locations JSONB DEFAULT '["La Paz", "Ablekuma"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only allow one settings row
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_singleton ON settings((true));

-- ============================================
-- 8. CUSTOMER WISHLISTS TABLE (join table)
-- ============================================
CREATE TABLE IF NOT EXISTS customer_wishlists (
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (customer_id, product_id)
);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON customer_wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON customer_wishlists(product_id);

-- ============================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to recalculate product ratings when reviews change
CREATE OR REPLACE FUNCTION recalculate_product_rating(p_product_id UUID)
RETURNS void AS $$
DECLARE
  avg_rating NUMERIC;
  rev_count INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, rev_count
  FROM reviews
  WHERE product_id = p_product_id AND is_approved = true;

  UPDATE products
  SET
    average_rating = COALESCE(ROUND(avg_rating, 2), 0),
    review_count = COALESCE(rev_count, 0)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate rating when review is approved/created
CREATE OR REPLACE FUNCTION trigger_recalculate_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_product_rating(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.product_id
      ELSE NEW.product_id
    END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_rating();

-- Function to calculate order totals (replaces Mongoose pre-save hook)
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  item_total NUMERIC;
  del_fee NUMERIC;
BEGIN
  -- Calculate subtotal
  SELECT COALESCE(SUM(price_at_order * qty), 0)
  INTO item_total
  FROM order_items
  WHERE order_id = NEW.id;

  -- Calculate delivery fee
  IF NEW.delivery_location = 'Ablekuma' THEN
    del_fee := 0;
  ELSE
    SELECT COALESCE(delivery_fee, 20)
    INTO del_fee
    FROM settings
    LIMIT 1;
  END IF;

  -- Update order totals
  UPDATE orders
  SET
    subtotal = item_total,
    delivery_fee = del_fee,
    total = item_total + del_fee
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate totals when order items change
CREATE OR REPLACE FUNCTION trigger_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_order_totals() WHERE id = OLD.order_id;
    RETURN OLD;
  ELSE
    PERFORM calculate_order_totals() WHERE id = NEW.order_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_change
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION trigger_order_totals();

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wishlists ENABLE ROW LEVEL SECURITY;

-- Admins: Only service role can access
CREATE POLICY "Admins: service role only" ON admins
  FOR ALL USING (auth.role() = 'service_role');

-- Customers: Users can read/update their own data
CREATE POLICY "Customers: read own" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Customers: update own" ON customers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Products: Public read, service role write
CREATE POLICY "Products: public read" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products: service role write" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Orders: Public create, customers read own, service role full access
CREATE POLICY "Orders: public create" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders: customers read own" ON orders
  FOR SELECT USING (
    auth.uid()::text = customer_id::text
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Orders: service role update" ON orders
  FOR UPDATE USING (auth.role() = 'service_role');

-- Order Items: Public create with order, service role full access
CREATE POLICY "Order Items: public create" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Order Items: service role read" ON order_items
  FOR SELECT USING (auth.role() = 'service_role');

-- Reviews: Public read approved, public create, service role full access
CREATE POLICY "Reviews: public read approved" ON reviews
  FOR SELECT USING (is_approved = true OR auth.role() = 'service_role');

CREATE POLICY "Reviews: public create" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reviews: service role manage" ON reviews
  FOR ALL USING (auth.role() = 'service_role');

-- Settings: Public read, service role write
CREATE POLICY "Settings: public read" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Settings: service role write" ON settings
  FOR ALL USING (auth.role() = 'service_role');

-- Wishlists: Public read/write (for simplicity, can be locked down later)
CREATE POLICY "Wishlists: public all" ON customer_wishlists
  FOR ALL USING (true);

-- ============================================
-- 11. SEED DATA
-- ============================================

-- Insert default admin (password: changeme123)
-- Note: The app will hash this on first login attempt via bcrypt
-- For now, insert a pre-hashed version
INSERT INTO admins (email, password, role)
VALUES (
  'admin@ritajeans.com',
  '$2b$12$LJ3m4ys3Lk0TSwMCPNEPluAINoB6YR4.uPHSjPbHJz3YWN3JuMXC6',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO settings (delivery_fee, currency, business_phone, business_name, locations)
VALUES (
  20,
  'GH₵',
  '0592117747',
  'Rita Jeans',
  '["La Paz", "Ablekuma"]'::jsonb
)
ON CONFLICT DO NOTHING;
