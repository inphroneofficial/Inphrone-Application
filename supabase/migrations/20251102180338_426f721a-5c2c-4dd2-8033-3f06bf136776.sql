-- ============================================
-- FIX 1: CREATE MISSING TRIGGERS
-- ============================================

-- Trigger to create avatar when profile is created
CREATE TRIGGER create_user_avatar_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_avatar();

-- Trigger to create streak when profile is created  
CREATE TRIGGER create_user_streak_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_streak();

-- Trigger to update avatar when opinion is created
CREATE TRIGGER update_avatar_on_opinion_trigger
  AFTER INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_avatar_on_opinion();

-- Trigger to update cultural energy when opinion is created
CREATE TRIGGER update_cultural_energy_trigger
  AFTER INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cultural_energy();

-- ============================================
-- FIX 2: CREATE STREAK UPDATE LOGIC
-- ============================================

CREATE OR REPLACE FUNCTION public.update_streak_on_opinion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_activity DATE;
  days_diff INTEGER;
BEGIN
  -- Get user's last activity date
  SELECT last_activity_date INTO last_activity
  FROM user_streaks
  WHERE user_id = NEW.user_id;
  
  IF last_activity IS NULL THEN
    -- First activity
    UPDATE user_streaks
    SET 
      current_streak_weeks = 1,
      longest_streak_weeks = 1,
      last_activity_date = CURRENT_DATE,
      total_weekly_contributions = 1,
      streak_tier = 'none',
      updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSE
    days_diff := CURRENT_DATE - last_activity;
    
    IF days_diff <= 7 THEN
      -- Activity within the week - continue streak
      UPDATE user_streaks
      SET 
        last_activity_date = CURRENT_DATE,
        total_weekly_contributions = total_weekly_contributions + 1,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF days_diff <= 14 THEN
      -- New week started - increment streak
      UPDATE user_streaks
      SET 
        current_streak_weeks = current_streak_weeks + 1,
        longest_streak_weeks = GREATEST(longest_streak_weeks, current_streak_weeks + 1),
        last_activity_date = CURRENT_DATE,
        total_weekly_contributions = total_weekly_contributions + 1,
        streak_tier = CASE
          WHEN current_streak_weeks + 1 >= 12 THEN 'diamond'
          WHEN current_streak_weeks + 1 >= 8 THEN 'gold'
          WHEN current_streak_weeks + 1 >= 4 THEN 'silver'
          ELSE 'none'
        END,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Streak broken - reset
      UPDATE user_streaks
      SET 
        current_streak_weeks = 1,
        last_activity_date = CURRENT_DATE,
        total_weekly_contributions = total_weekly_contributions + 1,
        streak_tier = 'none',
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach streak update trigger
CREATE TRIGGER update_streak_on_opinion_trigger
  AFTER INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_on_opinion();

-- ============================================
-- FIX 3: CREATE HARMONY ENERGY UPDATE
-- ============================================

CREATE OR REPLACE FUNCTION public.update_harmony_on_upvote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update harmony energy for the opinion author when they receive an upvote
  UPDATE user_avatars
  SET 
    harmony_flow = harmony_flow + 3,
    updated_at = now()
  WHERE user_id = (SELECT user_id FROM opinions WHERE id = NEW.opinion_id);
  
  RETURN NEW;
END;
$$;

-- Attach harmony update trigger
CREATE TRIGGER update_harmony_on_upvote_trigger
  AFTER INSERT ON public.opinion_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_harmony_on_upvote();

-- ============================================
-- FIX 4: CREATE EVOLUTION STAGE CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_evolution_stage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_energy INTEGER;
  new_stage INTEGER;
  new_color TEXT;
  new_glow INTEGER;
BEGIN
  total_energy := NEW.wisdom_energy + NEW.harmony_flow + NEW.curiosity_sparks;
  
  -- Calculate evolution stage based on total energy
  new_stage := CASE
    WHEN total_energy >= 500 THEN 5
    WHEN total_energy >= 300 THEN 4
    WHEN total_energy >= 150 THEN 3
    WHEN total_energy >= 50 THEN 2
    ELSE 1
  END;
  
  -- Calculate avatar color based on stage
  new_color := CASE
    WHEN new_stage >= 5 THEN '#a855f7' -- purple
    WHEN new_stage >= 4 THEN '#3b82f6' -- blue
    WHEN new_stage >= 3 THEN '#10b981' -- green
    WHEN new_stage >= 2 THEN '#f59e0b' -- amber
    ELSE '#6366f1' -- indigo
  END;
  
  -- Calculate glow intensity
  new_glow := LEAST(100, 50 + (total_energy / 10));
  
  NEW.evolution_stage := new_stage;
  NEW.avatar_color := new_color;
  NEW.avatar_glow_intensity := new_glow;
  
  RETURN NEW;
