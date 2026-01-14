-- Fix all database functions to have proper search_path set for security

-- This migration addresses the security warnings about mutable search_path in functions
-- All functions now have SET search_path = 'public' to prevent privilege escalation

-- Fix check_coupon_expiry function
CREATE OR REPLACE FUNCTION public.check_coupon_expiry()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.coupons
  SET status = 'expired'
  WHERE expires_at < now() AND status = 'active';
END;
$function$;

-- Fix create_user_avatar function
CREATE OR REPLACE FUNCTION public.create_user_avatar()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO user_avatars (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix create_user_streak function
CREATE OR REPLACE FUNCTION public.create_user_streak()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO user_streaks (user_id, last_activity_date)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix update_avatar_on_opinion function
CREATE OR REPLACE FUNCTION public.update_avatar_on_opinion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix create_welcome_notification function
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'Welcome to InPhrone! 🎉',
    'Start sharing your opinions and help shape the future of entertainment.',
    'welcome'
  );
  RETURN NEW;
END;
$function$;

-- Fix generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$function$;

-- Fix update_digest_preferences_updated_at function
CREATE OR REPLACE FUNCTION public.update_digest_preferences_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_streak_on_opinion function
CREATE OR REPLACE FUNCTION public.update_streak_on_opinion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix update_harmony_on_upvote function
CREATE OR REPLACE FUNCTION public.update_harmony_on_upvote()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Update harmony energy for the opinion author when they receive an upvote
  UPDATE user_avatars
  SET 
    harmony_flow = harmony_flow + 3,
    updated_at = now()
  WHERE user_id = (SELECT user_id FROM opinions WHERE id = NEW.opinion_id);
  
  RETURN NEW;
END;
$function$;

-- Fix update_cultural_energy function
CREATE OR REPLACE FUNCTION public.update_cultural_energy()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix calculate_evolution_stage function
CREATE OR REPLACE FUNCTION public.calculate_evolution_stage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix award_badges_on_milestone function
CREATE OR REPLACE FUNCTION public.award_badges_on_milestone()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix award_badges_on_upvote function
CREATE OR REPLACE FUNCTION public.award_badges_on_upvote()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;