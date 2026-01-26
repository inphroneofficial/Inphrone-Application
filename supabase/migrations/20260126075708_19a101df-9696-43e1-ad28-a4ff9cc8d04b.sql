-- Add RLS policy for admins to read all hype_signals
CREATE POLICY "Admins can view all hype signals"
ON public.hype_signals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR auth.uid() IS NOT NULL
);

-- Allow admins to update/archive signals
CREATE POLICY "Admins can update hype signals"
ON public.hype_signals
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete hype signals
CREATE POLICY "Admins can delete hype signals"
ON public.hype_signals
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete hype votes when deleting a signal
CREATE POLICY "Admins can delete hype votes"
ON public.hype_votes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);