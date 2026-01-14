-- Add additional fields to coupons table for better coupon information
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS merchant_name text,
ADD COLUMN IF NOT EXISTS merchant_link text,
ADD COLUMN IF NOT EXISTS usage_instructions text,
ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS description text;