-- Delete duplicate audience_profiles, keeping only the most recent one
DELETE FROM audience_profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM audience_profiles
  ORDER BY user_id, created_at DESC
);