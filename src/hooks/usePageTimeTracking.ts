import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to track user time spent on a page accurately
 * Handles tab visibility changes and browser close events
 */
export function usePageTimeTracking(pageName: string, userId: string | null) {
  const [sessionLogId, setSessionLogId] = useState<string | null>(null);
  const [lastActiveTime, setLastActiveTime] = useState<Date>(new Date());
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const sessionLogIdRef = useRef<string | null>(null);
  const lastActiveTimeRef = useRef<Date>(new Date());
  const accumulatedTimeRef = useRef<number>(0);

  // Keep refs in sync with state
  useEffect(() => {
    sessionLogIdRef.current = sessionLogId;
  }, [sessionLogId]);

  useEffect(() => {
    lastActiveTimeRef.current = lastActiveTime;
  }, [lastActiveTime]);

  useEffect(() => {
    accumulatedTimeRef.current = accumulatedTime;
  }, [accumulatedTime]);

  useEffect(() => {
    if (!userId || !pageName) return;

    const startTracking = async () => {
      const { data: logData } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          page_name: pageName,
          session_start: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (logData) {
        setSessionLogId(logData.id);
        setLastActiveTime(new Date());
      }
    };

    startTracking();

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left tab - accumulate time
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - lastActiveTimeRef.current.getTime()) / 1000);
        setAccumulatedTime(prev => prev + elapsed);
      } else {
        // User returned to tab - reset last active time
        setLastActiveTime(new Date());
      }
    };

    // Handle page unload/close - fire and forget update
    const handleBeforeUnload = () => {
      if (!sessionLogIdRef.current) return;

      const sessionEnd = new Date();
      
      // Calculate final duration
      let durationSeconds = accumulatedTimeRef.current;
      if (!document.hidden) {
        // Add time since last active if still on page
        durationSeconds += Math.floor((sessionEnd.getTime() - lastActiveTimeRef.current.getTime()) / 1000);
      }

      // Only save reasonable durations (less than 24 hours)
      if (durationSeconds > 0 && durationSeconds < 86400) {
        // Fire and forget - browser keeps connection alive briefly
        supabase
          .from('user_activity_logs')
          .update({
            session_end: sessionEnd.toISOString(),
            duration_seconds: durationSeconds,
          })
          .eq('id', sessionLogIdRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      const endTracking = async () => {
        if (!sessionLogIdRef.current) return;

        const { data: log } = await supabase
          .from('user_activity_logs')
          .select('session_start')
          .eq('id', sessionLogIdRef.current)
          .single();
        
        if (log) {
          const sessionEnd = new Date();
          const sessionStart = new Date(log.session_start);
          
          // Calculate final duration
          let durationSeconds = accumulatedTimeRef.current;
          if (!document.hidden) {
            // Add time since last active if still on page
            durationSeconds += Math.floor((sessionEnd.getTime() - lastActiveTimeRef.current.getTime()) / 1000);
          }

          // Only save reasonable durations (less than 24 hours)
          if (durationSeconds > 0 && durationSeconds < 86400) {
            await supabase
              .from('user_activity_logs')
              .update({
                session_end: sessionEnd.toISOString(),
                duration_seconds: durationSeconds,
              })
              .eq('id', sessionLogIdRef.current);
          }
        }
      };
      
      endTracking();
    };
  }, [userId, pageName]);

  return sessionLogId;
}
