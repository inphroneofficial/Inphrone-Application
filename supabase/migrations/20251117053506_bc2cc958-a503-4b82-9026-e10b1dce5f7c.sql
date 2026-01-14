-- Clean database: Delete all opinions, coupons, and user data
-- This will cascade delete related data due to foreign keys

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

-- Delete all profile type tables
DELETE FROM audience_profiles;
DELETE FROM creator_profiles;
DELETE FROM studio_profiles;
DELETE FROM ott_profiles;
DELETE FROM tv_profiles;
DELETE FROM gaming_profiles;
DELETE FROM music_profiles;

-- Delete all profiles (but keep auth.users - they'll be cleaned by the delete-account function)
DELETE FROM profiles;

-- Clean up deletion logs and backups
DELETE FROM account_deletion_attempts;
DELETE FROM deleted_accounts_log;
DELETE FROM deleted_accounts_backup;

-- Note: auth.users will remain and must be cleaned separately via account deletion
-- This ensures users can still sign up with the same email after account deletion