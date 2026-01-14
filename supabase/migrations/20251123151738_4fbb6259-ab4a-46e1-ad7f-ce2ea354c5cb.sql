-- Clear all existing coupons and opinions
DELETE FROM opinion_views;
DELETE FROM opinion_upvotes;
DELETE FROM insight_ripples;
DELETE FROM time_capsules;
DELETE FROM coupon_analytics;
DELETE FROM coupon_shares;
DELETE FROM coupons;
DELETE FROM opinions;

-- Create coupon pool table for caching
CREATE TABLE IF NOT EXISTS public.coupon_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL,
  offer_text TEXT NOT NULL,
  tracking_link TEXT NOT NULL,
  coupon_code TEXT,
  discount TEXT NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  logo_url TEXT,
  category TEXT NOT NULL,
  currency_code TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  country_code TEXT DEFAULT 'IN',
  is_active BOOLEAN DEFAULT true,
  times_shown INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupon_pool ENABLE ROW LEVEL SECURITY;

-- Allow reading coupon pool
CREATE POLICY "Anyone can view active coupon pool"
  ON public.coupon_pool
  FOR SELECT
  USING (is_active = true);

-- System can manage coupon pool
CREATE POLICY "System can manage coupon pool"
  ON public.coupon_pool
  FOR ALL
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_coupon_pool_category ON public.coupon_pool(category);
CREATE INDEX idx_coupon_pool_country ON public.coupon_pool(country_code);
CREATE INDEX idx_coupon_pool_active ON public.coupon_pool(is_active);

-- Add tracking field to coupons table for which pool items user has seen
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS pool_coupon_id UUID REFERENCES public.coupon_pool(id);
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS actual_savings NUMERIC DEFAULT 0;