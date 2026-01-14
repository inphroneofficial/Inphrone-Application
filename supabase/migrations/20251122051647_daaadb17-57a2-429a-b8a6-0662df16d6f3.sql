-- Clear all existing opinions and coupons data
DELETE FROM public.opinion_views;
DELETE FROM public.opinion_upvotes;
DELETE FROM public.insight_ripples;
DELETE FROM public.time_capsules;
DELETE FROM public.coupon_analytics;
DELETE FROM public.coupon_shares;
DELETE FROM public.coupons;
DELETE FROM public.opinions;

-- Add logo_url and discount_type columns to coupons table if they don't exist
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percentage';