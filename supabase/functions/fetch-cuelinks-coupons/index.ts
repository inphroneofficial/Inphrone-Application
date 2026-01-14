import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Category mapping from frontend to database values
const CATEGORY_MAP: Record<string, string> = {
  'ott': 'ott',
  'movies': 'movies',
  'electronics': 'electronics',
  'food': 'food',
  'travel': 'travel',
  'fashion': 'fashion',
  'lifestyle': 'fashion',
};

// Currency mapping by country code
const CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
  'IN': { code: 'INR', symbol: '₹' },
  'US': { code: 'USD', symbol: '$' },
  'GB': { code: 'GBP', symbol: '£' },
  'EU': { code: 'EUR', symbol: '€' },
  'AU': { code: 'AUD', symbol: 'A$' },
  'CA': { code: 'CAD', symbol: 'C$' },
  'JP': { code: 'JPY', symbol: '¥' },
  'CN': { code: 'CNY', symbol: '¥' },
  'SG': { code: 'SGD', symbol: 'S$' },
  'AE': { code: 'AED', symbol: 'د.إ' },
  'DE': { code: 'EUR', symbol: '€' },
  'FR': { code: 'EUR', symbol: '€' },
};

// Country name to ISO code mapping
const COUNTRY_CODE_MAP: Record<string, string> = {
  'india': 'IN',
  'united states': 'US',
  'usa': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'canada': 'CA',
  'australia': 'AU',
  'germany': 'DE',
  'france': 'FR',
  'japan': 'JP',
  'singapore': 'SG',
  'united arab emirates': 'AE',
  'uae': 'AE',
};

// Known merchant logo URLs for reliable display
const KNOWN_MERCHANT_LOGOS: Record<string, string> = {
  'amazon': 'https://logo.clearbit.com/amazon.in',
  'flipkart': 'https://logo.clearbit.com/flipkart.com',
  'myntra': 'https://logo.clearbit.com/myntra.com',
  'swiggy': 'https://logo.clearbit.com/swiggy.com',
  'zomato': 'https://logo.clearbit.com/zomato.com',
  'netflix': 'https://logo.clearbit.com/netflix.com',
  'hotstar': 'https://logo.clearbit.com/hotstar.com',
  'prime': 'https://logo.clearbit.com/primevideo.com',
  'zee5': 'https://logo.clearbit.com/zee5.com',
  'sony': 'https://logo.clearbit.com/sonyliv.com',
  'bookmyshow': 'https://logo.clearbit.com/bookmyshow.com',
  'pvr': 'https://logo.clearbit.com/pvrcinemas.com',
  'makemytrip': 'https://logo.clearbit.com/makemytrip.com',
  'goibibo': 'https://logo.clearbit.com/goibibo.com',
  'ixigo': 'https://logo.clearbit.com/ixigo.com',
  'uber': 'https://logo.clearbit.com/uber.com',
  'ola': 'https://logo.clearbit.com/olacabs.com',
  'paytm': 'https://logo.clearbit.com/paytm.com',
  'phonepe': 'https://logo.clearbit.com/phonepe.com',
  'ajio': 'https://logo.clearbit.com/ajio.com',
  'meesho': 'https://logo.clearbit.com/meesho.com',
  'nykaa': 'https://logo.clearbit.com/nykaa.com',
  'tata': 'https://logo.clearbit.com/tatacliq.com',
  'croma': 'https://logo.clearbit.com/croma.com',
  'reliance': 'https://logo.clearbit.com/reliancedigital.in',
  'jiomart': 'https://logo.clearbit.com/jiomart.com',
  'bigbasket': 'https://logo.clearbit.com/bigbasket.com',
  'blinkit': 'https://logo.clearbit.com/blinkit.com',
  'zepto': 'https://logo.clearbit.com/zeptonow.com',
  'dominos': 'https://logo.clearbit.com/dominos.co.in',
  'mcdonalds': 'https://logo.clearbit.com/mcdonalds.co.in',
  'kfc': 'https://logo.clearbit.com/kfc.co.in',
  'subway': 'https://logo.clearbit.com/subway.com',
  'starbucks': 'https://logo.clearbit.com/starbucks.com',
};

// Normalize logo URL
function normalizeLogoUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

