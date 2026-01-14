-- Drop the existing check constraint and add a new one that includes 'developer'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('audience', 'creator', 'studio', 'production', 'ott', 'tv', 'gaming', 'music', 'developer', 'pending'));