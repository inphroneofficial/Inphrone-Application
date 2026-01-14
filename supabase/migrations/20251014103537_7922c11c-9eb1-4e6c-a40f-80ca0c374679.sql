-- Create table to track individual upvotes
CREATE TABLE IF NOT EXISTS public.opinion_upvotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opinion_id uuid NOT NULL REFERENCES public.opinions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(opinion_id, user_id)
);

-- Enable RLS
ALTER TABLE public.opinion_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies for opinion_upvotes
CREATE POLICY "Users can view all upvotes"
  ON public.opinion_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Users can upvote opinions"
  ON public.opinion_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes"
  ON public.opinion_upvotes FOR DELETE
  USING (auth.uid() = user_id);