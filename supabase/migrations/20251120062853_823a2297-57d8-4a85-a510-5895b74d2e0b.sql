-- Grant admin role to user
-- Replace 'USER_EMAIL_HERE' with the actual email address that needs admin access

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID from auth.users using the email
  -- You'll need to replace 'USER_EMAIL_HERE' with the actual email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'gadidamalla@gmail.com'
  LIMIT 1;

  -- Only insert if user exists and doesn't already have admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (admin_user_id, 'admin', admin_user_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;