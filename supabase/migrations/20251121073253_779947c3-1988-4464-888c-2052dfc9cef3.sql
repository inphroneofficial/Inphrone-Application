-- Fix function search path for update_cultural_energy_map
CREATE OR REPLACE FUNCTION update_cultural_energy_map()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user's location info
  DECLARE
    user_city TEXT;
    user_country TEXT;
    category_id UUID;
  BEGIN
    -- Fetch profile information
    SELECT p.city, p.country INTO user_city, user_country
    FROM profiles p
    WHERE p.id = NEW.user_id;
    
    -- Get category_id
    category_id := NEW.category_id;
    
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
        category_id,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;