-- Separate OTT/TV into two distinct categories
-- First, update any existing OTT/TV category to just OTT
UPDATE public.categories 
SET name = 'OTT',
    description = 'Share your opinions on OTT platforms, content preferences, and streaming experiences'
WHERE name = 'OTT/TV';

-- Insert TV as a separate category (check if it exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'TV') THEN
    INSERT INTO public.categories (name, icon, color, description)
    VALUES (
      'TV',
      'Tv',
      'from-pink-500 to-rose-500',
      'Share your opinions on television shows, channels, and broadcast content'
    );
  END IF;
END $$;

-- Update any opinions that were under OTT/TV to be under OTT
UPDATE public.opinions
SET category_id = (SELECT id FROM public.categories WHERE name = 'OTT' LIMIT 1)
WHERE category_id IN (
  SELECT id FROM public.categories WHERE name = 'OTT/TV'
);