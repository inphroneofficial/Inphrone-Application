-- SECURITY FIX: Restrict coupon_pool access to authenticated users only
-- Previously had public access which exposed affiliate tracking links and coupon codes

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view active coupon pool" ON public.coupon_pool;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view active coupons"
ON public.coupon_pool
FOR SELECT
TO authenticated
USING (is_active = true);

-- Ensure RLS is enabled (should already be enabled but being explicit)
ALTER TABLE public.coupon_pool ENABLE ROW LEVEL SECURITY;