import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Improved keep-alive mechanism with smart detection
 * Only performs checks when app becomes active again
 */
export function useKeepAlive() {
  useEffect(() => {
    let isActive = true;
    let lastActivityTime = Date.now();
    const INACTIVITY_THRESHOLD = 60000; // 1 minute
    
    const performSessionRefresh = async () => {
      if (!isActive) return;
      
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) throw error;
        console.log('Session refreshed successfully');
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    };

    // Check if session needs refresh when user becomes active
    const checkSessionOnActivity = async () => {
      const now = Date.now();
      const inactiveTime = now - lastActivityTime;
      
      if (inactiveTime > INACTIVITY_THRESHOLD) {
        await performSessionRefresh();
      }
      
      lastActivityTime = now;
    };

    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSessionOnActivity();
      }
    };

    // Listen for user activity
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > INACTIVITY_THRESHOLD) {
        checkSessionOnActivity();
      }
      lastActivityTime = now;
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);
}

