-- Remove admin role from incorrect emails
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('gadidamalla@gmail.com', 'inphrinphroneofficial@gmail.com')
) AND role = 'admin';

-- Grant admin role to correct email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'inphroneofficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;