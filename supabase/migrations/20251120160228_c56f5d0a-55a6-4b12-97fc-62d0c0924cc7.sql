-- Remove admin role from incorrect email
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'gadidamalla@gmail.com'
) AND role = 'admin';

-- Grant admin role to correct email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'inphrinphroneofficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;