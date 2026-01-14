-- Update admin role to correct email
DELETE FROM public.user_roles WHERE role = 'admin';

-- Grant admin role to correct email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'inphroneofficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Clean all account data but keep accounts
DELETE FROM public.opinion_views;
DELETE FROM public.opinion_upvotes;
DELETE FROM public.insight_ripples;
DELETE FROM public.time_capsules;
DELETE FROM public.opinions;
DELETE FROM public.notifications;
DELETE FROM public.user_badges;
DELETE FROM public.user_streaks;
DELETE FROM public.user_avatars;
DELETE FROM public.rewards;
DELETE FROM public.coupons;
DELETE FROM public.user_activity_logs;
DELETE FROM public.weekly_wisdom_reports;
DELETE FROM public.wave_participants;
DELETE FROM public.cultural_energy_map;
DELETE FROM public.weekly_stats;

-- Reset auto-increment avatar data by recreating for existing users
INSERT INTO public.user_avatars (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Reset streaks for existing users
INSERT INTO public.user_streaks (user_id, last_activity_date)
SELECT id, CURRENT_DATE FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Add RLS policy to prevent audience from upvoting
DROP POLICY IF EXISTS "Users can insert their own upvotes" ON public.opinion_upvotes;

CREATE POLICY "Non-audience users can insert upvotes"
ON public.opinion_upvotes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type != 'audience'
  )
);