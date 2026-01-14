-- Create deleted_accounts_backup table to store name, email, location when users delete their accounts
CREATE TABLE IF NOT EXISTS public.deleted_accounts_backup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  city TEXT,
  state_region TEXT,
  country TEXT,
  user_type TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deleted_accounts_backup ENABLE ROW LEVEL SECURITY;

-- Only admins can view deletion backups
CREATE POLICY "Admins can view deletion backups"
ON public.deleted_accounts_backup
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert deletion backups
CREATE POLICY "System can insert deletion backups"
ON public.deleted_accounts_backup
FOR INSERT
WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX idx_deleted_accounts_backup_email ON public.deleted_accounts_backup(email);
CREATE INDEX idx_deleted_accounts_backup_deleted_at ON public.deleted_accounts_backup(deleted_at DESC);