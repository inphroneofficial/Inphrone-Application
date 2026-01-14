-- Create coupons table to store reward coupons
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_type TEXT NOT NULL, -- 'movie', 'ott', 'shopping', 'electronics', 'clothes'
  coupon_value NUMERIC NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'used'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Users can view their own coupons"
ON public.coupons
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coupons"
ON public.coupons
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupons"
ON public.coupons
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically expire coupons
CREATE OR REPLACE FUNCTION public.check_coupon_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET status = 'expired'
  WHERE expires_at < now() AND status = 'active';
END;
$$;