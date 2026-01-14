-- Drop existing function and recreate with developer column
DROP FUNCTION IF EXISTS public.get_user_counts();

CREATE FUNCTION public.get_user_counts()
 RETURNS TABLE(total_users integer, audience integer, creator integer, studio integer, production integer, ott integer, tv integer, gaming integer, music integer, developer integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return query
  select
    count(*)::int as total_users,
    count(*) filter (where user_type = 'audience')::int as audience,
    count(*) filter (where user_type = 'creator')::int as creator,
    count(*) filter (where user_type = 'studio')::int as studio,
    count(*) filter (where user_type = 'production')::int as production,
    count(*) filter (where user_type = 'ott')::int as ott,
    count(*) filter (where user_type = 'tv')::int as tv,
    count(*) filter (where user_type = 'gaming')::int as gaming,
    count(*) filter (where user_type = 'music')::int as music,
    count(*) filter (where user_type = 'developer')::int as developer
  from public.profiles;
end;
$function$;