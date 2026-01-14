-- Function to create streak and avatar records for audience users
CREATE OR REPLACE FUNCTION public.create_audience_gamification_records()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create records for audience users
  IF NEW.user_type = 'audience' THEN
    -- Create user_streaks record
    INSERT INTO public.user_streaks (user_id, current_streak_weeks, longest_streak_weeks, streak_tier, total_weekly_contributions)
    VALUES (NEW.id, 0, 0, 'none', 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create user_avatars record
    INSERT INTO public.user_avatars (user_id, avatar_name, wisdom_energy, harmony_flow, curiosity_sparks, evolution_stage, total_opinions_contributed, avatar_color)
    VALUES (NEW.id, 'Insight Soul', 0, 0, 0, 1, 0, '#6366f1')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_audience_profile_created ON public.profiles;

-- Create trigger to run when audience profile is created
CREATE TRIGGER on_audience_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_audience_gamification_records();

-- Function to update streaks and avatars when opinion is created
CREATE OR REPLACE FUNCTION public.update_audience_gamification_on_opinion()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type text;
  v_current_week_start date;
  v_last_activity date;
  v_current_streak int;
  v_longest_streak int;
  v_total_contributions int;
  v_new_streak int;
  v_new_tier text;
BEGIN
  -- Check if user is audience
  SELECT user_type INTO v_user_type FROM public.profiles WHERE id = NEW.user_id;
  
  IF v_user_type = 'audience' THEN
    -- Get current week start (Monday)
    v_current_week_start := date_trunc('week', CURRENT_DATE)::date;
    
    -- Get current streak data
    SELECT current_streak_weeks, longest_streak_weeks, total_weekly_contributions, last_activity_date
    INTO v_current_streak, v_longest_streak, v_total_contributions, v_last_activity
    FROM public.user_streaks
    WHERE user_id = NEW.user_id;
    
    IF v_last_activity IS NULL OR v_last_activity < v_current_week_start - INTERVAL '7 days' THEN
      -- Streak broken or first activity
      v_new_streak := 1;
    ELSIF v_last_activity >= v_current_week_start THEN
      -- Same week, keep streak
      v_new_streak := COALESCE(v_current_streak, 0);
    ELSE
      -- Consecutive week, increment streak
      v_new_streak := COALESCE(v_current_streak, 0) + 1;
    END IF;
    
    -- Calculate tier
    IF v_new_streak >= 12 THEN
      v_new_tier := 'diamond';
    ELSIF v_new_streak >= 8 THEN
      v_new_tier := 'gold';
    ELSIF v_new_streak >= 4 THEN
      v_new_tier := 'silver';
    ELSE
      v_new_tier := 'none';
    END IF;
    
    -- Update user_streaks
    INSERT INTO public.user_streaks (user_id, current_streak_weeks, longest_streak_weeks, streak_tier, total_weekly_contributions, last_activity_date)
    VALUES (
      NEW.user_id,
      v_new_streak,
      GREATEST(v_new_streak, COALESCE(v_longest_streak, 0)),
      v_new_tier,
      COALESCE(v_total_contributions, 0) + 1,
      CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak_weeks = EXCLUDED.current_streak_weeks,
      longest_streak_weeks = GREATEST(user_streaks.longest_streak_weeks, EXCLUDED.longest_streak_weeks),
      streak_tier = EXCLUDED.streak_tier,
      total_weekly_contributions = user_streaks.total_weekly_contributions + 1,
      last_activity_date = EXCLUDED.last_activity_date,
      updated_at = now();
    
    -- Update user_avatars
    INSERT INTO public.user_avatars (user_id, avatar_name, wisdom_energy, harmony_flow, curiosity_sparks, evolution_stage, total_opinions_contributed)
    VALUES (
      NEW.user_id,
      'Insight Soul',
      10,
      12,
      5,
      1,
      1
    )
    ON CONFLICT (user_id) DO UPDATE SET
      wisdom_energy = LEAST(user_avatars.wisdom_energy + 10, 100),
      harmony_flow = user_avatars.harmony_flow + 12,
      curiosity_sparks = LEAST(user_avatars.curiosity_sparks + 5, 100),
      total_opinions_contributed = user_avatars.total_opinions_contributed + 1,
      evolution_stage = CASE 
        WHEN user_avatars.total_opinions_contributed + 1 >= 20 THEN 5
        WHEN user_avatars.total_opinions_contributed + 1 >= 15 THEN 4
        WHEN user_avatars.total_opinions_contributed + 1 >= 10 THEN 3
        WHEN user_avatars.total_opinions_contributed + 1 >= 5 THEN 2
        ELSE 1
      END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_opinion_created_update_gamification ON public.opinions;

-- Create trigger to run when opinion is created
CREATE TRIGGER on_opinion_created_update_gamification
  AFTER INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_audience_gamification_on_opinion();

-- Add unique constraint on user_id for user_streaks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_streaks_user_id_key'
  ) THEN
    ALTER TABLE public.user_streaks ADD CONSTRAINT user_streaks_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add unique constraint on user_id for user_avatars if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_avatars_user_id_key'
  ) THEN
    ALTER TABLE public.user_avatars ADD CONSTRAINT user_avatars_user_id_key UNIQUE (user_id);
  END IF;
END $$;