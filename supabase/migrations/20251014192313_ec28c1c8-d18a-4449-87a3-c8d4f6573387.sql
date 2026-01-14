-- Add new columns to audience_profiles for the enhanced signup flow
ALTER TABLE public.audience_profiles 
ADD COLUMN IF NOT EXISTS preferred_devices TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS willingness_to_participate TEXT NOT NULL DEFAULT 'yes';