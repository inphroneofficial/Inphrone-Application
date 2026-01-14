
-- Fix 1: Add admin role for inphroneofficial@gmail.com
INSERT INTO user_roles (user_id, role, granted_by)
VALUES (
  'a487bf69-ce88-4a42-88d7-42c84ac124b1'::uuid,
  'admin'::app_role,
  'a487bf69-ce88-4a42-88d7-42c84ac124b1'::uuid
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Fix 2: Update incorrect coupon tracking links
UPDATE coupon_pool 
SET tracking_link = 'https://www.flipkart.com'
WHERE merchant_name = 'Flipkart' AND tracking_link = 'https://www.flip.com';

UPDATE coupon_pool 
SET tracking_link = 'https://www.makemytrip.com'
WHERE merchant_name = 'MakeMyTrip' AND tracking_link = 'https://www.mmt.com';

UPDATE coupon_pool 
SET tracking_link = 'https://www.bookmyshow.com'
WHERE merchant_name = 'BookMyShow' AND tracking_link = 'https://www.bms.com';

UPDATE coupon_pool 
SET tracking_link = 'https://www.vijaysales.com'
WHERE merchant_name = 'Vijay Sales' AND tracking_link = 'https://www.vijay.com';

UPDATE coupon_pool 
SET tracking_link = 'https://www.amazon.in'
WHERE merchant_name = 'Amazon' AND (tracking_link = 'https://www.amazon.com' OR tracking_link LIKE '%amazon%');

UPDATE coupon_pool 
SET tracking_link = 'https://www.myntra.com'
WHERE merchant_name = 'Myntra' AND tracking_link != 'https://www.myntra.com';

UPDATE coupon_pool 
SET tracking_link = 'https://www.ajio.com'
WHERE merchant_name = 'AJIO' AND tracking_link != 'https://www.ajio.com';

UPDATE coupon_pool 
SET tracking_link = 'https://www.swiggy.com'
WHERE merchant_name = 'Swiggy' AND tracking_link != 'https://www.swiggy.com';

UPDATE coupon_pool 
SET tracking_link = 'https://www.zomato.com'
WHERE merchant_name = 'Zomato' AND tracking_link != 'https://www.zomato.com';
