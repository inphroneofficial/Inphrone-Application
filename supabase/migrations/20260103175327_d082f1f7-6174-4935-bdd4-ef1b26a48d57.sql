-- Create coupon feedback table for user validation system
CREATE TABLE public.coupon_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pool_coupon_id UUID REFERENCES public.coupon_pool(id) ON DELETE CASCADE,
  claimed_coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  feedback_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate feedback
CREATE UNIQUE INDEX idx_coupon_feedback_unique ON public.coupon_feedback(user_id, COALESCE(pool_coupon_id, claimed_coupon_id));

-- Add columns to coupon_pool for validation tracking
ALTER TABLE public.coupon_pool 
ADD COLUMN IF NOT EXISTS thumbs_up INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS thumbs_down INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMP WITH TIME ZONE;

-- Add columns to user coupons for feedback tracking
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS user_feedback BOOLEAN,
ADD COLUMN IF NOT EXISTS feedback_given_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on coupon_feedback
ALTER TABLE public.coupon_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupon_feedback
CREATE POLICY "Users can view all feedback counts"
ON public.coupon_feedback FOR SELECT
USING (true);

CREATE POLICY "Users can submit their own feedback"
ON public.coupon_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to auto-deactivate coupons with too many negative reports
CREATE OR REPLACE FUNCTION public.check_coupon_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- If coupon gets 3 or more thumbs down, deactivate it
  IF NEW.is_helpful = false THEN
    UPDATE public.coupon_pool
    SET 
      thumbs_down = thumbs_down + 1,
      is_active = CASE WHEN thumbs_down >= 2 THEN false ELSE is_active END,
      last_validated_at = now()
    WHERE id = NEW.pool_coupon_id;
  ELSE
    -- Increment thumbs up and potentially mark as verified
    UPDATE public.coupon_pool
    SET 
      thumbs_up = thumbs_up + 1,
      is_verified = CASE WHEN thumbs_up >= 2 THEN true ELSE is_verified END,
      last_validated_at = now()
    WHERE id = NEW.pool_coupon_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to run feedback check
CREATE TRIGGER on_coupon_feedback_insert
AFTER INSERT ON public.coupon_feedback
FOR EACH ROW
EXECUTE FUNCTION public.check_coupon_feedback();

-- Index for faster queries on coupon pool by location and expiry
CREATE INDEX IF NOT EXISTS idx_coupon_pool_active_location ON public.coupon_pool(is_active, country_code, expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupon_pool_category ON public.coupon_pool(category, is_active) WHERE is_active = true;