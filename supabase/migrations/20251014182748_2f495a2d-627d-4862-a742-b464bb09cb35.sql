-- Delete all user-related data from existing tables
DELETE FROM public.opinion_upvotes;
DELETE FROM public.opinions;
DELETE FROM public.rewards;
DELETE FROM public.coupons;
DELETE FROM public.audience_profiles;
DELETE FROM public.creator_profiles;
DELETE FROM public.studio_profiles;
DELETE FROM public.user_activity_logs;
DELETE FROM public.profiles;

-- Delete auth users (this will cascade delete related data)
DELETE FROM auth.users;