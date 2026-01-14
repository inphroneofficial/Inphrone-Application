-- Add merchant favorites table
CREATE TABLE IF NOT EXISTS public.merchant_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  merchant_name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, merchant_name)
);

-- Enable RLS
ALTER TABLE public.merchant_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for merchant_favorites
CREATE POLICY "Users can manage their favorites"
  ON public.merchant_favorites
  FOR ALL
  USING (auth.uid() = user_id);

-- Add usage tracking fields to coupons
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS times_copied INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS times_shared INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_merchant_favorites_user_id ON public.merchant_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_used_at ON public.coupons(used_at) WHERE used_at IS NOT NULL;