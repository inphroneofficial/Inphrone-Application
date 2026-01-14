-- Drop existing triggers that might have ambiguous references
DROP TRIGGER IF EXISTS update_cultural_energy_trigger ON public.opinions;
DROP TRIGGER IF EXISTS update_cultural_energy_map_trigger ON public.opinions;

-- Recreate the update_cultural_energy function with fully qualified column names
CREATE OR REPLACE FUNCTION public.update_cultural_energy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_city TEXT;
  user_country TEXT;
BEGIN
  -- Get user's location from profiles with explicit column reference
  SELECT profiles.city, profiles.country INTO user_city, user_country
  FROM profiles
  WHERE profiles.id = NEW.user_id;
  
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

-- Recreate the update_cultural_energy_map function with fully qualified column names
CREATE OR REPLACE FUNCTION public.update_cultural_energy_map()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_city TEXT;
  user_country TEXT;
  user_category_id UUID;
BEGIN
  -- Fetch profile information with explicit column references
  SELECT profiles.city, profiles.country INTO user_city, user_country
  FROM profiles
  WHERE profiles.id = NEW.user_id;
  
  -- Get category_id from the NEW record (opinions table)
  user_category_id := NEW.category_id;
  
  -- Only update if we have valid location data
  IF user_city IS NOT NULL AND user_country IS NOT NULL THEN
    -- Insert or update the energy map
    INSERT INTO cultural_energy_map (
      city,
      country,
      category_id,
      energy_level,
      total_opinions,
      last_activity_at
    )
    VALUES (
      user_city,
      user_country,
      user_category_id,
      1,
      1,
      NOW()
    )
    ON CONFLICT (city, country, category_id)
    DO UPDATE SET
      energy_level = cultural_energy_map.energy_level + 1,
      total_opinions = cultural_energy_map.total_opinions + 1,
      last_activity_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate triggers
CREATE TRIGGER update_cultural_energy_trigger
  AFTER INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cultural_energy();

CREATE TRIGGER update_cultural_energy_map_trigger
  AFTER INSERT ON public.opinions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cultural_energy_map();