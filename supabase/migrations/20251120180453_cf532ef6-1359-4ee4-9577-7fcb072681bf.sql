-- Drop the recursive policy
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;

-- Create a simple, non-recursive policy
-- Users can see their own profile OR any audience profile (for analytics)
CREATE POLICY "Profiles view policy" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR user_type = 'audience'
);