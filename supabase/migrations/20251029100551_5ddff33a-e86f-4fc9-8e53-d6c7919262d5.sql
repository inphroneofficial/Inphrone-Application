-- ===================================
-- INPHRONE GAMIFICATION SYSTEM
-- Complete database schema for all gamification features
-- ===================================

-- 1. CREATIVE SOUL SYSTEM - Living Insight Avatars
CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_name TEXT NOT NULL DEFAULT 'Insight Soul',
  wisdom_energy INTEGER DEFAULT 0,
  harmony_flow INTEGER DEFAULT 0,
  curiosity_sparks INTEGER DEFAULT 0,
  avatar_color TEXT DEFAULT '#6366f1',
  avatar_glow_intensity INTEGER DEFAULT 50,
  evolution_stage INTEGER DEFAULT 1,
  total_opinions_contributed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. WISDOM KEYS & BADGES SYSTEM
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- 'visionary_key', 'harmony_key', 'echo_key', 'origin_light', 'resonance_echo', 'trend_prophet'
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_type ON user_badges(badge_type);

-- 3. STREAK EVOLUTION SYSTEM
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak_weeks INTEGER DEFAULT 0,
  longest_streak_weeks INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_tier TEXT DEFAULT 'none', -- 'none', 'silver', 'gold', 'diamond'
  total_weekly_contributions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. INSIGHT RIPPLES - Track opinion influence
CREATE TABLE IF NOT EXISTS insight_ripples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id UUID NOT NULL REFERENCES opinions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ripple_reach INTEGER DEFAULT 0, -- How many people this ripple touched
  validation_count INTEGER DEFAULT 0, -- How many people validated this insight
  resonance_score INTEGER DEFAULT 0, -- Combined influence score
  earned_resonance_echo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_insight_ripples_opinion ON insight_ripples(opinion_id);
CREATE INDEX idx_insight_ripples_user ON insight_ripples(user_id);

-- 5. TIME CAPSULE OPINIONS
CREATE TABLE IF NOT EXISTS time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opinion_id UUID NOT NULL REFERENCES opinions(id) ON DELETE CASCADE,
  prediction_text TEXT NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT now(),
  unlock_date TIMESTAMPTZ NOT NULL,
  was_correct BOOLEAN DEFAULT NULL, -- NULL until evaluated
  trend_prophet_earned BOOLEAN DEFAULT false,
  evaluation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_time_capsules_user ON time_capsules(user_id);
CREATE INDEX idx_time_capsules_unlock_date ON time_capsules(unlock_date);

-- 6. WEEKLY WISDOM REPORTS
CREATE TABLE IF NOT EXISTS weekly_wisdom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  total_opinions INTEGER DEFAULT 0,
  total_likes_given INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  categories_explored JSONB DEFAULT '[]'::jsonb,
  wisdom_title TEXT, -- e.g., "Visionary Eye", "Sonic Sense"
  wisdom_score INTEGER DEFAULT 0,
  participation_pattern TEXT, -- 'listen', 'create', 'reflect'
  insights_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weekly_wisdom_user ON weekly_wisdom_reports(user_id);
CREATE INDEX idx_weekly_wisdom_week ON weekly_wisdom_reports(week_start_date);

-- 7. GLOBAL INSIGHT WAVES - When ideas become movement
CREATE TABLE IF NOT EXISTS global_insight_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_name TEXT NOT NULL,
  trend_topic TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  wave_started_at TIMESTAMPTZ DEFAULT now(),
  wave_peak_count INTEGER DEFAULT 0,
  originator_user_ids UUID[] DEFAULT ARRAY[]::UUID[],
  total_participants INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_global_waves_category ON global_insight_waves(category_id);
CREATE INDEX idx_global_waves_active ON global_insight_waves(is_active);

-- 8. USER PARTICIPATION IN WAVES
CREATE TABLE IF NOT EXISTS wave_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wave_id UUID NOT NULL REFERENCES global_insight_waves(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_originator BOOLEAN DEFAULT false,
  contribution_count INTEGER DEFAULT 1,
  UNIQUE(wave_id, user_id)
);

