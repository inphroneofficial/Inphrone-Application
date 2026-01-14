-- Purge all user-related application data (safe order to respect FKs)
BEGIN;
-- Activity & derived data
DELETE FROM public.user_activity_logs;
DELETE FROM public.weekly_wisdom_reports;
DELETE FROM public.weekly_stats;
DELETE FROM public.notifications;
DELETE FROM public.wave_participants;

-- Opinion interactions
DELETE FROM public.opinion_views;
DELETE FROM public.opinion_upvotes;
DELETE FROM public.insight_ripples;
DELETE FROM public.time_capsules;

-- Rewards & gamification
DELETE FROM public.user_badges;
DELETE FROM public.user_streaks;
DELETE FROM public.user_avatars;
DELETE FROM public.rewards;
DELETE FROM public.coupons;

-- Referrals & digests
DELETE FROM public.referrals;
DELETE FROM public.email_digest_preferences;

-- Opinions themselves
DELETE FROM public.opinions;

-- Profile-type tables
DELETE FROM public.audience_profiles;
DELETE FROM public.creator_profiles;
DELETE FROM public.studio_profiles;
DELETE FROM public.ott_profiles;
DELETE FROM public.tv_profiles;
DELETE FROM public.gaming_profiles;
DELETE FROM public.music_profiles;

-- Logs and backups
DELETE FROM public.account_deletion_attempts;
DELETE FROM public.deleted_accounts_backup;
DELETE FROM public.deleted_accounts_log;

-- Aggregates/maps
DELETE FROM public.cultural_energy_map;

-- Core profiles last
DELETE FROM public.profiles;
COMMIT;