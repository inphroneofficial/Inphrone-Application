-- Fix infinite recursion by dropping the problematic policy and recreating it correctly
DROP POLICY IF EXISTS "Non-audience users can view audience member demographics" ON public.profiles;

-- Create a security definer function to check if viewer is non-audience
CREATE OR REPLACE FUNCTION public.is_non_audience_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND user_type IN ('creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music')
  )
$$;

-- Now create the policy using the function to avoid recursion
CREATE POLICY "Non-audience users can view audience member demographics"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR 
  (user_type = 'audience' AND public.is_non_audience_user(auth.uid()))
);