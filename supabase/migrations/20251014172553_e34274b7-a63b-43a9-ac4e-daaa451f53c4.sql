-- Add preferences column to opinions table for flexible category-specific data
ALTER TABLE public.opinions 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add indexes for better query performance on JSONB
CREATE INDEX IF NOT EXISTS idx_opinions_preferences ON public.opinions USING GIN (preferences);

-- Add location fields to profiles for auto-detection
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS detected_country TEXT,
ADD COLUMN IF NOT EXISTS detected_timezone TEXT;

-- Add age_group to profiles for demographic insights
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age_group TEXT;