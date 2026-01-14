-- Add shared_at column to coupons table to track when a coupon was shared
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS shared_at timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.coupons.shared_at IS 'Timestamp when the coupon was shared with another user';