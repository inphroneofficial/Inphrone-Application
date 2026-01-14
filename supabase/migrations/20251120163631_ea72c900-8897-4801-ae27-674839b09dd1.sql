-- Update admin email from gadidamalla@gmail.com to inphroneofficial@gmail.com
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM public.profiles WHERE email = 'gadidamalla@gmail.com'
) AND role = 'admin';

-- Grant admin role to inphroneofficial@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE email = 'inphroneofficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove the RLS policy that allows audience to insert upvotes
DROP POLICY IF EXISTS "Users can upvote opinions" ON public.opinion_upvotes;

-- Update RLS policy to only allow non-audience users to like/upvote
-- Keep the existing "Non-audience users can insert upvotes" policy active