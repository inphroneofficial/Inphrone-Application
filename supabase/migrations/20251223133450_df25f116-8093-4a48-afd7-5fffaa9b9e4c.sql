-- Add deletion_reason column to store violation reasons when admins delete questions
ALTER TABLE public.your_turn_questions 
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- Drop the existing overly permissive UPDATE policy
DROP POLICY IF EXISTS "Admins can update questions" ON public.your_turn_questions;

-- Create a proper admin-only update policy using the has_role function
CREATE POLICY "Admins can update questions"
ON public.your_turn_questions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also allow the question owner to update their own question (for editing options, etc)
CREATE POLICY "Users can update their own questions"
ON public.your_turn_questions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);