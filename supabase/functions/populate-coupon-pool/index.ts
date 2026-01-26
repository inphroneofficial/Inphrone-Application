import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Populate coupon pool attempt without authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify the user's token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Invalid token for populate coupon pool attempt:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Verify admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error(`Non-admin user ${user.id} attempted populate-coupon-pool`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.id} populating coupon pool with 500+ premium Indian offers...`);

    // Clear existing pool to avoid duplicates
    await supabaseClient.from('coupon_pool').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const premiumCoupons = [];
    // Set expiry to 2099 - coupons in pool never expire globally
    // Individual user claims have their own 6-day expiry
    const expiresAt = new Date('2099-12-31T23:59:59Z');

    // OTT/Streaming Platforms (50 coupons)
    const ottPlatforms = [
      { name: 'Netflix India', code: 'NETFLIX' },
      { name: 'Amazon Prime Video', code: 'PRIME' },
      { name: 'Disney+ Hotstar', code: 'HOTSTAR' },
      { name: 'ZEE5', code: 'ZEE5' },
      { name: 'SonyLIV', code: 'SONYLIV' },
      { name: 'Voot', code: 'VOOT' },
      { name: 'MX Player', code: 'MXPLAYER' },
      { name: 'Jio Cinema', code: 'JIOCINEMA' },
      { name: 'ALTBalaji', code: 'ALTBALAJI' },
      { name: 'Eros Now', code: 'EROSNOW' },
    ];

    for (let i = 0; i < 50; i++) {
      const platform = ottPlatforms[i % ottPlatforms.length];
      const discounts = [150, 200, 250, 300, 350, 400, 20, 25, 30, 35, 40, 50];
      const discount = discounts[i % discounts.length];
      const isPercentage = discount <= 50;
      
      premiumCoupons.push({
        merchant_name: platform.name,
        offer_text: isPercentage 
          ? `Get ${discount}% off on ${['annual', 'monthly', 'quarterly'][i % 3]} subscription`
          : `Flat ₹${discount} off on premium plan`,
        tracking_link: `https://www.${platform.code.toLowerCase()}.com`,
        coupon_code: `${platform.code}${discount}${i}`,
        discount: discount.toString(),
        discount_type: isPercentage ? 'percentage' : 'flat',
        logo_url: null,
        category: 'ott',
        currency_code: 'INR',
        currency_symbol: '₹',
        country_code: 'IN',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    // Movies/Cinema Tickets (50 coupons)
    const cinemas = [
      { name: 'BookMyShow', code: 'BMS' },
      { name: 'PVR Cinemas', code: 'PVR' },
      { name: 'INOX Movies', code: 'INOX' },
      { name: 'Cinepolis India', code: 'CINEPOLIS' },
      { name: 'Carnival Cinemas', code: 'CARNIVAL' },
    ];

    for (let i = 0; i < 50; i++) {
      const cinema = cinemas[i % cinemas.length];
      const discounts = [100, 150, 200, 250, 300, 15, 20, 25, 30, 40];
      const discount = discounts[i % discounts.length];
      const isPercentage = discount <= 40;
      
      premiumCoupons.push({
        merchant_name: cinema.name,
        offer_text: isPercentage
          ? `${discount}% off on movie tickets`
          : `Flat ₹${discount} off on tickets booking`,
        tracking_link: `https://www.${cinema.code.toLowerCase()}.com`,
        coupon_code: `${cinema.code}${discount}${i}`,
        discount: discount.toString(),
        discount_type: isPercentage ? 'percentage' : 'flat',
        logo_url: null,
        category: 'movies',
        currency_code: 'INR',
        currency_symbol: '₹',
        country_code: 'IN',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    // Electronics (100 coupons)
    const electronics = [
      { name: 'Flipkart', code: 'FLIP' },
      { name: 'Amazon India', code: 'AMZN' },
      { name: 'Croma', code: 'CROMA' },
      { name: 'Vijay Sales', code: 'VIJAY' },
      { name: 'Reliance Digital', code: 'RELIANCE' },
      { name: 'Tata CLiQ', code: 'TATACLIQ' },
    ];

    for (let i = 0; i < 100; i++) {
      const store = electronics[i % electronics.length];
      const discounts = [500, 1000, 1500, 2000, 3000, 5000, 10, 15, 20, 25, 30];
      const discount = discounts[i % discounts.length];
      const isPercentage = discount <= 30;
      
      premiumCoupons.push({
        merchant_name: store.name,
        offer_text: isPercentage
          ? `${discount}% off on ${['smartphones', 'laptops', 'tablets', 'TVs', 'accessories'][i % 5]}`
          : `Flat ₹${discount} off on electronics`,
        tracking_link: `https://www.${store.code.toLowerCase()}.com`,
        coupon_code: `${store.code}${discount}${i}`,
        discount: discount.toString(),
        discount_type: isPercentage ? 'percentage' : 'flat',
        logo_url: null,
        category: 'electronics',
        currency_code: 'INR',
        currency_symbol: '₹',
        country_code: 'IN',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    // Fashion (100 coupons)
    const fashion = [
      { name: 'Myntra', code: 'MYNTRA' },
      { name: 'Ajio', code: 'AJIO' },
      { name: 'Nykaa Fashion', code: 'NYKAA' },
      { name: 'Tata CLiQ Fashion', code: 'TATACLIQ' },
      { name: 'Lifestyle', code: 'LIFESTYLE' },
    ];

    for (let i = 0; i < 100; i++) {
      const store = fashion[i % fashion.length];
      const discounts = [300, 500, 700, 1000, 20, 25, 30, 40, 50, 60];
      const discount = discounts[i % discounts.length];
      const isPercentage = discount <= 60;
      
      premiumCoupons.push({
        merchant_name: store.name,
        offer_text: isPercentage
          ? `${discount}% off on ${['clothing', 'footwear', 'accessories', 'ethnic wear'][i % 4]}`
          : `Flat ₹${discount} off on fashion`,
        tracking_link: `https://www.${store.code.toLowerCase()}.com`,
        coupon_code: `${store.code}${discount}${i}`,
        discount: discount.toString(),
        discount_type: isPercentage ? 'percentage' : 'flat',
        logo_url: null,
        category: 'fashion',
        currency_code: 'INR',
        currency_symbol: '₹',
        country_code: 'IN',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    // Food Delivery (100 coupons)
    const food = [
      { name: 'Swiggy', code: 'SWIGGY' },
      { name: 'Zomato', code: 'ZOMATO' },
      { name: 'Dominos', code: 'DOMINOS' },
      { name: 'Pizza Hut', code: 'PIZZAHUT' },
      { name: 'KFC', code: 'KFC' },
    ];

    for (let i = 0; i < 100; i++) {
      const restaurant = food[i % food.length];
      const discounts = [100, 150, 200, 250, 300, 20, 30, 40, 50, 60];
      const discount = discounts[i % discounts.length];
      const isPercentage = discount <= 60;
      
      premiumCoupons.push({
        merchant_name: restaurant.name,
        offer_text: isPercentage
          ? `${discount}% off on food orders`
          : `Flat ₹${discount} off on orders`,
        tracking_link: `https://www.${restaurant.code.toLowerCase()}.com`,
        coupon_code: `${restaurant.code}${discount}${i}`,
        discount: discount.toString(),
        discount_type: isPercentage ? 'percentage' : 'flat',
        logo_url: null,
        category: 'food',
        currency_code: 'INR',
        currency_symbol: '₹',
        country_code: 'IN',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    // Travel (100 coupons)
    const travel = [
      { name: 'MakeMyTrip', code: 'MMT' },
      { name: 'Goibibo', code: 'GOIBIBO' },
      { name: 'Cleartrip', code: 'CLEAR' },
      { name: 'Yatra', code: 'YATRA' },
      { name: 'EaseMyTrip', code: 'EMT' },
    ];

    for (let i = 0; i < 100; i++) {
      const agency = travel[i % travel.length];
      const discounts = [500, 1000, 1500, 2000, 3000, 4000, 15, 20, 25, 30, 35];
      const discount = discounts[i % discounts.length];
      const isPercentage = discount <= 35;
      
      premiumCoupons.push({
        merchant_name: agency.name,
        offer_text: isPercentage
          ? `${discount}% off on ${['flights', 'hotels', 'holidays', 'trains'][i % 4]}`
          : `Flat ₹${discount} off on bookings`,
        tracking_link: `https://www.${agency.code.toLowerCase()}.com`,
        coupon_code: `${agency.code}${discount}${i}`,
        discount: discount.toString(),
        discount_type: isPercentage ? 'percentage' : 'flat',
        logo_url: null,
        category: 'travel',
        currency_code: 'INR',
        currency_symbol: '₹',
        country_code: 'IN',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });
    }

    console.log(`Inserting ${premiumCoupons.length} coupons into pool...`);

    // Insert in batches of 100
    let insertedCount = 0;
    for (let i = 0; i < premiumCoupons.length; i += 100) {
      const batch = premiumCoupons.slice(i, i + 100);
      const { error } = await supabaseClient
        .from('coupon_pool')
        .insert(batch);

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }
      insertedCount += batch.length;
      console.log(`Inserted batch: ${insertedCount}/${premiumCoupons.length}`);
    }

    console.log(`Admin ${user.id} successfully inserted ${insertedCount} coupons`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully populated coupon pool with ${insertedCount} premium Indian offers`,
        coupons: insertedCount,
        populatedBy: user.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error populating coupon pool:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
