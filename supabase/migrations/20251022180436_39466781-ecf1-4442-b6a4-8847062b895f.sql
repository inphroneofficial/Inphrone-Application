-- Fix search_path security warning for get_opinion_upvote_breakdown function
DROP FUNCTION IF EXISTS get_opinion_upvote_breakdown(uuid);

CREATE OR REPLACE FUNCTION get_opinion_upvote_breakdown(opinion_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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