CREATE INDEX idx_wave_participants_wave ON wave_participants(wave_id);
CREATE INDEX idx_wave_participants_user ON wave_participants(user_id);

-- 9. CULTURAL ENERGY MAP DATA - Track global opinion hotspots
CREATE TABLE IF NOT EXISTS cultural_energy_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  energy_level INTEGER DEFAULT 1, -- Brightness/activity level
  total_opinions INTEGER DEFAULT 0,
  trending_topics JSONB DEFAULT '[]'::jsonb,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(city, country, category_id)
);

CREATE INDEX idx_cultural_energy_location ON cultural_energy_map(city, country);
CREATE INDEX idx_cultural_energy_category ON cultural_energy_map(category_id);

-- Enable RLS on all tables
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_ripples ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_wisdom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_insight_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE wave_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_energy_map ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_avatars
CREATE POLICY "Users can view their own avatar" ON user_avatars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own avatar" ON user_avatars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own avatar" ON user_avatars FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert badges" ON user_badges FOR INSERT WITH CHECK (true);

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for insight_ripples
CREATE POLICY "Anyone can view ripples" ON insight_ripples FOR SELECT USING (true);
CREATE POLICY "System can manage ripples" ON insight_ripples FOR ALL USING (true);

-- RLS Policies for time_capsules
CREATE POLICY "Users can view their own capsules" ON time_capsules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own capsules" ON time_capsules FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_wisdom_reports
CREATE POLICY "Users can view their own reports" ON weekly_wisdom_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert reports" ON weekly_wisdom_reports FOR INSERT WITH CHECK (true);

-- RLS Policies for global waves
CREATE POLICY "Anyone can view waves" ON global_insight_waves FOR SELECT USING (true);
CREATE POLICY "System can manage waves" ON global_insight_waves FOR ALL USING (true);

-- RLS Policies for wave_participants
CREATE POLICY "Anyone can view participants" ON wave_participants FOR SELECT USING (true);
CREATE POLICY "Users can join waves" ON wave_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cultural_energy_map
CREATE POLICY "Anyone can view cultural energy" ON cultural_energy_map FOR SELECT USING (true);
CREATE POLICY "System can manage cultural energy" ON cultural_energy_map FOR ALL USING (true);

-- Functions to auto-create avatar for new users
CREATE OR REPLACE FUNCTION create_user_avatar()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_avatars (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created_avatar
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_avatar();

-- Functions to auto-create streak for new users
CREATE OR REPLACE FUNCTION create_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_streaks (user_id, last_activity_date)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created_streak
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_streak();

-- Function to update avatar energy when opinions are created
CREATE OR REPLACE FUNCTION update_avatar_on_opinion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_avatars
  SET 
    wisdom_energy = wisdom_energy + 10,
    curiosity_sparks = curiosity_sparks + 5,
    total_opinions_contributed = total_opinions_contributed + 1,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_opinion_created_update_avatar
  AFTER INSERT ON opinions
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_on_opinion();

-- Function to update cultural energy map when opinions are created
CREATE OR REPLACE FUNCTION update_cultural_energy()
RETURNS TRIGGER AS $$
DECLARE
  user_city TEXT;
  user_country TEXT;
BEGIN
  -- Get user's location from profiles
  SELECT city, country INTO user_city, user_country
  FROM profiles
  WHERE id = NEW.user_id;
  
  IF user_city IS NOT NULL AND user_country IS NOT NULL THEN
    INSERT INTO cultural_energy_map (city, country, category_id, energy_level, total_opinions, last_activity_at)
    VALUES (user_city, user_country, NEW.category_id, 1, 1, now())
    ON CONFLICT (city, country, category_id) 
    DO UPDATE SET
      energy_level = cultural_energy_map.energy_level + 1,
      total_opinions = cultural_energy_map.total_opinions + 1,
      last_activity_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_opinion_update_cultural_energy
  AFTER INSERT ON opinions
  FOR EACH ROW
  EXECUTE FUNCTION update_cultural_energy();