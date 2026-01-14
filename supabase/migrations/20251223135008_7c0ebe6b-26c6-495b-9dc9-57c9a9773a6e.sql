-- Fix admin moderation of Your Turn questions (RLS)
-- Root cause: UPDATE was failing with "new row violates row-level security".
-- We re-create the admin policies with fully-qualified enum/function names and explicit TO authenticated.

ALTER TABLE public.your_turn_questions ENABLE ROW LEVEL SECURITY;

-- Recreate admin policies (fully qualified)
DROP POLICY IF EXISTS "Admins can update questions" ON public.your_turn_questions;
DROP POLICY IF EXISTS "Admins can view all questions" ON public.your_turn_questions;

CREATE POLICY "Admins can view all questions"
ON public.your_turn_questions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update questions"
ON public.your_turn_questions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
