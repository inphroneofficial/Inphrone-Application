import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  page?: string;
  timestamp?: string;
}

/**
 * Custom analytics tracking hook - no external API keys required
 */
export function useAnalyticsTracking() {
  // Track page views
  const trackPageView = useCallback(async (pageName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        page_name: pageName,
        session_start: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, []);

  // Track custom events
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store in coupon_analytics table which supports event tracking
      await supabase.from('coupon_analytics').insert({
        user_id: user.id,
        event_type: event.event_type,
        event_data: {
          ...event.event_data,
          page: event.page,
          timestamp: event.timestamp || new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  // Track feature usage
  const trackFeatureUsage = useCallback(async (featureName: string, metadata?: Record<string, any>) => {
    await trackEvent({
      event_type: 'feature_usage',
      event_data: {
        feature: featureName,
        ...metadata,
      },
    });
  }, [trackEvent]);

  // Track conversion events
  const trackConversion = useCallback(async (conversionType: string, value?: number) => {
    await trackEvent({
      event_type: 'conversion',
      event_data: {
        conversion_type: conversionType,
        value,
      },
    });
  }, [trackEvent]);

  // Track errors
  const trackError = useCallback(async (errorMessage: string, errorStack?: string, context?: Record<string, any>) => {
    await trackEvent({
      event_type: 'error',
      event_data: {
        message: errorMessage,
        stack: errorStack,
        ...context,
      },
    });
  }, [trackEvent]);

  // Track user engagement
  const trackEngagement = useCallback(async (action: string, target?: string, metadata?: Record<string, any>) => {
    await trackEvent({
      event_type: 'engagement',
      event_data: {
        action,
        target,
        ...metadata,
      },
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackFeatureUsage,
    trackConversion,
    trackError,
    trackEngagement,
  };
}

/**
 * Auto-track page views on route change
 */
export function useAutoPageTracking(pageName: string) {
  const { trackPageView } = useAnalyticsTracking();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}

/**
 * Track user session duration
 */
export function useSessionTracking() {
  useEffect(() => {
    const startTime = Date.now();
    
    const handleBeforeUnload = async () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // Use sendBeacon for reliable tracking before page unload
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_activity_logs`,
          JSON.stringify({
            user_id: user.id,
            page_name: 'session',
            duration_seconds: duration,
            session_end: new Date().toISOString(),
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
