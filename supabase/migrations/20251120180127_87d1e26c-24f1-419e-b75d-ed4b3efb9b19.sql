-- Drop all existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Non-audience users can view audience member demographics" ON public.profiles;
DROP POLICY IF EXISTS "Audience users can view other audience demographics for analytics" ON public.profiles;

-- Create a single comprehensive SELECT policy
CREATE POLICY "Profiles view policy"
ON public.profiles
FOR SELECT
USING (
  -- User can always see their own profile
  auth.uid() = id 
  OR 
  -- Audience users can see other audience members' demographics for analytics
  (user_type = 'audience' AND EXISTS (
    SELECT 1 FROM public.profiles viewer 
    WHERE viewer.id = auth.uid()
  ))
  OR
  -- Non-audience users (creators, studios, etc.) can see all audience demographics
  (user_type = 'audience' AND public.is_non_audience_user(auth.uid()))
);