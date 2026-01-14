-- Create table for InphroSync questions
CREATE TABLE public.inphrosync_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for user responses
CREATE TABLE public.inphrosync_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  response_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_type, response_date)
);

-- Enable RLS
ALTER TABLE public.inphrosync_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inphrosync_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions"
ON public.inphrosync_questions
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for responses
CREATE POLICY "Users can view all responses"
ON public.inphrosync_responses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Audience users can insert responses"
ON public.inphrosync_responses
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'audience'
  )
);

-- Insert default questions
INSERT INTO public.inphrosync_questions (question_type, question_text, options) VALUES
('mood', 'What was your entertainment-related mood yesterday?', 
 '[
   {"id": "cinematic_adventure", "label": "Cinematic Adventure"},
   {"id": "fun_comedy", "label": "Fun & Comedy"},
   {"id": "emotional_drama", "label": "Emotional / Drama"},
   {"id": "dark_intense", "label": "Dark & Intense"},
   {"id": "chill_relax", "label": "Chill & Relax"},
   {"id": "thriller_excitement", "label": "Thriller / Excitement"},
   {"id": "sci_fi_curiosity", "label": "Sci-Fi Curiosity"}
 ]'::jsonb),
('device', 'Which device did you use the most yesterday to consume entertainment?',
 '[
   {"id": "mobile", "label": "Mobile"},
   {"id": "tv", "label": "TV"},
   {"id": "laptop", "label": "Laptop"},
   {"id": "tablet", "label": "Tablet"},
   {"id": "smart_speaker", "label": "Smart Speaker"},
   {"id": "other", "label": "Other"}
 ]'::jsonb),
('app', 'Which app did you use the most yesterday to consume entertainment?',
 '[
   {"id": "netflix", "label": "Netflix"},
   {"id": "prime_video", "label": "Prime Video"},
   {"id": "youtube", "label": "YouTube"},
   {"id": "instagram", "label": "Instagram"},
   {"id": "hotstar", "label": "Hotstar"},
   {"id": "spotify", "label": "Spotify"},
   {"id": "jiocinema", "label": "JioCinema"},
   {"id": "zee5", "label": "Zee5"},
   {"id": "facebook", "label": "Facebook"},
   {"id": "others", "label": "Others"}
 ]'::jsonb);

-- Create indexes for performance
CREATE INDEX idx_inphrosync_responses_date ON public.inphrosync_responses(response_date);
CREATE INDEX idx_inphrosync_responses_type_date ON public.inphrosync_responses(question_type, response_date);
CREATE INDEX idx_inphrosync_responses_user_type_date ON public.inphrosync_responses(user_id, question_type, response_date);