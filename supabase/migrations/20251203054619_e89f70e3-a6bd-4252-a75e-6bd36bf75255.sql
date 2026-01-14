-- 1. Add 'gaming' to the profiles user_type check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type = ANY (ARRAY['audience'::text, 'creator'::text, 'studio'::text, 'production'::text, 'ott'::text, 'tv'::text, 'gaming'::text, 'music'::text]));

-- 2. Drop and recreate get_user_counts function with tv, gaming, music counts
DROP FUNCTION IF EXISTS public.get_user_counts();

CREATE FUNCTION public.get_user_counts()
RETURNS TABLE(
  total_users integer, 
  audience integer, 
  creator integer, 
  studio integer, 
  production integer, 
  ott integer,
  tv integer,
  gaming integer,
  music integer
)
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
    count(*) filter (where user_type = 'music')::int as music
  from public.profiles;
end;
$function$;