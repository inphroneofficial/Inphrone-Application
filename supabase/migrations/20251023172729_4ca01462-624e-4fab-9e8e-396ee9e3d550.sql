-- Robust migration: add realtime and trigger with existence checks

-- Ensure replica identity (safe to run repeatedly)
ALTER TABLE public.opinions REPLICA IDENTITY FULL;
ALTER TABLE public.opinion_upvotes REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication if not already present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'opinions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.opinions;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'opinion_upvotes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.opinion_upvotes;
  END IF;
END $$;

-- Enforce one opinion per user per calendar week (Monday 00:00 UTC to next Monday 00:00 UTC)
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

  SELECT EXISTS (
    SELECT 1
    FROM public.opinions o
    WHERE o.user_id = NEW.user_id
      AND o.created_at >= week_start
      AND o.created_at < week_end
  ) INTO exists_this_week;

  IF exists_this_week THEN
    RAISE EXCEPTION 'You can submit only one opinion per week. Next eligible day is Monday.';
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger idempotently
DROP TRIGGER IF EXISTS trg_enforce_one_opinion_per_week ON public.opinions;
CREATE TRIGGER trg_enforce_one_opinion_per_week
BEFORE INSERT ON public.opinions
FOR EACH ROW EXECUTE FUNCTION public.enforce_one_opinion_per_week();