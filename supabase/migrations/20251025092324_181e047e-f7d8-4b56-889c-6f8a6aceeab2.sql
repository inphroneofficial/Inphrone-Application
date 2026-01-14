-- Create function to increment opinion upvotes
CREATE OR REPLACE FUNCTION public.increment_opinion_upvotes(opinion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.opinions
  SET upvotes = upvotes + 1
  WHERE id = opinion_id;
END;
$$;

-- Create function to decrement opinion upvotes
CREATE OR REPLACE FUNCTION public.decrement_opinion_upvotes(opinion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.opinions
  SET upvotes = GREATEST(0, upvotes - 1)
  WHERE id = opinion_id;
END;
$$;