-- Add admin policies for inphrosync_questions table
-- Allow admins to update questions
CREATE POLICY "Admins can update questions"
ON public.inphrosync_questions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to insert questions
CREATE POLICY "Admins can insert questions"
ON public.inphrosync_questions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to delete questions
CREATE POLICY "Admins can delete questions"
ON public.inphrosync_questions
FOR DELETE
USING (has_role(auth.uid(), 'admin'));