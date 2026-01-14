-- Create secure demographics function to bypass RLS while returning only aggregated data
CREATE OR REPLACE FUNCTION public.get_category_demographics(_category_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  -- Total opinions in category
  WITH base AS (
    SELECT o.id, p.gender, p.age_group, p.country, p.city
    FROM public.opinions o
    JOIN public.profiles p ON p.id = o.user_id
    WHERE o.category_id = _category_id
  )
  SELECT jsonb_build_object(
    'total', COALESCE((SELECT COUNT(*) FROM base), 0),
    'gender', COALESCE((
      SELECT jsonb_object_agg(coalesce(gender,'Not specified'), cnt)
      FROM (
        SELECT coalesce(gender,'Not specified') AS gender, COUNT(*) AS cnt
        FROM base GROUP BY 1
      ) s
    ), '{}'::jsonb),
    'age_groups', COALESCE((
      SELECT jsonb_object_agg(coalesce(age_group,'Not specified'), cnt)
      FROM (
        SELECT coalesce(age_group,'Not specified') AS age_group, COUNT(*) AS cnt
        FROM base GROUP BY 1
      ) s
    ), '{}'::jsonb),
    'countries', COALESCE((
      SELECT jsonb_object_agg(name, val)
      FROM (
        SELECT coalesce(country,'Not specified') AS name, COUNT(*) AS val
        FROM base GROUP BY 1 ORDER BY val DESC LIMIT 10
      ) s
    ), '{}'::jsonb),
    'cities', COALESCE((
      SELECT jsonb_object_agg(name, val)
      FROM (
        SELECT coalesce(city,'Not specified') AS name, COUNT(*) AS val
        FROM base GROUP BY 1 ORDER BY val DESC LIMIT 10
      ) s
    ), '{}'::jsonb)
  ) INTO result;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Create secure viewers function for seen-by counts and recent viewers list
CREATE OR REPLACE FUNCTION public.get_opinion_viewers(_opinion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  WITH v AS (
    SELECT v.id, v.viewed_at, p.full_name, p.user_type
    FROM public.opinion_views v
    LEFT JOIN public.profiles p ON p.id = v.viewer_id
    WHERE v.opinion_id = _opinion_id
  ),
  breakdown AS (
    SELECT coalesce(lower(user_type),'unknown') AS k, COUNT(*) AS c FROM v GROUP BY 1
  ),
  recent AS (
    SELECT jsonb_build_object('full_name', coalesce(full_name,'Anonymous'), 'user_type', coalesce(user_type,'unknown'), 'viewed_at', viewed_at)
    FROM v ORDER BY viewed_at DESC LIMIT 5
  )
  SELECT jsonb_build_object(
    'total', COALESCE((SELECT COUNT(*) FROM v), 0),
    'by_type', COALESCE((SELECT jsonb_object_agg(k, c) FROM breakdown), '{}'::jsonb),
    'recent', COALESCE((SELECT jsonb_agg(recent.*) FROM recent), '[]'::jsonb)
  ) INTO result;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Update new user handler to avoid forcing 'audience' by default
-- Default to 'pending' until onboarding chooses a role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    country,
    state_region,
    user_type,
    date_of_birth,
    onboarding_completed,
    created_at,
    updated_at
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'country', ''),
    '',
    coalesce(nullif(new.raw_user_meta_data->>'user_type',''), 'pending'),
    null,
    false,
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;