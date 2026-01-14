-- Create table to track who viewed which opinions
CREATE TABLE IF NOT EXISTS public.opinion_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id UUID NOT NULL REFERENCES public.opinions(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(opinion_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.opinion_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Opinion owners can view who viewed their opinions"
  ON public.opinion_views FOR SELECT
  USING (
    opinion_id IN (
      SELECT id FROM public.opinions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert view records"
  ON public.opinion_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_opinion_views_opinion_id ON public.opinion_views(opinion_id);
CREATE INDEX IF NOT EXISTS idx_opinion_views_viewer_id ON public.opinion_views(viewer_id);