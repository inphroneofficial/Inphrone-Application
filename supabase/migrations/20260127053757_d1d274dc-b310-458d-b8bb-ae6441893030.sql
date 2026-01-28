-- Fix RLS policy for hype_signals to allow admins to select with JOINs
-- Drop the existing admin select policy and recreate with a simpler check
DROP POLICY IF EXISTS "Admins can view all signals" ON public.hype_signals;

-- Create a new policy that allows admins to see ALL signals (including archived)
CREATE POLICY "Admins can view all signals v2"
ON public.hype_signals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Also create SELECT policy for profiles to allow JOINs from hype_signals
-- First check if the policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Anyone authenticated can read profiles'
  ) THEN
    CREATE POLICY "Anyone authenticated can read profiles"
    ON public.profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Fix admin delete policy for hype_votes to allow deleting any votes (for signal deletion)
DROP POLICY IF EXISTS "Admins can delete any votes" ON public.hype_votes;
CREATE POLICY "Admins can delete any votes"
ON public.hype_votes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Enable realtime for tables (safe to run even if already enabled)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['inphrosync_responses', 'hype_signals', 'hype_votes'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    EXCEPTION WHEN duplicate_object THEN
      -- Table already in publication, ignore
      NULL;
    END;
  END LOOP;
END $$;