END;
$$;

-- Attach evolution calculation trigger
CREATE TRIGGER calculate_evolution_stage_trigger
  BEFORE UPDATE ON public.user_avatars
  FOR EACH ROW
  WHEN (OLD.wisdom_energy != NEW.wisdom_energy 
    OR OLD.harmony_flow != NEW.harmony_flow 
    OR OLD.curiosity_sparks != NEW.curiosity_sparks)
  EXECUTE FUNCTION public.calculate_evolution_stage();

-- ============================================
-- FIX 5: CREATE AUTOMATIC BADGE AWARDS
-- ============================================

CREATE OR REPLACE FUNCTION public.award_badges_on_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  opinion_count INTEGER;
  upvote_count INTEGER;
  streak_weeks INTEGER;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO opinion_count
  FROM opinions
  WHERE user_id = NEW.user_id;
  
  SELECT COUNT(*) INTO upvote_count
  FROM opinion_upvotes ou
  JOIN opinions o ON ou.opinion_id = o.id
  WHERE o.user_id = NEW.user_id;
  
  SELECT current_streak_weeks INTO streak_weeks
  FROM user_streaks
  WHERE user_id = NEW.user_id;
  
  -- Award Visionary Key (5 opinions)
  IF opinion_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (
      NEW.user_id, 
      'visionary_key', 
      'Visionary Key', 
      'Unlocked for sharing 5 unique perspectives',
      jsonb_build_object('opinions_count', opinion_count)
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Award Harmony Key (10 upvotes received)
  IF upvote_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (
      NEW.user_id,
      'harmony_key',
      'Harmony Key',
      'Achieved resonance with 10+ community validations',
      jsonb_build_object('upvotes_received', upvote_count)
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Award Echo Key (first opinion)
  IF opinion_count = 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (
      NEW.user_id,
      'echo_key',
      'Echo Key',
      'Your first voice in the cultural conversation',
      jsonb_build_object('first_opinion_date', NEW.created_at)
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach badge award trigger
CREATE TRIGGER award_badges_on_opinion_trigger
  AFTER INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.award_badges_on_milestone();

-- Also award badges on upvotes
CREATE OR REPLACE FUNCTION public.award_badges_on_upvote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  upvote_count INTEGER;
  opinion_author UUID;
BEGIN
  -- Get opinion author
  SELECT user_id INTO opinion_author
  FROM opinions
  WHERE id = NEW.opinion_id;
  
  -- Count upvotes for this author
  SELECT COUNT(*) INTO upvote_count
  FROM opinion_upvotes ou
  JOIN opinions o ON ou.opinion_id = o.id
  WHERE o.user_id = opinion_author;
  
  -- Award Harmony Key
  IF upvote_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (
      opinion_author,
      'harmony_key',
      'Harmony Key',
      'Achieved resonance with 10+ community validations',
      jsonb_build_object('upvotes_received', upvote_count)
    )
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER award_badges_on_upvote_trigger
  AFTER INSERT ON public.opinion_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.award_badges_on_upvote();

-- ============================================
-- FIX 6: BACKFILL EXISTING USERS
-- ============================================

-- Create avatars for existing users without them
INSERT INTO user_avatars (user_id)
SELECT id FROM profiles 
WHERE id NOT IN (SELECT user_id FROM user_avatars)
ON CONFLICT (user_id) DO NOTHING;

-- Create streaks for existing users without them
INSERT INTO user_streaks (user_id, last_activity_date)
SELECT id, CURRENT_DATE FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_streaks)
ON CONFLICT (user_id) DO NOTHING;

-- Update avatars based on existing opinions
UPDATE user_avatars ua
SET 
  wisdom_energy = COALESCE((SELECT COUNT(*) * 10 FROM opinions WHERE user_id = ua.user_id), 0),
  curiosity_sparks = COALESCE((SELECT COUNT(*) * 5 FROM opinions WHERE user_id = ua.user_id), 0),
  harmony_flow = COALESCE((
    SELECT COUNT(*) * 3 
    FROM opinion_upvotes ou 
    JOIN opinions o ON ou.opinion_id = o.id 
    WHERE o.user_id = ua.user_id
  ), 0),
  total_opinions_contributed = COALESCE((SELECT COUNT(*) FROM opinions WHERE user_id = ua.user_id), 0),
  updated_at = now()
WHERE EXISTS (SELECT 1 FROM opinions WHERE user_id = ua.user_id);

-- Add unique constraint to prevent duplicate badges
ALTER TABLE user_badges ADD CONSTRAINT unique_user_badge UNIQUE (user_id, badge_type);