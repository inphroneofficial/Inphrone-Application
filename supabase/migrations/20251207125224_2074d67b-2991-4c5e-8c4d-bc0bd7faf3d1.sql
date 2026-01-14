
-- Add InphroSync streak column to user_streaks table
ALTER TABLE public.user_streaks 
ADD COLUMN IF NOT EXISTS inphrosync_streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inphrosync_last_participation DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS inphrosync_longest_streak INTEGER DEFAULT 0;

-- Update existing audience users' streaks based on their submitted opinions
-- Calculate current_streak_weeks based on opinion activity
UPDATE public.user_streaks us
SET 
  current_streak_weeks = CASE 
    WHEN (SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) >= 7 THEN 
      GREATEST(1, FLOOR((SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) / 7))::int
    WHEN (SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) >= 1 THEN 1
    ELSE 0
  END,
  longest_streak_weeks = CASE 
    WHEN (SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) >= 7 THEN 
      GREATEST(1, FLOOR((SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) / 7))::int
    WHEN (SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) >= 1 THEN 1
    ELSE 0
  END,
  streak_tier = CASE 
    WHEN FLOOR((SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) / 7) >= 12 THEN 'diamond'
    WHEN FLOOR((SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) / 7) >= 8 THEN 'gold'
    WHEN FLOOR((SELECT COUNT(*) FROM opinions WHERE user_id = us.user_id) / 7) >= 4 THEN 'silver'
    ELSE 'none'
  END,
  updated_at = now()
WHERE EXISTS (SELECT 1 FROM profiles p WHERE p.id = us.user_id AND p.user_type = 'audience');

-- Update InphroSync streaks based on participation data
UPDATE public.user_streaks us
SET 
  inphrosync_streak_days = (
    SELECT COUNT(DISTINCT response_date) 
    FROM inphrosync_responses 
    WHERE user_id = us.user_id
  ),
  inphrosync_longest_streak = (
    SELECT COUNT(DISTINCT response_date) 
    FROM inphrosync_responses 
    WHERE user_id = us.user_id
  ),
  inphrosync_last_participation = (
    SELECT MAX(response_date) 
    FROM inphrosync_responses 
    WHERE user_id = us.user_id
  )
WHERE EXISTS (SELECT 1 FROM profiles p WHERE p.id = us.user_id AND p.user_type = 'audience');

-- Create function to update InphroSync streak when user participates
CREATE OR REPLACE FUNCTION public.update_inphrosync_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_participation DATE;
  v_current_streak INT;
BEGIN
  -- Get user's last InphroSync participation date
  SELECT inphrosync_last_participation, inphrosync_streak_days
  INTO v_last_participation, v_current_streak
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  -- Update streak based on participation pattern
  IF v_last_participation IS NULL OR v_last_participation < NEW.response_date - 1 THEN
    -- Streak broken or first participation
    UPDATE user_streaks
    SET 
      inphrosync_streak_days = 1,
      inphrosync_last_participation = NEW.response_date,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF v_last_participation = NEW.response_date - 1 THEN
    -- Consecutive day
    UPDATE user_streaks
    SET 
      inphrosync_streak_days = COALESCE(inphrosync_streak_days, 0) + 1,
      inphrosync_longest_streak = GREATEST(COALESCE(inphrosync_longest_streak, 0), COALESCE(inphrosync_streak_days, 0) + 1),
      inphrosync_last_participation = NEW.response_date,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  -- Same day participation doesn't change streak

  RETURN NEW;
END;
$$;

-- Create trigger for InphroSync participation
DROP TRIGGER IF EXISTS on_inphrosync_response_streak ON public.inphrosync_responses;
CREATE TRIGGER on_inphrosync_response_streak
  AFTER INSERT ON public.inphrosync_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inphrosync_streak();
