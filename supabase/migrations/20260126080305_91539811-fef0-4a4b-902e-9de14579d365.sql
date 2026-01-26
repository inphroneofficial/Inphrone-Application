-- Remove duplicate RLS policies on hype_signals and hype_votes
-- Keep the cleaner versions using has_role function

DROP POLICY IF EXISTS "Admins can view all hype signals" ON public.hype_signals;
DROP POLICY IF EXISTS "Admins can update hype signals" ON public.hype_signals;
DROP POLICY IF EXISTS "Admins can delete hype signals" ON public.hype_signals;
DROP POLICY IF EXISTS "Admins can delete hype votes" ON public.hype_votes;

-- Ensure the correct policies exist (using has_role function)
-- These should already exist from previous migrations, but we'll ensure they're correct

DO $$
BEGIN
  -- Check and create admin view policy if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hype_signals' 
    AND policyname = 'Admins can view all signals'
  ) THEN
    CREATE POLICY "Admins can view all signals"
    ON public.hype_signals
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;

  -- Check and create admin update policy if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hype_signals' 
    AND policyname = 'Admins can update any signal'
  ) THEN
    CREATE POLICY "Admins can update any signal"
    ON public.hype_signals
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;

  -- Check and create admin delete policy if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hype_signals' 
    AND policyname = 'Admins can delete signals'
  ) THEN
    CREATE POLICY "Admins can delete signals"
    ON public.hype_signals
    FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;