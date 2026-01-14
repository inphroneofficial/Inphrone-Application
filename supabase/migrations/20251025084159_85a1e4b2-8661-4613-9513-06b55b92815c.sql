-- Drop the existing trigger with correct name
DROP TRIGGER IF EXISTS trg_enforce_one_opinion_per_week ON public.opinions;
DROP FUNCTION IF EXISTS public.enforce_one_opinion_per_week() CASCADE;

-- Create updated function to check one opinion per week PER CATEGORY
CREATE OR REPLACE FUNCTION public.enforce_one_opinion_per_week()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  week_start date;
  week_end date;
  exists_this_week boolean;
BEGIN
  -- Calculate current week using existing helper (Monday-based)
  week_start := public.get_week_start();
  week_end := week_start + interval '7 days';

  -- Check if user already submitted opinion in THIS CATEGORY this week
  SELECT EXISTS (
    SELECT 1
    FROM public.opinions o
    WHERE o.user_id = NEW.user_id
      AND o.category_id = NEW.category_id
      AND o.created_at >= week_start
      AND o.created_at < week_end
  ) INTO exists_this_week;

  IF exists_this_week THEN
    RAISE EXCEPTION 'You can submit only one opinion per category per week. Next eligible day is Monday.';
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trg_enforce_one_opinion_per_week
BEFORE INSERT ON public.opinions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_one_opinion_per_week();