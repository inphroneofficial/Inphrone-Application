-- Fix overly permissive system insert policy on profiles table
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;