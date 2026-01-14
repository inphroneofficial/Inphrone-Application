-- Add admin role for the official admin account
-- First get the user ID
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID from profiles
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'inphroneofficial@gmail.com';
  
  -- Insert admin role if user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role added for user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user not found with email: inphroneofficial@gmail.com';
  END IF;
END $$;

-- Update coupon_pool logo URLs with correct merchant logos
UPDATE public.coupon_pool
SET logo_url = CASE merchant_name
  -- E-commerce
  WHEN 'Amazon' THEN 'https://logo.clearbit.com/amazon.in'
  WHEN 'Flipkart' THEN 'https://logo.clearbit.com/flipkart.com'
  WHEN 'Myntra' THEN 'https://logo.clearbit.com/myntra.com'
  WHEN 'Ajio' THEN 'https://logo.clearbit.com/ajio.com'
  WHEN 'Nykaa Fashion' THEN 'https://logo.clearbit.com/nykaafashion.com'
  WHEN 'Lifestyle' THEN 'https://logo.clearbit.com/lifestylestores.com'
  WHEN 'Tata CLiQ Fashion' THEN 'https://logo.clearbit.com/tatacliq.com'
  
  -- Food Delivery
  WHEN 'Swiggy' THEN 'https://logo.clearbit.com/swiggy.com'
  WHEN 'Zomato' THEN 'https://logo.clearbit.com/zomato.com'
  WHEN 'Dominos' THEN 'https://logo.clearbit.com/dominos.co.in'
  WHEN 'Pizza Hut' THEN 'https://logo.clearbit.com/pizzahut.co.in'
  WHEN 'KFC' THEN 'https://logo.clearbit.com/kfc.co.in'
  WHEN 'McDonalds' THEN 'https://logo.clearbit.com/mcdonalds.in'
  WHEN 'Burger King' THEN 'https://logo.clearbit.com/burgerking.in'
  
  -- Travel
  WHEN 'MakeMyTrip' THEN 'https://logo.clearbit.com/makemytrip.com'
  WHEN 'EaseMyTrip' THEN 'https://logo.clearbit.com/easemytrip.com'
  WHEN 'Goibibo' THEN 'https://logo.clearbit.com/goibibo.com'
  WHEN 'Yatra' THEN 'https://logo.clearbit.com/yatra.com'
  WHEN 'Booking.com' THEN 'https://logo.clearbit.com/booking.com'
  
  -- OTT Platforms
  WHEN 'Netflix' THEN 'https://logo.clearbit.com/netflix.com'
  WHEN 'Amazon Prime Video' THEN 'https://logo.clearbit.com/primevideo.com'
  WHEN 'Disney+ Hotstar' THEN 'https://logo.clearbit.com/hotstar.com'
  WHEN 'SonyLIV' THEN 'https://logo.clearbit.com/sonyliv.com'
  WHEN 'ZEE5' THEN 'https://logo.clearbit.com/zee5.com'
  
  -- Electronics
  WHEN 'Croma' THEN 'https://logo.clearbit.com/croma.com'
  WHEN 'Reliance Digital' THEN 'https://logo.clearbit.com/reliancedigital.in'
  
  ELSE logo_url -- Keep existing if no match
END
WHERE merchant_name IN (
  'Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa Fashion', 'Lifestyle', 'Tata CLiQ Fashion',
  'Swiggy', 'Zomato', 'Dominos', 'Pizza Hut', 'KFC', 'McDonalds', 'Burger King',
  'MakeMyTrip', 'EaseMyTrip', 'Goibibo', 'Yatra', 'Booking.com',
  'Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'SonyLIV', 'ZEE5',
  'Croma', 'Reliance Digital'
);