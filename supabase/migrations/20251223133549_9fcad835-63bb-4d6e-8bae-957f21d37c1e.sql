-- Add admin delete policy for opinions
CREATE POLICY "Admins can delete any opinions"
ON public.opinions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin delete policy for reviews
CREATE POLICY "Admins can delete any reviews"
ON public.reviews
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin insert policy for notifications (for broadcast)
CREATE POLICY "Admins can insert any notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add admin select policy for notifications (to view all for management)
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin view policy for opinions (admins should see all)
CREATE POLICY "Admins can view all opinions"
ON public.opinions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin update policy for opinions (for moderation)
CREATE POLICY "Admins can update any opinions"
ON public.opinions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));