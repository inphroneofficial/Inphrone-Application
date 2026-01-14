-- Create table for soft-deleted accounts with 30-day grace period
CREATE TABLE IF NOT EXISTS public.pending_account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT,
  deletion_requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  permanent_deletion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  restored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pending_account_deletions ENABLE ROW LEVEL SECURITY;

-- Users can view their own pending deletion
CREATE POLICY "Users can view their own pending deletion"
ON public.pending_account_deletions
FOR SELECT
USING (auth.uid() = user_id);

-- Function to check if account is pending deletion
CREATE OR REPLACE FUNCTION public.is_account_pending_deletion(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pending_account_deletions
    WHERE user_id = check_user_id
    AND restored_at IS NULL
    AND permanent_deletion_date > NOW()
  );
$$;

-- Function to restore account from pending deletion
CREATE OR REPLACE FUNCTION public.restore_account()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  pending_record RECORD;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get pending deletion record
  SELECT * INTO pending_record
  FROM public.pending_account_deletions
  WHERE user_id = current_user_id
  AND restored_at IS NULL
  AND permanent_deletion_date > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No pending deletion found or grace period expired');
  END IF;

  -- Mark as restored
  UPDATE public.pending_account_deletions
  SET restored_at = NOW()
  WHERE user_id = current_user_id;

  -- Reactivate the user account if it was disabled
  -- Note: This assumes accounts are marked as inactive during soft delete
  
  RETURN json_build_object('success', true, 'message', 'Account restored successfully');
END;
$$;