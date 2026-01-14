-- Referral System Table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code VARCHAR(12) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.referral_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bonus_awarded BOOLEAN DEFAULT false,
  UNIQUE(referred_user_id)
);

-- Campus Ambassador Program
CREATE TABLE IF NOT EXISTS public.campus_ambassadors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  college_name VARCHAR(255) NOT NULL,
  college_city VARCHAR(100) NOT NULL,
  college_state VARCHAR(100) NOT NULL,
  student_id VARCHAR(100),
  ambassador_code VARCHAR(20) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
  total_referrals INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content Moderation Flags
CREATE TABLE IF NOT EXISTS public.content_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('opinion', 'question', 'review', 'feedback')),
  content_id UUID NOT NULL,
  flagged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  flag_reason VARCHAR(100) NOT NULL,
  flag_details TEXT,
  ai_confidence_score DECIMAL(3,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'removed', 'approved')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shared Insights
CREATE TABLE IF NOT EXISTS public.shared_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL,
  insight_data JSONB NOT NULL,
  share_token VARCHAR(64) NOT NULL UNIQUE,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes" ON public.referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active referral codes for validation" ON public.referral_codes
  FOR SELECT USING (is_active = true);

-- RLS Policies for referral_claims
CREATE POLICY "Users can view their referral claims" ON public.referral_claims
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Authenticated users can create referral claims" ON public.referral_claims
  FOR INSERT WITH CHECK (auth.uid() = referred_user_id);

-- RLS Policies for campus_ambassadors
CREATE POLICY "Users can view their own ambassador profile" ON public.campus_ambassadors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ambassador application" ON public.campus_ambassadors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ambassador profile" ON public.campus_ambassadors
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for content_flags
CREATE POLICY "Users can create content flags" ON public.content_flags
  FOR INSERT WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Users can view their own flags" ON public.content_flags
  FOR SELECT USING (auth.uid() = flagged_by);

-- RLS Policies for shared_insights
CREATE POLICY "Users can manage their shared insights" ON public.shared_insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared insights by token" ON public.shared_insights
  FOR SELECT USING (share_token IS NOT NULL AND (expires_at IS NULL OR expires_at > now()));

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(12) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN 'INP-' || result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ambassador code
CREATE OR REPLACE FUNCTION generate_ambassador_code(college_name VARCHAR)
RETURNS VARCHAR(20) AS $$
DECLARE
  prefix VARCHAR(6);
  suffix VARCHAR(6);
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  prefix := upper(left(regexp_replace(college_name, '[^a-zA-Z]', '', 'g'), 4));
  IF length(prefix) < 4 THEN
    prefix := rpad(prefix, 4, 'X');
  END IF;
  suffix := '';
  FOR i IN 1..6 LOOP
    suffix := suffix || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN 'CA-' || prefix || '-' || suffix;
END;
$$ LANGUAGE plpgsql;