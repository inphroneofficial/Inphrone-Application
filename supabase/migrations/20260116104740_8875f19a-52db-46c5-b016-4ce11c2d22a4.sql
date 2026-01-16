-- Drop the insecure public read policy
DROP POLICY IF EXISTS "Anyone can view active referral codes for validation" ON public.referral_codes;

-- Create a secure SECURITY DEFINER function to validate referral codes
-- This returns the necessary data for claiming without exposing user relationships
CREATE OR REPLACE FUNCTION public.validate_and_get_referral_code(input_code TEXT)
RETURNS TABLE(
  code_id UUID,
  owner_user_id UUID,
  code TEXT,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id as code_id,
    rc.user_id as owner_user_id,
    rc.code,
    true as is_valid
  FROM public.referral_codes rc
  WHERE UPPER(rc.code) = UPPER(input_code) 
    AND rc.is_active = true
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.validate_and_get_referral_code(TEXT) TO authenticated;

-- Also create a simpler boolean check for basic validation (e.g., for unauthenticated preview)
CREATE OR REPLACE FUNCTION public.is_referral_code_valid(input_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.referral_codes 
    WHERE UPPER(code) = UPPER(input_code) AND is_active = true
  );
$$;

-- Grant execute to anon for basic validation (just returns true/false, no data)
GRANT EXECUTE ON FUNCTION public.is_referral_code_valid(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.is_referral_code_valid(TEXT) TO authenticated;