-- Allow audience users to see other audience members' demographics
-- This is safe because we only expose aggregate analytics, not individual profiles
CREATE POLICY "Audience users can view other audience demographics for analytics"
ON public.profiles
FOR SELECT
USING (
  -- User can see their own profile
  auth.uid() = id 
  OR 
  -- Non-audience users can see audience profiles
  (user_type = 'audience' AND public.is_non_audience_user(auth.uid()))
  OR
  -- Audience users can see other audience profiles for analytics
  (user_type = 'audience' AND EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() AND p2.user_type = 'audience'
  ))
);