-- Fix function search_path for security
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(12) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN 'INP-' || result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION generate_ambassador_code(college_name VARCHAR)
RETURNS VARCHAR(20) AS $$
DECLARE
  prefix VARCHAR(6);
  suffix VARCHAR(6);
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  prefix := upper(left(regexp_replace(college_name, '[^a-zA-Z]', '', 'g'), 4));
  IF length(prefix) < 4 THEN
    prefix := rpad(prefix, 4, 'X');
  END IF;
  suffix := '';
  FOR i IN 1..6 LOOP
    suffix := suffix || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN 'CA-' || prefix || '-' || suffix;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;