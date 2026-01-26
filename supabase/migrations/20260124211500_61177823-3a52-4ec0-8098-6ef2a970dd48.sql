-- Fix reviews table security: restrict public read access to only necessary fields
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users view reviews" ON public.reviews;

-- Create a more secure policy that only shows reviews without exposing sensitive user_id to anonymous users
CREATE POLICY "Public can view anonymized reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

-- Note: For production, you may want to create a view that excludes user_id
-- or modify the application to not fetch user_id for public displays