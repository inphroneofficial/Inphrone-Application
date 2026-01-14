-- Security Fix Migration: Address all warn-level security issues

-- ========================================
-- 1. CREATE ADMIN ROLE SYSTEM (RBAC)
-- ========================================

-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for authorization
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can grant roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can revoke roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- 2. FIX DELETED_ACCOUNTS_LOG ACCESS
-- ========================================

-- Add admin-only policy for viewing deletion logs
CREATE POLICY "Admins can view deletion logs"
ON public.deleted_accounts_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- 3. FIX DATABASE FUNCTION SEARCH_PATH
-- ========================================

-- Fix update_digest_preferences_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_digest_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Add search_path to utility functions (best practice)
CREATE OR REPLACE FUNCTION public.get_week_start()
RETURNS date
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT date_trunc('week', CURRENT_DATE)::date;
$$;

CREATE OR REPLACE FUNCTION public.get_days_left_in_week()
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 7 - EXTRACT(DOW FROM CURRENT_DATE)::integer;
$$;

-- ========================================
-- 4. ADD OPINION RATE LIMITING
-- ========================================

-- Create rate limiting trigger function (max 5 opinions per hour)
CREATE OR REPLACE FUNCTION public.check_opinion_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count opinions in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.opinions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 opinions per hour. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add rate limiting trigger to opinions table
DROP TRIGGER IF EXISTS opinion_rate_limit_check ON public.opinions;
CREATE TRIGGER opinion_rate_limit_check
  BEFORE INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_opinion_rate_limit();

-- ========================================
-- 5. ACCOUNT DELETION RATE LIMITING TRACKING
-- ========================================

-- Create table to track deletion attempts for rate limiting
CREATE TABLE public.account_deletion_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.account_deletion_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion attempts
CREATE POLICY "Users can view their own deletion attempts"
ON public.account_deletion_attempts
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert deletion attempts (edge function will use service role)
CREATE POLICY "System can insert deletion attempts"
ON public.account_deletion_attempts
FOR INSERT
WITH CHECK (true);

-- Admins can view all deletion attempts for monitoring
CREATE POLICY "Admins can view all deletion attempts"
ON public.account_deletion_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));