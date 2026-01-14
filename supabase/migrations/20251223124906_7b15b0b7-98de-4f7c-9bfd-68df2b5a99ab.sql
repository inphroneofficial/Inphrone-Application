-- Your Turn Slots: Tracks each time slot and its state
CREATE TABLE public.your_turn_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot_time TEXT NOT NULL CHECK (slot_time IN ('09:00', '14:00', '19:00')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired')),
  winner_id UUID REFERENCES public.profiles(id),
  attempt_count INTEGER DEFAULT 0,
  slot_started_at TIMESTAMP WITH TIME ZONE,
  slot_ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(slot_date, slot_time)
);

-- Your Turn Questions: Questions submitted by winners
CREATE TABLE public.your_turn_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.your_turn_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  is_approved BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Your Turn Votes: Individual votes on questions
CREATE TABLE public.your_turn_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.your_turn_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  selected_option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Your Turn Attempts: Who clicked "I'm In" for each slot
CREATE TABLE public.your_turn_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.your_turn_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_winner BOOLEAN DEFAULT false,
  UNIQUE(slot_id, user_id)
);

-- Your Turn History: Archived results after midnight
CREATE TABLE public.your_turn_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  winner_id UUID REFERENCES public.profiles(id),
  winner_name TEXT,
  question_text TEXT,
  options JSONB,
  vote_counts JSONB,
  total_votes INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.your_turn_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.your_turn_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.your_turn_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.your_turn_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.your_turn_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for your_turn_slots
CREATE POLICY "Anyone authenticated can view slots"
  ON public.your_turn_slots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage slots"
  ON public.your_turn_slots FOR ALL
  USING (true);

-- RLS Policies for your_turn_questions
CREATE POLICY "Anyone authenticated can view approved questions"
  ON public.your_turn_questions FOR SELECT
  USING (auth.role() = 'authenticated' AND is_deleted = false);

CREATE POLICY "Winners can insert their questions"
  ON public.your_turn_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update questions"
  ON public.your_turn_questions FOR UPDATE
  USING (true);

-- RLS Policies for your_turn_votes
CREATE POLICY "Anyone authenticated can view votes"
  ON public.your_turn_votes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Audience users can vote"
  ON public.your_turn_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'audience')
  );

-- RLS Policies for your_turn_attempts
CREATE POLICY "Anyone authenticated can view attempts"
  ON public.your_turn_attempts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Audience users can attempt"
  ON public.your_turn_attempts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'audience')
  );

-- RLS Policies for your_turn_history
CREATE POLICY "Anyone authenticated can view history"
  ON public.your_turn_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage history"
  ON public.your_turn_history FOR ALL
  USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.your_turn_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.your_turn_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.your_turn_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.your_turn_attempts;

-- Function to increment vote count
CREATE OR REPLACE FUNCTION public.increment_your_turn_votes(question_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.your_turn_questions
  SET total_votes = total_votes + 1, updated_at = now()
  WHERE id = question_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update attempt count
CREATE OR REPLACE FUNCTION public.increment_slot_attempts(slot_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.your_turn_slots
  SET attempt_count = attempt_count + 1, updated_at = now()
  WHERE id = slot_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;