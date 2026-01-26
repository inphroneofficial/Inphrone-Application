-- Phase 1: Security Fixes - Restrict public data exposure

-- Drop overly permissive policies on cultural_energy_map
DROP POLICY IF EXISTS "Anyone can view cultural energy" ON cultural_energy_map;
DROP POLICY IF EXISTS "Authenticated users can view cultural energy" ON cultural_energy_map;

-- Create secure policy for cultural_energy_map
CREATE POLICY "Authenticated users can view cultural energy" 
  ON cultural_energy_map FOR SELECT 
  TO authenticated 
  USING (true);

-- Drop and recreate coupon_pool policies for authenticated users only
DROP POLICY IF EXISTS "Anyone can view coupon pool" ON coupon_pool;
DROP POLICY IF EXISTS "Authenticated users can view active coupons" ON coupon_pool;
DROP POLICY IF EXISTS "Authenticated users view active coupons" ON coupon_pool;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupon_pool;

CREATE POLICY "Authenticated users view active coupons" 
  ON coupon_pool FOR SELECT 
  TO authenticated 
  USING (is_active = true);

-- Secure reviews table - only authenticated users can view
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON reviews;

CREATE POLICY "Authenticated users view reviews" 
  ON reviews FOR SELECT 
  TO authenticated 
  USING (true);

-- Secure your_turn_slots - only authenticated users (use status column)
DROP POLICY IF EXISTS "Anyone can view active slots" ON your_turn_slots;
DROP POLICY IF EXISTS "Authenticated users can view active slots" ON your_turn_slots;
DROP POLICY IF EXISTS "Anyone can view slots" ON your_turn_slots;

CREATE POLICY "Authenticated users view active slots" 
  ON your_turn_slots FOR SELECT 
  TO authenticated 
  USING (status = 'active' OR status = 'completed');

-- Phase 2: Add performance indexes (with verified column names)
CREATE INDEX IF NOT EXISTS idx_opinions_created_at ON opinions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_session ON user_activity_logs(user_id, session_start DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_opinions_user_category ON opinions(user_id, category_id);

-- Phase 3: Ensure gamification trigger is properly attached
DROP TRIGGER IF EXISTS on_profile_created_gamification ON profiles;
CREATE TRIGGER on_profile_created_gamification
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_audience_gamification_records();