-- Add missing indexes for performance optimization (final corrected version)

-- Account deletion attempts
CREATE INDEX IF NOT EXISTS idx_account_deletion_user_id ON public.account_deletion_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_attempted_at ON public.account_deletion_attempts(attempted_at DESC);

-- Audience profiles  
CREATE INDEX IF NOT EXISTS idx_audience_profiles_created_at ON public.audience_profiles(created_at DESC);

-- Campus ambassadors
CREATE INDEX IF NOT EXISTS idx_campus_ambassadors_created_at ON public.campus_ambassadors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campus_ambassadors_status ON public.campus_ambassadors(status);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON public.coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON public.coupons(expires_at);

-- Coupon pool
CREATE INDEX IF NOT EXISTS idx_coupon_pool_created_at ON public.coupon_pool(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_pool_expires_at ON public.coupon_pool(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_pool_category ON public.coupon_pool(category);
CREATE INDEX IF NOT EXISTS idx_coupon_pool_active ON public.coupon_pool(is_active) WHERE is_active = true;

-- Content flags
CREATE INDEX IF NOT EXISTS idx_content_flags_created_at ON public.content_flags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_flags_status ON public.content_flags(status);
CREATE INDEX IF NOT EXISTS idx_content_flags_content ON public.content_flags(content_id, content_type);

-- InphroSync responses
CREATE INDEX IF NOT EXISTS idx_inphrosync_response_date ON public.inphrosync_responses(response_date DESC);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Referral codes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code) WHERE is_active = true;

-- Your Turn (corrected column names)
CREATE INDEX IF NOT EXISTS idx_your_turn_questions_created_at ON public.your_turn_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_your_turn_questions_approved ON public.your_turn_questions(is_approved);
CREATE INDEX IF NOT EXISTS idx_your_turn_questions_user ON public.your_turn_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_your_turn_votes_created_at ON public.your_turn_votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_your_turn_votes_question ON public.your_turn_votes(question_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_opinions_user_created ON public.opinions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opinions_category_created ON public.opinions(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, read, created_at DESC);