// Get logo for merchant
function getMerchantLogo(merchantName: string, providedLogo: string | null): string {
  if (providedLogo && isValidLogoUrl(providedLogo)) {
    return normalizeLogoUrl(providedLogo);
  }

  const lowerName = merchantName.toLowerCase();

  for (const [key, logo] of Object.entries(KNOWN_MERCHANT_LOGOS)) {
    if (lowerName.includes(key)) return logo;
  }

  const cleanName = lowerName
    .replace(/\s+india$/i, "")
    .replace(/\.com$/i, "")
    .replace(/\.in$/i, "")
    .replace(/\s+/g, "")
    .trim();

  if (cleanName.length >= 3) {
    return `https://logo.clearbit.com/${cleanName}.com`;
  }

  return "";
}

// Validate if a URL is likely a logo image
function isValidLogoUrl(url: string | null): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase().trim();

  const invalidKeywords = ["banner", "creative", "advertisement", "ad_"];
  if (invalidKeywords.some((k) => lowerUrl.includes(k))) return false;

  const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"]; 
  if (validExtensions.some((ext) => lowerUrl.includes(ext))) return true;

  const logoHints = ["logo", "brand", "merchant", "store", "company"];
  return logoHints.some((h) => lowerUrl.includes(h));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { user_id, user_country, category, exclude_ids = [] } = await req.json().catch(() => ({ 
      user_id: null,
      user_country: 'IN',
      category: null,
      exclude_ids: []
    }));
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('=== COUPON FETCH DEBUG ===');
    console.log('User ID:', user_id);
    console.log('Input Country:', user_country);
    
    // Detect country code from user input
    let countryCode = 'IN';
    if (user_country) {
      const lowerCountry = user_country.toLowerCase().trim();
      if (lowerCountry.length === 2) {
        countryCode = lowerCountry.toUpperCase();
      } else {
        countryCode = COUNTRY_CODE_MAP[lowerCountry] || 'IN';
      }
    }
    
    console.log('Resolved Country Code:', countryCode);
    
    const currency = CURRENCY_MAP[countryCode] || CURRENCY_MAP['IN'];
    console.log('Currency:', currency);

    const normalizedCategory = (category || 'electronics').toLowerCase().trim();
    const fetchCategory = CATEGORY_MAP[normalizedCategory] || normalizedCategory;
    console.log('Category:', category, '-> Fetching:', fetchCategory);

    // CRITICAL FIX: Strict expiry filter - exclude coupons expiring within 1 hour
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    // Query coupon pool with strict country and expiry filtering
    // Also exclude coupons with 3+ thumbs down (invalid reports)
    let query = supabaseClient
      .from('coupon_pool')
      .select('*')
      .eq('is_active', true)
      .eq('category', fetchCategory)
      .gte('expires_at', oneHourFromNow) // Must expire more than 1 hour from now
      .lt('thumbs_down', 3) // Exclude heavily reported coupons
      .order('is_verified', { ascending: false }) // Verified coupons first
      .order('thumbs_up', { ascending: false }) // Then by most liked
      .order('times_shown', { ascending: true })
      .limit(200);

    // Try country-specific coupons first
    const { data: countryCoupons, error: countryError } = await query.eq('country_code', countryCode);
    
    let couponPool = countryCoupons;
    
    // If no country-specific coupons, try India (largest pool) or any
    if (!couponPool || couponPool.length === 0) {
      console.log('No coupons for', countryCode, ', trying IN...');
      const { data: indiaCoupons } = await supabaseClient
        .from('coupon_pool')
        .select('*')
        .eq('is_active', true)
        .eq('category', fetchCategory)
        .eq('country_code', 'IN')
        .gte('expires_at', oneHourFromNow)
        .lt('thumbs_down', 3)
        .order('is_verified', { ascending: false })
        .order('thumbs_up', { ascending: false })
        .order('times_shown', { ascending: true })
        .limit(200);
      
      couponPool = indiaCoupons;
      
      // If still no coupons, get any available
      if (!couponPool || couponPool.length === 0) {
        console.log('No coupons for IN either, getting any...');
        const { data: anyCoupons } = await supabaseClient
          .from('coupon_pool')
          .select('*')
          .eq('is_active', true)
          .eq('category', fetchCategory)
          .gte('expires_at', oneHourFromNow)
          .lt('thumbs_down', 3)
          .order('is_verified', { ascending: false })
          .order('thumbs_up', { ascending: false })
          .order('times_shown', { ascending: true })
          .limit(200);
        
        couponPool = anyCoupons;
      }
    }

    console.log('Coupon pool count:', couponPool?.length || 0);

    // Get user's previously shown coupons (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: userCoupons } = await supabaseClient
      .from('coupons')
      .select('pool_coupon_id')
      .eq('user_id', user_id)
      .not('pool_coupon_id', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const shownCouponIds = new Set([
      ...(userCoupons?.map((c: any) => c.pool_coupon_id) || []),
      ...exclude_ids
    ]);
    
    console.log('Previously shown/excluded:', shownCouponIds.size);
    
    // Filter out already shown coupons
    const availableCoupons = (couponPool || []).filter((c: any) => !shownCouponIds.has(c.id));
    console.log('Available unseen coupons:', availableCoupons.length);
    
    // Select coupons - prioritize verified ones
    let selectedCoupons;
    if (availableCoupons.length >= 5) {
      // Prioritize verified coupons
      const verified = availableCoupons.filter((c: any) => c.is_verified);
      const unverified = availableCoupons.filter((c: any) => !c.is_verified);
      
      // Take verified first, then fill with unverified
      const shuffledVerified = verified.sort(() => 0.5 - Math.random());
      const shuffledUnverified = unverified.sort(() => 0.5 - Math.random());
      
      selectedCoupons = [...shuffledVerified, ...shuffledUnverified].slice(0, 5);
    } else if (availableCoupons.length > 0) {
      selectedCoupons = availableCoupons;
    } else {
      // Fall back to least shown coupons
      const shuffledPool = (couponPool || []).sort(() => 0.5 - Math.random());
      selectedCoupons = shuffledPool.slice(0, 5);
    }

    console.log('Selected coupons:', selectedCoupons.length);

    // Map coupons with improved data
    const coupons = selectedCoupons.map((coupon: any) => {
      const logoUrl = getMerchantLogo(coupon.merchant_name, coupon.logo_url);
      
      return {
        id: coupon.id,
        pool_id: coupon.id,
        code: coupon.coupon_code || '',
        merchant_name: coupon.merchant_name,
        offer_text: coupon.offer_text,
        tracking_link: coupon.tracking_link,
        discount: coupon.discount,
        discount_type: coupon.discount_type || 'percentage',
        logo_url: logoUrl,
        expiresAt: coupon.expires_at,
        category: coupon.category,
        currencyCode: coupon.currency_code || currency.code,
        currencySymbol: coupon.currency_symbol || currency.symbol,
        terms_and_conditions: coupon.terms_and_conditions || '',
        // Validation data
        is_verified: coupon.is_verified || false,
        thumbs_up: coupon.thumbs_up || 0,
        thumbs_down: coupon.thumbs_down || 0,
        country_code: coupon.country_code || countryCode,
      };
    });

    // Update times_shown counter
    if (selectedCoupons.length > 0) {
      for (const coupon of selectedCoupons) {
        await supabaseClient
          .from('coupon_pool')
          .update({ 
            times_shown: (coupon.times_shown || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', coupon.id);
      }
    }

    console.log('=== RETURNING', coupons.length, 'COUPONS ===');

    return new Response(
      JSON.stringify({ 
        coupons, 
        category: fetchCategory,
        country: countryCode,
        currency: currency,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in fetch-cuelinks-coupons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Generate minimal fallback coupons
    const fallbackCoupons = [
      {
        id: 'fallback-1',
        pool_id: 'fallback-1',
        code: 'SAVE15',
        merchant_name: 'Shopping Deal',
        offer_text: 'Get 15% off on your purchase',
        tracking_link: 'https://www.example.com',
        discount: '15',
        discount_type: 'percentage',
        logo_url: '',
        category: 'fashion',
        currencyCode: 'INR',
        currencySymbol: '₹',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        terms_and_conditions: 'Terms and conditions apply.',
        is_verified: false,
        thumbs_up: 0,
        thumbs_down: 0,
        country_code: 'IN',
      },
    ];

    console.log('Using fallback coupons due to error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        coupons: fallbackCoupons,
        fallback: true,
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  }
});
