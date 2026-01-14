-- Add terms_and_conditions field to coupon_pool
ALTER TABLE coupon_pool 
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

-- Add terms_and_conditions field to coupons
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;