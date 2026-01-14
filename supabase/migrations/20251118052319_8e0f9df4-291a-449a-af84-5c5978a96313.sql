-- Full data reset: Clear all opinions, coupons, profiles, and auth users
-- Delete all opinion-related data
DELETE FROM opinion_views;
DELETE FROM opinion_upvotes;
DELETE FROM insight_ripples;
DELETE FROM time_capsules;
DELETE FROM opinions;

-- Delete all user activity and rewards
DELETE FROM user_activity_logs;
DELETE FROM user_badges;
DELETE FROM user_streaks;
DELETE FROM user_avatars;
DELETE FROM rewards;
DELETE FROM coupons;
DELETE FROM weekly_wisdom_reports;
DELETE FROM notifications;
DELETE FROM referrals;
DELETE FROM reviews;
DELETE FROM wave_participants;

-- Delete all profile type tables
DELETE FROM audience_profiles;
DELETE FROM creator_profiles;
DELETE FROM studio_profiles;
DELETE FROM ott_profiles;
DELETE FROM tv_profiles;
DELETE FROM gaming_profiles;
DELETE FROM music_profiles;

-- Delete all profiles
DELETE FROM profiles;

-- Clean up deletion logs and backups
DELETE FROM account_deletion_attempts;
DELETE FROM deleted_accounts_log;
DELETE FROM deleted_accounts_backup;

-- Clean up email digest preferences
DELETE FROM email_digest_preferences;

-- Note: To fully clear auth users, we need to delete them from auth.users
-- This can only be done via edge function or admin API, not SQL
-- The handle_new_user function now defaults to 'pending' to prevent auto-role assignment