import { useState, useEffect } from 'react';

interface LocationData {
  country: string;
  countryCode: string;
  state: string;
  city: string;
  timezone: string;
  loading: boolean;
  error: string | null;
}

export function useLocationDetection() {
  const [location, setLocation] = useState<LocationData>({
    country: '',
    countryCode: '',
    state: '',
    city: '',
    timezone: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Try multiple IP-based geolocation services for better reliability
      const ipServices = [
        { url: 'https://ipapi.co/json/', parser: (data: any) => ({
          country: data.country_name || '',
          countryCode: data.country_code || '',
          state: data.region || '',
          city: data.city || ''
        })},
        { url: 'https://ipwho.is/', parser: (data: any) => ({
          country: data.country || '',
          countryCode: data.country_code || '',
          state: data.region || '',
          city: data.city || ''
        })},
        { url: 'https://ip-api.com/json/?fields=status,country,countryCode,regionName,city', parser: (data: any) => ({
          country: data.country || '',
          countryCode: data.countryCode || '',
          state: data.regionName || '',
          city: data.city || ''
        })}
      ];

      for (const service of ipServices) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(service.url, {
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            const parsed = service.parser(data);
            
            if (parsed.country && parsed.city) {
              setLocation({
                ...parsed,
                timezone: timezone,
                loading: false,
                error: null,
              });
              return;
            }
          }
        } catch (serviceError) {
          console.warn(`IP service ${service.url} failed:`, serviceError);
          continue;
        }
      }

      // Fallback to browser geolocation if IP-based fails
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Reverse geocoding using Nominatim (OpenStreetMap)
              const { latitude, longitude } = position.coords;
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                {
                  headers: { 'Accept-Language': 'en' }
                }
              );
              
              if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                const address = geoData.address || {};
                
                setLocation({
                  country: address.country || '',
                  countryCode: address.country_code?.toUpperCase() || '',
                  state: address.state || address.region || '',
                  city: address.city || address.town || address.village || '',
                  timezone: timezone,
                  loading: false,
                  error: null,
                });
              }
            } catch (err) {
              console.error('Reverse geocoding failed:', err);
              setLocation(prev => ({
                ...prev,
                timezone: timezone,
                loading: false,
                error: 'Could not determine location details',
              }));
            }
          },
          (err) => {
            console.error('Geolocation error:', err);
            setLocation({
              country: '',
              countryCode: '',
              state: '',
              city: '',
              timezone: timezone,
              loading: false,
              error: 'Location access denied',
            });
          },
          { timeout: 10000, maximumAge: 300000 }
        );
      } else {
        setLocation({
          country: '',
          countryCode: '',
          state: '',
          city: '',
          timezone: timezone,
          loading: false,
          error: 'Geolocation not supported',
        });
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setLocation({
        country: '',
        countryCode: '',
        state: '',
        city: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        loading: false,
        error: 'Failed to detect location',
      });
    }
  };

  return { ...location, refetch: detectLocation };
}

// Convert country name to ISO 3166-1 alpha-2 code
export function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
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
    'brazil': 'BR',
    'mexico': 'MX',
    'spain': 'ES',
    'italy': 'IT',
    'netherlands': 'NL',
    'south africa': 'ZA',
    'singapore': 'SG',
    'malaysia': 'MY',
    'indonesia': 'ID',
    'thailand': 'TH',
    'vietnam': 'VN',
    'philippines': 'PH',
    'south korea': 'KR',
    'taiwan': 'TW',
    'hong kong': 'HK',
    'china': 'CN',
    'russia': 'RU',
    'poland': 'PL',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'switzerland': 'CH',
    'austria': 'AT',
    'belgium': 'BE',
    'ireland': 'IE',
    'new zealand': 'NZ',
    'united arab emirates': 'AE',
    'uae': 'AE',
    'saudi arabia': 'SA',
    'egypt': 'EG',
    'nigeria': 'NG',
    'kenya': 'KE',
    'pakistan': 'PK',
    'bangladesh': 'BD',
    'sri lanka': 'LK',
    'nepal': 'NP',
  };
  
  return countryMap[countryName.toLowerCase()] || 'IN';
}

// Get currency based on country code
export function getCurrencyForCountry(countryCode: string): { code: string; symbol: string } {
  const currencyMap: Record<string, { code: string; symbol: string }> = {
    'IN': { code: 'INR', symbol: '₹' },
    'US': { code: 'USD', symbol: '$' },
    'GB': { code: 'GBP', symbol: '£' },
    'EU': { code: 'EUR', symbol: '€' },
    'AU': { code: 'AUD', symbol: 'A$' },
    'CA': { code: 'CAD', symbol: 'C$' },
    'JP': { code: 'JPY', symbol: '¥' },
    'CN': { code: 'CNY', symbol: '¥' },
    'KR': { code: 'KRW', symbol: '₩' },
    'SG': { code: 'SGD', symbol: 'S$' },
    'AE': { code: 'AED', symbol: 'د.إ' },
    'SA': { code: 'SAR', symbol: '﷼' },
    'BR': { code: 'BRL', symbol: 'R$' },
    'MX': { code: 'MXN', symbol: '$' },
    'ZA': { code: 'ZAR', symbol: 'R' },
  };
  
  return currencyMap[countryCode] || currencyMap['IN'];
}
