-- COMPREHENSIVE SECURITY FIX: Remove all overly permissive policies

-- 1. Fix PROFILES table - remove the policy allowing public view of audience profiles
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- Keep only one SELECT policy per use case
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Fix CREATOR_PROFILES - ensure users can only view their own
DROP POLICY IF EXISTS "Users can view their own creator profile" ON public.creator_profiles;
CREATE POLICY "Users can view their own creator profile" 
ON public.creator_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Fix STUDIO_PROFILES - ensure users can only view their own
DROP POLICY IF EXISTS "Users can view their own studio profile" ON public.studio_profiles;
CREATE POLICY "Users can view their own studio profile" 
ON public.studio_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Fix OTT_PROFILES - ensure users can only view their own
DROP POLICY IF EXISTS "Users can view their own ott profile" ON public.ott_profiles;
CREATE POLICY "Users can view their own ott profile" 
ON public.ott_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Fix TV_PROFILES - ensure users can only view their own
DROP POLICY IF EXISTS "Users can view their own tv profile" ON public.tv_profiles;
CREATE POLICY "Users can view their own tv profile" 
ON public.tv_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 6. Fix GAMING_PROFILES - ensure users can only view their own
DROP POLICY IF EXISTS "Users can view their own gaming profile" ON public.gaming_profiles;
CREATE POLICY "Users can view their own gaming profile" 
ON public.gaming_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 7. Fix MUSIC_PROFILES - ensure users can only view their own
DROP POLICY IF EXISTS "Users can view their own music profile" ON public.music_profiles;
CREATE POLICY "Users can view their own music profile" 
ON public.music_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 8. Fix OPINION_UPVOTES - restrict to own upvotes or upvotes on own opinions
DROP POLICY IF EXISTS "Users can view relevant upvotes" ON public.opinion_upvotes;
DROP POLICY IF EXISTS "Users can view all upvotes" ON public.opinion_upvotes;
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