-- Add user_type to opinion_upvotes to track who is liking opinions
ALTER TABLE public.opinion_upvotes 
ADD COLUMN IF NOT EXISTS user_type text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_opinion_upvotes_user_type 
ON public.opinion_upvotes(user_type);

-- Create a function to get upvote breakdown by user type for an opinion
CREATE OR REPLACE FUNCTION get_opinion_upvote_breakdown(opinion_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'audience', COUNT(*) FILTER (WHERE user_type = 'audience'),
    'creator', COUNT(*) FILTER (WHERE user_type = 'creator'),
    'studio', COUNT(*) FILTER (WHERE user_type = 'studio' OR user_type = 'production' OR user_type = 'ott'),
    'total', COUNT(*)
  )
  INTO result
  FROM public.opinion_upvotes
  WHERE opinion_id = opinion_uuid;
  
  RETURN COALESCE(result, '{"audience": 0, "creator": 0, "studio": 0, "total": 0}'::jsonb);
END;
$$;

-- Update existing upvotes with user_type from profiles
UPDATE public.opinion_upvotes ou
SET user_type = p.user_type
FROM public.profiles p
WHERE ou.user_id = p.id
AND ou.user_type IS NULL;