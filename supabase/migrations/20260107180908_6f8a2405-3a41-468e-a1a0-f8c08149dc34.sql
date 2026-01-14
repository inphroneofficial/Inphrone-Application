-- Fix the remaining overly permissive notification policy
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

-- Create a proper policy that allows edge functions to insert via service role
-- Since edge functions use service role which bypasses RLS, we don't need a WITH CHECK (true) policy
-- Instead, let's create a policy that allows authenticated users to receive notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);