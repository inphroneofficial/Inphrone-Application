-- Update profiles table to allow tv and music user types
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('audience', 'creator', 'studio', 'production', 'ott', 'tv', 'music'));