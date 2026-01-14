-- Create coupon_analytics table for tracking usage patterns
CREATE TABLE IF NOT EXISTS public.coupon_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'viewed', 'copied', 'redeemed', 'shared'
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create coupon_shares table for sharing functionality
CREATE TABLE IF NOT EXISTS public.coupon_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  claimed_by UUID
);

-- Create coupon_wishlist table
CREATE TABLE IF NOT EXISTS public.coupon_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  merchant_name TEXT NOT NULL,
  category TEXT,
  min_discount NUMERIC,
  notify_on_match BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, merchant_name)
);

-- Create coupon_recommendations table
CREATE TABLE IF NOT EXISTS public.coupon_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coupon_type TEXT NOT NULL,
  merchant TEXT NOT NULL,
  discount NUMERIC,
  match_score INTEGER, -- 0-100 based on user preferences
  recommendation_reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupon_analytics
CREATE POLICY "Users can view their own analytics"
  ON public.coupon_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.coupon_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coupon_shares
CREATE POLICY "Users can view coupons they shared"
  ON public.coupon_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = claimed_by);

CREATE POLICY "Users can share their coupons"
  ON public.coupon_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can update shared coupons"
  ON public.coupon_shares FOR UPDATE
  USING (auth.uid() = shared_by OR auth.uid() = claimed_by);

-- RLS Policies for coupon_wishlist
CREATE POLICY "Users can manage their wishlist"
  ON public.coupon_wishlist FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for coupon_recommendations
CREATE POLICY "Users can view their recommendations"
  ON public.coupon_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON public.coupon_recommendations FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupon_analytics_user_id ON public.coupon_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_analytics_event_type ON public.coupon_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_coupon_shares_shared_by ON public.coupon_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_coupon_shares_claimed_by ON public.coupon_shares(claimed_by);
CREATE INDEX IF NOT EXISTS idx_coupon_wishlist_user_id ON public.coupon_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_recommendations_user_id ON public.coupon_recommendations(user_id);