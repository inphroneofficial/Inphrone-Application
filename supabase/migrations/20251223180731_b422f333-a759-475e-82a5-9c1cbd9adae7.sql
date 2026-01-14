-- Update is_non_audience_user function to include developer
CREATE OR REPLACE FUNCTION public.is_non_audience_user(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND user_type IN ('creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music', 'developer')
  )
$function$;