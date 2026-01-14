-- Add comments field to opinions table
ALTER TABLE public.opinions ADD COLUMN IF NOT EXISTS comments text;

COMMENT ON COLUMN public.opinions.comments IS 'Optional user comments/notes about their opinion submission';