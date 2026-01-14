-- Allow non-audience users to view audience profiles (for demographic analytics)
CREATE POLICY "Non-audience users can view audience member demographics"
ON public.profiles
FOR SELECT
USING (
  -- Users can view their own profile
  auth.uid() = id 
  OR 
  -- Non-audience users can view audience profiles (for analytics)
  (
    user_type = 'audience' 
    AND 
    EXISTS (
      SELECT 1 FROM public.profiles viewer 
      WHERE viewer.id = auth.uid() 
      AND viewer.user_type IN ('creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music')
    )
  )
);