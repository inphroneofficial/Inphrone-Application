-- Create categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create opinions table for audience submissions
CREATE TABLE public.opinions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  content_type text NOT NULL, -- 'movie', 'series', 'music_video', 'game', 'youtube_video'
  title text NOT NULL,
  description text NOT NULL,
  genre text,
  why_excited text NOT NULL,
  would_pay boolean DEFAULT false,
  estimated_budget text,
  target_audience text,
  similar_content text,
  additional_notes text,
  upvotes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create rewards table
CREATE TABLE public.rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  total_opinions integer DEFAULT 0,
  total_upvotes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create insights table for creators
CREATE TABLE public.insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  insight_type text NOT NULL, -- 'trending_genre', 'audience_demand', 'content_gap'
  title text NOT NULL,
  description text NOT NULL,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

-- Opinions policies
CREATE POLICY "Users can view all opinions"
ON public.opinions FOR SELECT
USING (true);

CREATE POLICY "Users can create their own opinions"
ON public.opinions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opinions"
ON public.opinions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opinions"
ON public.opinions FOR DELETE
USING (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Users can view their own rewards"
ON public.rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
ON public.rewards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rewards"
ON public.rewards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Anyone can view insights"
ON public.insights FOR SELECT
USING (true);

-- Triggers
CREATE TRIGGER update_opinions_updated_at
BEFORE UPDATE ON public.opinions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at
BEFORE UPDATE ON public.rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, icon, color, description) VALUES
('Film', 'Film', 'text-purple-500', 'Share your movie ideas and preferences'),
('Music', 'Music', 'text-pink-500', 'Tell us about music content you want to see'),
('OTT/TV', 'Tv', 'text-blue-500', 'Submit series and streaming content ideas'),
('YouTube', 'Youtube', 'text-red-500', 'Share YouTube content preferences'),
('Gaming', 'Gamepad2', 'text-green-500', 'Submit gaming content and game ideas');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.opinions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rewards;