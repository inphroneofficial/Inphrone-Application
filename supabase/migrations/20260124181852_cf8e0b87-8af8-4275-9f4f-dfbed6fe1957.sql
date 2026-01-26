-- Create hype_signals table for intent-based demand signaling
CREATE TABLE public.hype_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  created_by UUID NOT NULL,
  hype_count INTEGER DEFAULT 0,
  pass_count INTEGER DEFAULT 0,
  signal_score INTEGER GENERATED ALWAYS AS (hype_count - pass_count) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  is_archived BOOLEAN DEFAULT false,
  CONSTRAINT phrase_length CHECK (length(phrase) >= 2 AND length(phrase) <= 50)
);

-- Create hype_votes table for tracking user votes
CREATE TABLE public.hype_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES public.hype_signals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_vote_type CHECK (vote_type IN ('hype', 'pass')),
  CONSTRAINT unique_user_vote UNIQUE(signal_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_hype_signals_category ON public.hype_signals(category_id);
CREATE INDEX idx_hype_signals_score ON public.hype_signals(signal_score DESC);
CREATE INDEX idx_hype_signals_created ON public.hype_signals(created_at DESC);
CREATE INDEX idx_hype_signals_expires ON public.hype_signals(expires_at);
CREATE INDEX idx_hype_signals_archived ON public.hype_signals(is_archived);
CREATE INDEX idx_hype_votes_user ON public.hype_votes(user_id);
CREATE INDEX idx_hype_votes_signal ON public.hype_votes(signal_id);

-- Enable RLS
ALTER TABLE public.hype_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hype_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hype_signals
CREATE POLICY "Anyone authenticated can view active signals"
ON public.hype_signals FOR SELECT
USING (auth.role() = 'authenticated' AND is_archived = false);

CREATE POLICY "Audience users can create signals"
ON public.hype_signals FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'audience'
  )
);

CREATE POLICY "Users can update their own signals"
ON public.hype_signals FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all signals"
ON public.hype_signals FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any signal"
ON public.hype_signals FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete signals"
ON public.hype_signals FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for hype_votes
CREATE POLICY "Anyone authenticated can view votes"
ON public.hype_votes FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Audience users can vote"
ON public.hype_votes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'audience'
  )
);

CREATE POLICY "Users can update their own votes"
ON public.hype_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.hype_votes FOR DELETE
USING (auth.uid() = user_id);

-- Function to update signal counts when votes change
CREATE OR REPLACE FUNCTION public.update_signal_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'hype' THEN
      UPDATE public.hype_signals SET hype_count = hype_count + 1 WHERE id = NEW.signal_id;
    ELSE
      UPDATE public.hype_signals SET pass_count = pass_count + 1 WHERE id = NEW.signal_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote change
    IF OLD.vote_type = 'hype' AND NEW.vote_type = 'pass' THEN
      UPDATE public.hype_signals SET hype_count = hype_count - 1, pass_count = pass_count + 1 WHERE id = NEW.signal_id;
    ELSIF OLD.vote_type = 'pass' AND NEW.vote_type = 'hype' THEN
      UPDATE public.hype_signals SET hype_count = hype_count + 1, pass_count = pass_count - 1 WHERE id = NEW.signal_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'hype' THEN
      UPDATE public.hype_signals SET hype_count = GREATEST(0, hype_count - 1) WHERE id = OLD.signal_id;
    ELSE
      UPDATE public.hype_signals SET pass_count = GREATEST(0, pass_count - 1) WHERE id = OLD.signal_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically update counts
CREATE TRIGGER trigger_update_signal_counts
AFTER INSERT OR UPDATE OR DELETE ON public.hype_votes
FOR EACH ROW EXECUTE FUNCTION public.update_signal_counts();

-- Function to get rising signals (velocity-based)
CREATE OR REPLACE FUNCTION public.get_rising_signals(category_filter UUID DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  phrase TEXT,
  category_id UUID,
  hype_count INTEGER,
  pass_count INTEGER,
  signal_score INTEGER,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  velocity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.phrase,
    s.category_id,
    s.hype_count,
    s.pass_count,
    s.signal_score,
    s.created_at,
    s.expires_at,
    COUNT(v.id) FILTER (WHERE v.created_at > now() - interval '24 hours' AND v.vote_type = 'hype') as velocity
  FROM public.hype_signals s
  LEFT JOIN public.hype_votes v ON s.id = v.signal_id
  WHERE s.is_archived = false 
    AND s.expires_at > now()
    AND (category_filter IS NULL OR s.category_id = category_filter)
  GROUP BY s.id
  ORDER BY velocity DESC, s.signal_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.hype_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hype_votes;