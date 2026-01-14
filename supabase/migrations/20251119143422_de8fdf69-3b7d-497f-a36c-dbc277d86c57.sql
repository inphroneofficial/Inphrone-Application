-- Complete data cleanup - remove all user data and auth users
-- This will allow fresh signups without detecting previous accounts

BEGIN;

-- Delete all dependent data first
DELETE FROM public.opinion_views;
DELETE FROM public.opinion_upvotes;
DELETE FROM public.insight_ripples;
DELETE FROM public.time_capsules;
DELETE FROM public.notifications;
DELETE FROM public.user_badges;
DELETE FROM public.user_streaks;
DELETE FROM public.user_avatars;
DELETE FROM public.rewards;
DELETE FROM public.coupons;
DELETE FROM public.referrals;
DELETE FROM public.email_digest_preferences;
DELETE FROM public.user_activity_logs;
DELETE FROM public.weekly_wisdom_reports;
DELETE FROM public.weekly_stats;
DELETE FROM public.wave_participants;
DELETE FROM public.cultural_energy_map;

-- Delete opinions
DELETE FROM public.opinions;

-- Delete profile-type tables
DELETE FROM public.audience_profiles;
DELETE FROM public.creator_profiles;
DELETE FROM public.studio_profiles;
DELETE FROM public.ott_profiles;
DELETE FROM public.tv_profiles;
DELETE FROM public.gaming_profiles;
DELETE FROM public.music_profiles;

-- Delete deletion logs
DELETE FROM public.account_deletion_attempts;
DELETE FROM public.deleted_accounts_backup;
DELETE FROM public.deleted_accounts_log;

-- Delete profiles last
DELETE FROM public.profiles;

COMMIT;