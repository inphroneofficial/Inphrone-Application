-- Fix security vulnerabilities in profiles and opinion_upvotes tables

-- 1. Drop existing overly permissive policies on profiles
DROP POLICY IF EXISTS "Anyone can view audience profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view any profile" ON public.profiles;

-- 2. Create secure SELECT policy for profiles - users can only see their own profile
-- Exception: Non-audience users can see limited profile info for opinion context
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 3. Drop existing overly permissive policies on opinion_upvotes
DROP POLICY IF EXISTS "Users can view all upvotes" ON public.opinion_upvotes;
DROP POLICY IF EXISTS "Anyone can view upvotes" ON public.opinion_upvotes;

-- 4. Create secure SELECT policy for opinion_upvotes
-- Users can see upvotes on their own opinions OR their own upvotes
CREATE POLICY "Users can view relevant upvotes" 
ON public.opinion_upvotes 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.opinions 
    WHERE opinions.id = opinion_upvotes.opinion_id 
    AND opinions.user_id = auth.uid()
  )
);

-- 5. Ensure categories remains public (intentional for app functionality)
-- This is acceptable as categories contain no sensitive data
-- Verify the existing policy is correct
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);